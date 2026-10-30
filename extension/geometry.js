(() => {
  if (globalThis.AITranslatorGeometry) return;
  const intersect = (a, b) => {
    const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
    return { x, y, width: Math.max(0, Math.min(a.x + a.width, b.x + b.width) - x), height: Math.max(0, Math.min(a.y + a.height, b.y + b.height) - y) };
  };
  function positionOffset(value, free) {
    if (/^-?[\d.]+%$/.test(value)) return free * parseFloat(value) / 100;
    if (/^-?[\d.]+px$/.test(value)) return parseFloat(value);
    if (value === 'left' || value === 'top') return 0;
    if (value === 'right' || value === 'bottom') return free;
    if (value === 'center') return free / 2;
    throw new Error('object-position của ảnh chưa được hỗ trợ. Hãy dùng chế độ bảng nổi.');
  }
  function layout(content, naturalWidth, naturalHeight, fit = 'fill', position = '50% 50%') {
    if (!naturalWidth || !naturalHeight || content.width <= 0 || content.height <= 0) throw new Error('Ảnh không có kích thước hợp lệ.');
    let width = content.width, height = content.height;
    if (fit !== 'fill') {
      const contain = Math.min(width / naturalWidth, height / naturalHeight);
      const scale = fit === 'cover' ? Math.max(width / naturalWidth, height / naturalHeight) : fit === 'none' ? 1 : fit === 'scale-down' ? Math.min(1, contain) : contain;
      width = naturalWidth * scale; height = naturalHeight * scale;
    }
    const parts = position.trim().split(/\s+/);
    if (parts.length !== 2) throw new Error('object-position phức tạp chưa được hỗ trợ. Hãy dùng chế độ bảng nổi.');
    const image = { x: content.x + positionOffset(parts[0], content.width - width), y: content.y + positionOffset(parts[1], content.height - height), width, height };
    return { image, clip: intersect(image, content) };
  }
  function sourceRect(crop, image) {
    return { x: (crop.x - image.x) / image.width, y: (crop.y - image.y) / image.height, width: crop.width / image.width, height: crop.height / image.height };
  }
  function mapBox(box, source = { x: 0, y: 0, width: 1, height: 1 }) {
    const [top, left, bottom, right] = box;
    return { x: source.x + left / 1000 * source.width, y: source.y + top / 1000 * source.height, width: (right - left) / 1000 * source.width, height: (bottom - top) / 1000 * source.height };
  }
  function project(box, image) {
    return { x: image.x + box.x * image.width, y: image.y + box.y * image.height, width: box.width * image.width, height: box.height * image.height };
  }
  function measure(img) {
    const bounds = img.getBoundingClientRect(), style = getComputedStyle(img);
    // Fixed overlay coordinates only support unrotated, unskewed page elements.
    for (let node = img; node; node = node.parentElement) {
      const css = getComputedStyle(node);
      if (css.rotate && css.rotate !== 'none' && css.rotate !== '0deg') throw new Error('Ảnh đang xoay. Hãy dùng chế độ bảng nổi.');
      if (css.transform !== 'none') {
        const matrix = new DOMMatrixReadOnly(css.transform);
        if (!matrix.is2D || matrix.b || matrix.c || matrix.a <= 0 || matrix.d <= 0) throw new Error('Ảnh đang xoay hoặc lật. Hãy dùng chế độ bảng nổi.');
      }
    }
    const px = key => parseFloat(style[key]) || 0;
    const borderX = px('borderLeftWidth') + px('borderRightWidth'), borderY = px('borderTopWidth') + px('borderBottomWidth');
    const paddingX = px('paddingLeft') + px('paddingRight'), paddingY = px('paddingTop') + px('paddingBottom');
    let cssWidth = px('width'), cssHeight = px('height');
    if (style.boxSizing !== 'border-box') { cssWidth += borderX + paddingX; cssHeight += borderY + paddingY; }
    const scaleX = bounds.width / (cssWidth || bounds.width), scaleY = bounds.height / (cssHeight || bounds.height);
    const content = { x: bounds.left + (px('borderLeftWidth') + px('paddingLeft')) * scaleX, y: bounds.top + (px('borderTopWidth') + px('paddingTop')) * scaleY,
      width: bounds.width - (borderX + paddingX) * scaleX, height: bounds.height - (borderY + paddingY) * scaleY };
    const result = layout(content, img.naturalWidth * scaleX, img.naturalHeight * scaleY, style.objectFit, style.objectPosition);
    let clip = intersect(result.clip, { x: 0, y: 0, width: innerWidth, height: innerHeight });
    let visible = img.isConnected && style.visibility === 'visible' && style.display !== 'none';
    for (let node = img.parentElement; node; node = node.parentElement) {
      const css = getComputedStyle(node);
      if (css.visibility === 'hidden' || css.display === 'none' || Number(css.opacity) === 0) visible = false;
      const b = node.getBoundingClientRect();
      if (/(hidden|clip|scroll|auto)/.test(css.overflowX)) clip = intersect(clip, { x: b.left, y: clip.y, width: b.width, height: clip.height });
      if (/(hidden|clip|scroll|auto)/.test(css.overflowY)) clip = intersect(clip, { x: clip.x, y: b.top, width: clip.width, height: b.height });
    }
    if (Number(style.opacity) === 0) visible = false;
    return { ...result, clip, visible };
  }
  globalThis.AITranslatorGeometry = { intersect, layout, sourceRect, mapBox, project, measure };
})();
