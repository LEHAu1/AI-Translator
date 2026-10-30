(() => {
  const $ = selector => document.querySelector(selector);
  const source = $('#source'), resultImage = $('#result'), wrap = $('#source-wrap'), selection = $('#selection');
  const translate = $('#translate'), next = $('#next'), all = $('#all'), reset = $('#reset'), toggle = $('#toggle'), language = $('#language');
  const overlays = globalThis.AITranslatorOverlay;
  let crop, dragging, busy = false, epoch = 0, id = '', hasCapture = false;
  function status(text) { $('#status').textContent = text; }
  function controls() {
    translate.disabled = busy || !crop;
    all.disabled = reset.disabled = busy || !hasCapture;
    next.disabled = busy || !id;
    language.disabled = busy;
    toggle.disabled = busy || !overlays.count;
  }
  function clearResult() {
    overlays.clear(); resultImage.hidden = true; resultImage.removeAttribute('src');
    $('#empty').hidden = false; $('#text').textContent = ''; toggle.textContent = 'Xem ảnh gốc';
  }
  function drawSelection() {
    selection.hidden = !crop;
    if (crop) Object.assign(selection.style, { left: crop.x * 100 + '%', top: crop.y * 100 + '%', width: crop.width * 100 + '%', height: crop.height * 100 + '%' });
    controls();
  }
  function point(event) {
    const box = source.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)), y: Math.min(1, Math.max(0, (event.clientY - box.top) / box.height)) };
  }
  wrap.addEventListener('pointerdown', event => {
    if (busy || !hasCapture || event.button !== 0) return;
    dragging = { ...point(event), pointerId: event.pointerId }; crop = undefined;
    wrap.setPointerCapture(event.pointerId); event.preventDefault(); drawSelection();
  });
  wrap.addEventListener('pointermove', event => {
    if (!dragging || dragging.pointerId !== event.pointerId) return;
    const current = point(event);
    crop = { x: Math.min(current.x, dragging.x), y: Math.min(current.y, dragging.y), width: Math.abs(current.x - dragging.x), height: Math.abs(current.y - dragging.y) };
    drawSelection(); translate.disabled = true;
  });
  const endSelection = event => {
    if (!dragging || dragging.pointerId !== event.pointerId) return;
    dragging = undefined;
    if (wrap.hasPointerCapture(event.pointerId)) wrap.releasePointerCapture(event.pointerId);
    if (event.type === 'pointercancel' || !crop || crop.width * source.naturalWidth < 8 || crop.height * source.naturalHeight < 8) crop = undefined;
    drawSelection(); status(crop ? 'Vùng đã chọn sẵn sàng. Bấm “Dịch vùng đã chọn”.' : 'Kéo chuột để chọn một vùng đủ lớn trên ảnh.');
  };
  wrap.addEventListener('pointerup', endSelection); wrap.addEventListener('pointercancel', endSelection);
  all.onclick = () => { if (!busy && hasCapture) { crop = { x: 0, y: 0, width: 1, height: 1 }; drawSelection(); status('Đã chọn toàn bộ ảnh chụp. Kiểm tra nội dung trước khi gửi dịch.'); } };
  reset.onclick = () => { if (!busy) { crop = undefined; drawSelection(); } };
  toggle.onclick = () => { toggle.textContent = overlays.toggle() ? 'Xem ảnh gốc' : 'Hiện bản dịch'; };
  async function displayCapture(imageDataUrl, currentEpoch) {
    if (!/^data:image\/(jpeg|png);base64,/.test(imageDataUrl || '')) throw new Error('Ảnh chụp không hợp lệ. Hãy chụp lại từ tab PDF.');
    clearResult(); crop = dragging = undefined; hasCapture = false; source.hidden = true;
    drawSelection(); source.src = imageDataUrl; await source.decode();
    if (epoch !== currentEpoch) return;
    source.hidden = false; hasCapture = true; controls();
    status('Ảnh chụp đã sẵn sàng. Kéo chuột để khoanh trang PDF hoặc đoạn cần dịch.');
  }
  function cropData() {
    const x = Math.ceil(crop.x * source.naturalWidth), y = Math.ceil(crop.y * source.naturalHeight);
    const width = Math.floor((crop.x + crop.width) * source.naturalWidth) - x;
    const height = Math.floor((crop.y + crop.height) * source.naturalHeight) - y;
    if (width < 8 || height < 8) throw new Error('Vùng chọn quá nhỏ. Hãy chọn lại.');
    const scale = Math.min(1, 2400 / Math.max(width, height));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
    canvas.getContext('2d').drawImage(source, x, y, width, height, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', .95);
  }
  translate.onclick = async () => {
    if (busy || !crop) return;
    const currentEpoch = epoch; busy = true; controls();
    try {
      const imageDataUrl = cropData();
      status('Đang định vị chữ và dịch vùng PDF đã chọn…');
      const result = await chrome.runtime.sendMessage({ type: 'TRANSLATE_PDF_IMAGE', id, imageDataUrl, language: language.value, mode: 'overlay' });
      if (epoch !== currentEpoch) return;
      if (!result || result.error) throw new Error(result?.error || 'Không nhận được bản dịch.');
      if (!Array.isArray(result.regions)) throw new Error('Backend chưa hỗ trợ định vị chữ. Hãy cập nhật và khởi động lại ứng dụng.');
      clearResult(); resultImage.src = imageDataUrl; await resultImage.decode();
      if (epoch !== currentEpoch) return;
      resultImage.hidden = false; $('#empty').hidden = true;
      if (result.regions.length) overlays.add(resultImage, result.regions, undefined, language.value);
      $('#text').textContent = result.translation;
      status(result.regions.length ? `Đã dịch ${result.regions.length} vùng chữ. Bản dịch nằm trên ảnh bên phải; file PDF gốc được giữ nguyên.` : 'Không tìm thấy vùng chữ đọc được. Hãy phóng to PDF hoặc chọn vùng khác.');
    } catch (error) { if (epoch === currentEpoch) status(error.message); }
    finally { if (epoch === currentEpoch) { busy = false; controls(); } }
  };
  next.onclick = async () => {
    if (busy || !id) return;
    const currentEpoch = epoch; busy = true; controls(); status('Đang chụp lại phần hiển thị của tab PDF gốc…');
    try {
      const result = await chrome.runtime.sendMessage({ type: 'CAPTURE_PDF_NEXT', id });
      if (epoch !== currentEpoch) return;
      if (!result || result.error) throw new Error(result?.error || 'Không chụp được trang tiếp theo.');
      await displayCapture(result.imageDataUrl, currentEpoch);
    } catch (error) { if (epoch === currentEpoch) status(error.message); }
    finally { if (epoch === currentEpoch) { busy = false; controls(); } }
  };
  async function loadSession() {
    const currentEpoch = ++epoch; id = location.hash.slice(1); busy = true; hasCapture = false; crop = dragging = undefined;
    clearResult(); source.hidden = true; drawSelection();
    try {
      const session = (await chrome.storage.session.get('pdf-capture-session'))['pdf-capture-session'];
      if (epoch !== currentEpoch) return;
      if (!session || session.id !== id) throw new Error('Không còn ảnh chụp. Hãy mở PDF và bấm “Chụp trang PDF” trên extension.');
      language.value = ['Vietnamese', 'English', 'Japanese'].includes(session.language) ? session.language : 'Vietnamese';
      await displayCapture(session.imageDataUrl, currentEpoch);
    } catch (error) { if (epoch === currentEpoch) status(error.message); }
    finally { if (epoch === currentEpoch) { busy = false; controls(); } }
  }
  addEventListener('hashchange', loadSession);
  void loadSession();
})();
