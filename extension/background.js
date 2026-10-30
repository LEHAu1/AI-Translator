importScripts('pdf-capture.js');

async function translateViaBackend(message) {
  const response = await fetch('http://127.0.0.1:3000/api/translate-image', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageDataUrl: message.imageDataUrl, targetLanguage: message.language, mode: message.mode || 'panel' }),
    signal: AbortSignal.timeout(100000)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Không thể dịch ảnh.');
  return data;
}

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (['OPEN_PDF_CAPTURE', 'CAPTURE_PDF_NEXT', 'TRANSLATE_PDF_IMAGE'].includes(message.type)) {
    pdfCaptureRequest(message, sender).then(reply).catch(error => reply({ error: error.message === 'Failed to fetch' ? 'Không kết nối được backend. Hãy mở ứng dụng AI Image Translator hoặc chạy npm start.' : error.message }));
    return true;
  }
  if (message.type === 'CLOSE_TRANSLATOR_PANEL' && sender.tab && sender.frameId === 0 && sender.id === chrome.runtime.id) {
    chrome.storage.session.remove('translator-tab-' + sender.tab.id).then(() => reply({ ok: true }));
    return true;
  }
  if (!['TRANSLATE_IMAGE', 'CAPTURE_IMAGE_REGION'].includes(message.type) || !sender.tab || sender.frameId !== 0 || sender.id !== chrome.runtime.id) return;
  (async () => {
    if (message.type === 'CAPTURE_IMAGE_REGION') {
      const { rect, viewport } = message;
      if (!rect || !viewport || ![rect.x, rect.y, rect.width, rect.height, viewport.width, viewport.height].every(Number.isFinite) || rect.x < 0 || rect.y < 0 || rect.width < 1 || rect.height < 1 || viewport.width < 1 || viewport.height < 1 || rect.x + rect.width > viewport.width + 1 || rect.y + rect.height > viewport.height + 1) throw new Error('Vùng ảnh chụp không hợp lệ.');
      async function checkTab() {
        const [active] = await chrome.tabs.query({ active: true, windowId: sender.tab.windowId });
        if (active?.id !== sender.tab.id) throw new Error('Hãy quay lại tab chứa ảnh và chọn ảnh lần nữa.');
      }
      await checkTab();
      const screenshot = await chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' });
      await checkTab();
      const bitmap = await createImageBitmap(await (await fetch(screenshot)).blob());
      try {
        const sx = bitmap.width / viewport.width, sy = bitmap.height / viewport.height;
        const x = Math.ceil(rect.x * sx), y = Math.ceil(rect.y * sy);
        const width = Math.min(bitmap.width, Math.floor((rect.x + rect.width) * sx)) - x;
        const height = Math.min(bitmap.height, Math.floor((rect.y + rect.height) * sy)) - y;
        if (width < 1 || height < 1) throw new Error('Ảnh không nằm trong vùng đang hiển thị.');
        const scale = Math.min(1, 2400 / Math.max(width, height));
        const canvas = new OffscreenCanvas(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, x, y, width, height, 0, 0, canvas.width, canvas.height);
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: .92 });
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = '';
        for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
        reply({ imageDataUrl: 'data:image/jpeg;base64,' + btoa(binary), rect: { x: x / sx, y: y / sy, width: width / sx, height: height / sy } });
      } finally { bitmap.close(); }
      return;
    }
    reply(await translateViaBackend(message));
  })().catch(error => reply({ error: error.message === 'Failed to fetch' ? 'Không kết nối được backend. Hãy chạy npm start.' : error.message }));
  return true;
});

// Restore controls on same-origin navigation without taking a screenshot or calling AI.
chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (change.status !== 'complete') return;
  (async () => {
    const key = 'translator-tab-' + tabId;
    const saved = (await chrome.storage.session.get(key))[key];
    if (!saved) return;
    if (!tab.url || new URL(tab.url).origin !== saved.origin) {
      await chrome.storage.session.remove(key);
      return;
    }
    await chrome.scripting.executeScript({ target: { tabId }, files: ['geometry.js', 'overlay.js', 'content.js'] });
    await chrome.tabs.sendMessage(tabId, { type: 'RESUME_TRANSLATOR', language: saved.language, mode: saved.mode });
  })().catch(() => {});
});
chrome.tabs.onRemoved.addListener(tabId => {
  chrome.storage.session.remove('translator-tab-' + tabId).catch(() => {});
  chrome.storage.session.get(PDF_SESSION_KEY).then(data => { if (data[PDF_SESSION_KEY]?.viewerTabId === tabId) return chrome.storage.session.remove(PDF_SESSION_KEY); }).catch(() => {});
});
