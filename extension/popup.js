const button = document.querySelector('#start');
const recaptureButton = document.querySelector('#recapture');
const pdfButton = document.querySelector('#pdf-capture');
const language = document.querySelector('#language');
const mode = document.querySelector('#mode');
chrome.storage.local.get(['language', 'mode']).then(saved => { if (saved.language) language.value = saved.language; if (saved.mode) mode.value = saved.mode; });
async function run(type) {
  button.disabled = true;
  recaptureButton.disabled = true;
  pdfButton.disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !(type === 'OPEN_PDF_CAPTURE' ? /^(https?:|file:)/ : /^https?:/).test(tab.url || '')) throw new Error('Hãy mở website hoặc tab PDF HTTP/HTTPS. Với PDF trên máy, dùng nút Chụp trang PDF.');
    await chrome.storage.local.set({ language: language.value, mode: mode.value });
    if (type === 'OPEN_PDF_CAPTURE') {
      const result = await chrome.runtime.sendMessage({ type, tabId: tab.id, language: language.value });
      if (result?.error || !result?.ok) throw new Error(result?.error || 'Không chụp được PDF.');
      window.close(); return;
    }
    await chrome.storage.session.set({ ['translator-tab-' + tab.id]: { origin: new URL(tab.url).origin, language: language.value, mode: mode.value } });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['geometry.js', 'overlay.js', 'content.js'] });
    const result = await chrome.tabs.sendMessage(tab.id, { type, language: language.value, mode: mode.value });
    if (!result?.ok) throw new Error('Chưa chụp được ảnh hoặc đang dịch. Kiểm tra bảng thông báo trên trang.');
    window.close();
  } catch (error) {
    document.querySelector('#status').textContent = error.message || 'Không thể chạy trên trang này.';
    button.disabled = false;
    recaptureButton.disabled = false;
    pdfButton.disabled = false;
  }
}
button.addEventListener('click', () => run('START_IMAGE_TRANSLATION'));
recaptureButton.addEventListener('click', () => run('RECAPTURE_IMAGE'));
pdfButton.addEventListener('click', () => run('OPEN_PDF_CAPTURE'));
