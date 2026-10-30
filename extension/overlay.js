(() => {
  if (globalThis.AITranslatorOverlay) return;
  const geometry = globalThis.AITranslatorGeometry;
  const entries = new Map();
  let root, shadow, timer, queued = false, visible = true, suspended = false;
  function mount() {
    if (root?.isConnected) return;
    root = document.createElement('div');
    root.setAttribute('data-ai-translator-overlays', '');
    root.style.cssText = 'all:initial!important;position:fixed!important;left:0!important;top:0!important;width:0!important;height:0!important;z-index:2147483646!important;pointer-events:none!important;';
    shadow = root.attachShadow({ mode: 'closed' });
    const css = document.createElement('style');
    css.textContent = ':host{color-scheme:light}.image{position:fixed;overflow:hidden;pointer-events:none}.region{position:absolute;box-sizing:border-box;overflow:hidden;padding:2px;display:flex;align-items:center;justify-content:center;text-align:center;font-family:Arial,sans-serif;line-height:1.12;white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal;pointer-events:none}.text{display:block;width:100%;font:inherit;line-height:inherit;overflow-wrap:inherit;white-space:inherit}';
    shadow.append(css); document.documentElement.append(root);
  }
  function remove(img) {
    const entry = entries.get(img);
    if (entry) { entry.element.remove(); entries.delete(img); }
    if (!entries.size) { clearInterval(timer); timer = undefined; root?.remove(); }
  }
  function fitText(node, text, width, height) {
    const max = Math.min(40, Math.max(6, height * .7));
    let low = Math.min(6, max), high = max;
    // Choose the largest font that fits both width and height, rather than truncating sentences.
    for (let i = 0; i < 9; i++) {
      const size = (low + high) / 2; node.style.fontSize = size + 'px';
      // DOM scroll metrics round to whole pixels while image coordinates may be fractional.
      if (text.scrollWidth <= Math.ceil(width - 4) && text.scrollHeight <= Math.ceil(height - 4)) low = size; else high = size;
    }
    node.style.fontSize = low + 'px';
  }
  function update() {
    queued = false;
    for (const [img, entry] of entries) {
      if (!img.isConnected || (img.currentSrc || img.src) !== entry.src || img.naturalWidth !== entry.naturalWidth || img.naturalHeight !== entry.naturalHeight) { remove(img); continue; }
      if (!visible || suspended || document.hidden) { entry.element.hidden = true; continue; }
      try {
        const { image, clip, visible: inPage } = geometry.measure(img);
        entry.element.hidden = !inPage || clip.width < 1 || clip.height < 1;
        if (entry.element.hidden) continue;
        Object.assign(entry.element.style, { left: clip.x + 'px', top: clip.y + 'px', width: clip.width + 'px', height: clip.height + 'px' });
        for (const region of entry.regions) {
          const box = geometry.project(region.box, image);
          Object.assign(region.node.style, { left: (box.x - clip.x) + 'px', top: (box.y - clip.y) + 'px', width: box.width + 'px', height: box.height + 'px' });
          const size = `${box.width}:${box.height}`;
          if (region.size !== size) { fitText(region.node, region.text, box.width, box.height); region.size = size; }
        }
      } catch { entry.element.hidden = true; }
    }
  }
  function schedule() { if (!queued && entries.size) { queued = true; requestAnimationFrame(update); } }
  function add(img, regions, source = { x: 0, y: 0, width: 1, height: 1 }, language = 'Vietnamese') {
    geometry.measure(img); // Fail before adding an overlay when geometry is unsupported.
    const previous = entries.get(img);
    const retained = previous && previous.src === (img.currentSrc || img.src) && previous.language === language ? previous.regions.filter(region => {
      const overlap = geometry.intersect(region.box, source);
      return overlap.width * overlap.height === 0;
    }) : [];
    remove(img); mount(); visible = true;
    if (entries.size >= 20) remove(entries.keys().next().value);
    const element = document.createElement('div'); element.className = 'image';
    const mapped = regions.map(region => {
      const node = document.createElement('div'), text = document.createElement('span');
      node.className = 'region'; text.className = 'text'; text.textContent = region.translation;
      node.lang = { Vietnamese: 'vi', English: 'en', Japanese: 'ja' }[language] || '';
      node.style.backgroundColor = region.background; node.style.color = region.color;
      node.title = region.original; node.append(text); element.append(node);
      return { box: geometry.mapBox(region.box, source), node, text };
    });
    const combined = [...retained, ...mapped].slice(-200);
    for (const region of combined) { region.size = undefined; element.append(region.node); }
    shadow.append(element);
    entries.set(img, { element, regions: combined, language, src: img.currentSrc || img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
    if (!timer) timer = setInterval(schedule, 250);
    update();
  }
  addEventListener('scroll', schedule, true); addEventListener('resize', schedule);
  globalThis.AITranslatorOverlay = {
    add, remove,
    suspend(value) { suspended = value; update(); },
    toggle() { visible = !visible; update(); return visible; },
    clear() { for (const img of entries.keys()) remove(img); },
    get count() { return entries.size; }, get visible() { return visible; }
  };
})();
