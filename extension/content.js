(() => {
  if (globalThis.__aiImageTranslator) return;
  globalThis.__aiImageTranslator = true;
  let selecting = false, busy = false, language = 'Vietnamese', mode = 'overlay', host, output, controls;
  const geometry = globalThis.AITranslatorGeometry;
  const overlays = globalThis.AITranslatorOverlay;
  let previousCursor = '', lastImage, recaptureButton, newImageButton, selectingCapture = false;
  function stop() {
    if (selecting) document.documentElement.style.cursor = previousCursor;
    selecting = false;
  }
  function panel(text) {
    if (!host?.isConnected) {
      host = document.createElement('div');
      host.style.cssText = 'all:initial;position:fixed;right:16px;top:16px;z-index:2147483647;';
      const shadow = host.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style>:host{color-scheme:light}section{box-sizing:border-box;width:min(380px,90vw);max-height:75vh;overflow:auto;background:#fff;color:#17223c;border:1px solid #ccd4e4;border-radius:14px;padding:18px;box-shadow:0 10px 40px #0004;font:14px/1.65 system-ui}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}button{cursor:pointer;padding:6px 12px;border:1px solid #ccd4e4;border-radius:6px;background:#f4f6fc;color:#17223c}article{white-space:pre-wrap;overflow-wrap:anywhere}</style><section role="region" aria-label="Bản dịch ảnh"><header><strong>Dịch ảnh AI</strong><button>Đóng</button></header><article role="status" aria-live="polite"></article></section>`;
      output = shadow.querySelector('article');
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap';
      const toggle = document.createElement('button'), clear = document.createElement('button');
      toggle.textContent = overlays.visible ? 'Xem ảnh gốc' : 'Hiện bản dịch'; clear.textContent = 'Xóa lớp dịch';
      toggle.onclick = () => { toggle.textContent = overlays.toggle() ? 'Xem ảnh gốc' : 'Hiện bản dịch'; };
      clear.onclick = () => { overlays.clear(); actions.hidden = true; };
      actions.append(toggle, clear); shadow.querySelector('article').before(actions); controls = actions;
      recaptureButton = document.createElement('button'); recaptureButton.textContent = 'Chụp lại';
      recaptureButton.style.marginBottom = '10px';
      recaptureButton.onclick = () => recapture();
      newImageButton = document.createElement('button'); newImageButton.textContent = 'Chụp ảnh mới';
      newImageButton.style.cssText = 'margin:0 8px 10px 0;background:#345dde;color:#fff';
      newImageButton.onclick = () => beginSelection(true);
      actions.before(newImageButton, recaptureButton);
      shadow.querySelector('header button').onclick = () => {
        stop(); host.remove();
        chrome.runtime.sendMessage({ type: 'CLOSE_TRANSLATOR_PANEL' }).catch(() => {});
      };
      document.documentElement.append(host);
    }
    output.textContent = text;
    controls.hidden = !overlays.count;
    controls.firstElementChild.textContent = overlays.visible ? 'Xem ảnh gốc' : 'Hiện bản dịch';
    recaptureButton.disabled = busy;
    newImageButton.disabled = busy;
  }
  function beginSelection(capture = false) {
    if (busy) return;
    selectingCapture = capture;
    if (!selecting) previousCursor = document.documentElement.style.cursor;
    selecting = true; document.documentElement.style.cursor = 'crosshair';
    panel(capture ? 'Bấm vào ảnh mới muốn chụp và dịch. Nhấn Esc để hủy.' : 'Bấm vào ảnh để dịch. Nhấn Esc để hủy.');
  }
  function imageData(img) {
    const scale = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', .92);
  }
  async function readImage(img) {
    try { return imageData(img); } catch {
      const clean = new Image();
      clean.crossOrigin = 'anonymous';
      clean.src = img.currentSrc || img.src;
      await Promise.race([clean.decode(), new Promise((_, reject) => setTimeout(() => reject(new Error('Ảnh tải quá thời gian.')), 15000))]);
      return imageData(clean);
    }
  }
  async function captureImage(img) {
    panel('Đang chụp phần ảnh đang hiển thị…');
    const currentHost = host;
    currentHost.style.visibility = 'hidden';
    overlays.suspend(true);
    try {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const box = img.getBoundingClientRect();
      let layout;
      try { layout = geometry.measure(img); } catch (error) { if (mode === 'overlay') throw error; }
      const viewport = { width: innerWidth, height: innerHeight };
      const x = Math.max(0, box.left), y = Math.max(0, box.top);
      const rect = layout?.clip || { x, y, width: Math.min(viewport.width, box.right) - x, height: Math.min(viewport.height, box.bottom) - y };
      if (rect.width < 1 || rect.height < 1) throw new Error('Hãy cuộn để ảnh xuất hiện trên màn hình rồi chọn lại.');
      if (visualViewport && (Math.abs(visualViewport.scale - 1) > .01 || visualViewport.offsetLeft || visualViewport.offsetTop)) throw new Error('Hãy tắt phóng to bằng cử chỉ trước khi chụp ảnh.');
      const startX = scrollX, startY = scrollY;
      const result = await chrome.runtime.sendMessage({ type: 'CAPTURE_IMAGE_REGION', rect, viewport });
      const after = img.getBoundingClientRect();
      if (scrollX !== startX || scrollY !== startY || innerWidth !== viewport.width || innerHeight !== viewport.height || ['left', 'top', 'width', 'height'].some(key => Math.abs(after[key] - box[key]) > 1)) throw new Error('Trang đã di chuyển trong lúc chụp. Hãy giữ nguyên trang và chọn lại ảnh.');
      if (!result?.imageDataUrl || result.error) throw new Error(result?.error || 'Không chụp được ảnh. Hãy bấm biểu tượng extension rồi thử lại.');
      const source = layout ? geometry.sourceRect(result.rect || rect, layout.image) : undefined;
      return { imageDataUrl: result.imageDataUrl, source, partial: source ? source.x > .001 || source.y > .001 || source.x + source.width < .999 || source.y + source.height < .999 : box.left < 0 || box.top < 0 || box.right > viewport.width || box.bottom > viewport.height };
    } finally { currentHost.style.visibility = 'visible'; overlays.suspend(false); }
  }
  function visibleArea(img) {
    if (!img?.isConnected || !img.complete || !img.naturalWidth) return 0;
    try {
      const layout = geometry.measure(img);
      return layout.visible ? layout.clip.width * layout.clip.height : 0;
    } catch { return 0; }
  }
  function recapture() {
    if (busy) return false;
    let img = visibleArea(lastImage) > 0 ? lastImage : undefined;
    if (!img) {
      let largest = 0;
      for (const candidate of document.images) {
        const area = visibleArea(candidate);
        if (area > largest) { largest = area; img = candidate; }
      }
    }
    if (!img) { panel('Chưa có ảnh đang hiển thị để chụp. Hãy cuộn tới ảnh hoặc dùng “Chọn ảnh để dịch”.'); return false; }
    void translateImage(img, true);
    return true;
  }
  async function translateImage(img, forceCapture = false) {
    if (busy) return;
    stop(); busy = true; lastImage = img;
    panel('Đang đọc ảnh và dịch…');
    try {
      const originalUrl = location.href;
      const originalSrc = img.currentSrc || img.src, originalWidth = img.naturalWidth, originalHeight = img.naturalHeight;
      if (mode === 'overlay') geometry.measure(img);
      let imageDataUrl, source = { x: 0, y: 0, width: 1, height: 1 }, captured = false, partial = false;
      if (forceCapture) {
        ({ imageDataUrl, partial, source } = await captureImage(img)); captured = true;
      } else {
        try { imageDataUrl = await readImage(img); } catch {
          ({ imageDataUrl, partial, source } = await captureImage(img)); captured = true;
        }
      }
      if (location.href !== originalUrl || !img.isConnected || (img.currentSrc || img.src) !== originalSrc) throw new Error('Trang hoặc ảnh đã thay đổi. Hãy bấm “Chụp lại” trên trang mới.');
      panel(captured ? 'Đang dịch phần ảnh đã chụp. Vui lòng chờ…' : 'Đang dịch ảnh…');
      const result = await chrome.runtime.sendMessage({ type: 'TRANSLATE_IMAGE', imageDataUrl, language, mode });
      if (!result || result.error) throw new Error(result?.error || 'Kết nối extension bị gián đoạn.');
      if (location.href !== originalUrl || !img.isConnected || (img.currentSrc || img.src) !== originalSrc || img.naturalWidth !== originalWidth || img.naturalHeight !== originalHeight) throw new Error('Trang hoặc ảnh đã thay đổi trong lúc dịch. Hãy bấm “Chụp lại”.');
      let notice = '';
      if (mode === 'overlay') {
        if (!img.isConnected || (img.currentSrc || img.src) !== originalSrc || img.naturalWidth !== originalWidth || img.naturalHeight !== originalHeight) throw new Error('Ảnh đã thay đổi trong lúc dịch. Hãy chọn lại ảnh.');
        if (!Array.isArray(result.regions)) throw new Error('Backend chưa hỗ trợ vị trí chữ. Hãy khởi động lại npm start.');
        if (result.regions.length) {
          overlays.add(img, result.regions, source, language);
          notice = `Đã thay ${result.regions.length} vùng chữ. Dùng “Xem ảnh gốc” để so sánh. Vị trí do AI ước lượng; nền được che bằng màu đơn.\n\n`;
        } else notice = 'Không tìm thấy vùng chữ đọc được.\n\n';
      }
      panel(notice + (partial ? 'Chỉ dịch phần ảnh đang hiển thị. Cuộn tới phần tiếp theo rồi chọn lại ảnh để dịch tiếp.\n\n' : '') + result.translation);
    } catch (error) { panel(error.message); }
    finally { busy = false; if (recaptureButton) recaptureButton.disabled = false; if (newImageButton) newImageButton.disabled = false; }
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && selecting) { stop(); panel('Đã hủy chọn ảnh.'); } }, true);
  document.addEventListener('click', event => {
    if (!selecting || event.composedPath().includes(host)) return;
    const img = event.composedPath().find(item => item instanceof HTMLImageElement);
    if (!img?.complete || !img.naturalWidth) return;
    event.preventDefault(); event.stopImmediatePropagation();
    void translateImage(img, selectingCapture);
  }, true);
  chrome.runtime.onMessage.addListener((message, sender, reply) => {
    if (!['START_IMAGE_TRANSLATION', 'RECAPTURE_IMAGE', 'RESUME_TRANSLATOR'].includes(message.type)) return;
    if (message.type === 'RESUME_TRANSLATOR' && host?.isConnected) { reply({ ok: true }); return; }
    if (busy) { panel('Đang dịch ảnh trước. Vui lòng chờ.'); reply({ ok: false }); return; }
    language = message.language;
    mode = message.mode === 'panel' ? 'panel' : 'overlay';
    if (message.type === 'RESUME_TRANSLATOR') { panel('Đã chuyển trang. Bấm “Chụp ảnh mới” để chọn ảnh hoặc “Chụp lại” để chụp ảnh lớn nhất đang hiển thị.'); reply({ ok: true }); return; }
    if (message.type === 'RECAPTURE_IMAGE') { reply({ ok: recapture() }); return; }
    beginSelection(); reply({ ok: true });
  });
})();
