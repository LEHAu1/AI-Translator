// Runs in the service worker. Screenshots stay local until the viewer sends a crop.
const PDF_SESSION_KEY = 'pdf-capture-session';
async function capturePdfTab(tabId) {
  const tab = await chrome.tabs.get(tabId);
  if (!/^(https?:|file:)/.test(tab.url || '')) throw new Error('Hãy mở tab PDF HTTP/HTTPS hoặc file PDF trên máy.');
  const checkActive = async () => {
    const [active] = await chrome.tabs.query({ active: true, windowId: tab.windowId });
    if (active?.id !== tab.id) throw new Error('Tab đã thay đổi trong lúc chụp. Hãy chọn lại tab PDF.');
    const current = await chrome.tabs.get(tabId);
    if (current.url !== tab.url) throw new Error('Trang PDF đã thay đổi trong lúc chụp. Hãy thử lại.');
  };
  await checkActive();
  let data;
  try { data = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }); }
  catch { throw new Error('Không chụp được PDF. Hãy bấm biểu tượng extension trên tab PDF để cấp quyền lại. Với file trên máy, bật “Cho phép truy cập vào URL của tệp” trong chi tiết extension.'); }
  await checkActive();
  const bitmap = await createImageBitmap(await (await fetch(data)).blob());
  try {
    const scale = Math.min(1, 3200 / Math.max(bitmap.width, bitmap.height));
    const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const bytes = new Uint8Array(await (await canvas.convertToBlob({ type: 'image/jpeg', quality: .95 })).arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    const imageDataUrl = 'data:image/jpeg;base64,' + btoa(binary);
    if (imageDataUrl.length > 8 * 1024 * 1024) throw new Error('Ảnh chụp quá lớn. Hãy giảm kích thước cửa sổ rồi thử lại.');
    return { tab, imageDataUrl };
  } finally { bitmap.close(); }
}

async function pdfCaptureRequest(message, sender) {
  if (sender.id !== chrome.runtime.id) throw new Error('Nguồn yêu cầu không hợp lệ.');
  const page = (sender.url || '').split('#')[0].split('?')[0];
  if (message.type === 'OPEN_PDF_CAPTURE') {
    if (page !== chrome.runtime.getURL('popup.html') || !Number.isInteger(message.tabId)) throw new Error('Yêu cầu chụp PDF không hợp lệ.');
    const { tab, imageDataUrl } = await capturePdfTab(message.tabId);
    const previous = (await chrome.storage.session.get(PDF_SESSION_KEY))[PDF_SESSION_KEY];
    const session = { id: crypto.randomUUID(), sourceTabId: tab.id, sourceWindowId: tab.windowId, origin: new URL(tab.url).origin, language: message.language || 'Vietnamese', imageDataUrl };
    let viewer;
    if (previous?.viewerTabId) { try { viewer = await chrome.tabs.get(previous.viewerTabId); } catch {} }
    await chrome.storage.session.set({ [PDF_SESSION_KEY]: session });
    const url = chrome.runtime.getURL('pdf-viewer.html') + '#' + session.id;
    if (viewer) {
      await chrome.tabs.update(viewer.id, { url, active: true });
      await chrome.windows.update(viewer.windowId, { focused: true });
    } else {
      const window = await chrome.windows.create({ url, type: 'popup', width: 1280, height: 900 });
      viewer = window.tabs?.[0];
      if (!viewer) throw new Error('Không mở được cửa sổ dịch PDF.');
    }
    await chrome.storage.session.set({ [PDF_SESSION_KEY]: { ...session, viewerTabId: viewer.id, viewerWindowId: viewer.windowId } });
    return { ok: true };
  }
  const session = (await chrome.storage.session.get(PDF_SESSION_KEY))[PDF_SESSION_KEY];
  // Extension-owned pages may omit sender.tab; their exact URL and session ID still authenticate the request.
  if (page !== chrome.runtime.getURL('pdf-viewer.html') || !session || session.id !== message.id || (sender.tab && session.viewerTabId !== sender.tab.id)) throw new Error('Phiên chụp đã đóng hoặc thay đổi. Hãy mở PDF và bấm “Chụp trang PDF” lại.');
  if (message.type === 'TRANSLATE_PDF_IMAGE') return translateViaBackend(message);
  if (message.type === 'CAPTURE_PDF_NEXT') {
    let source;
    try { source = await chrome.tabs.get(session.sourceTabId); }
    catch { throw new Error('Tab PDF gốc đã đóng. Hãy mở lại PDF rồi bấm “Chụp trang PDF”.'); }
    if (!source.url || new URL(source.url).origin !== session.origin) throw new Error('Tab đã chuyển sang website khác. Hãy bấm biểu tượng extension tại tab đó để cấp quyền chụp.');
    await chrome.tabs.update(source.id, { active: true });
    await chrome.windows.update(source.windowId, { focused: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      const { imageDataUrl } = await capturePdfTab(source.id);
      const current = (await chrome.storage.session.get(PDF_SESSION_KEY))[PDF_SESSION_KEY];
      if (current?.id !== session.id) throw new Error('Phiên chụp đã thay đổi. Hãy mở lại cửa sổ dịch PDF.');
      await chrome.storage.session.set({ [PDF_SESSION_KEY]: { ...current, imageDataUrl } });
      return { imageDataUrl };
    } finally { try { await chrome.windows.update(session.viewerWindowId, { focused: true }); } catch {} }
  }
  throw new Error('Thao tác PDF không hợp lệ.');
}
