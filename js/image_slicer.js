export function computeTargetSize(imgWidth, imgHeight, maxW, maxH) {
  const scale = Math.min(maxW / imgWidth, maxH / imgHeight, 1);
  return {
    width: Math.round(imgWidth * scale),
    height: Math.round(imgHeight * scale),
  };
}

export function sliceImage(baseCanvas, mode, options) {
  const w = baseCanvas.width;
  const h = baseCanvas.height;
  if (mode === "tiles") {
    const cols = options.cols;
    const rows = Math.max(1, options.rows || Math.round(h / (w / cols)));
    const tileW = w / cols;
    const tileH = h / rows;
    const pieces = [];
    for (let r = 0; r < rows; r += 1) {
      const sy = Math.floor(r * tileH);
      const ey = r === rows - 1 ? h : Math.floor((r + 1) * tileH);
      const sh = ey - sy;
      for (let c = 0; c < cols; c += 1) {
        const sx = Math.floor(c * tileW);
        const ex = c === cols - 1 ? w : Math.floor((c + 1) * tileW);
        const sw = ex - sx;
        const index = pieces.length;
        pieces.push({ sx, sy, sw, sh, keyIndex: index });
      }
    }
    return {
      pieces,
      layout: {
        mode: "tiles",
        width: w,
        height: h,
        cols,
        rows,
        count: pieces.length,
        pieceW: w / cols,
        pieceH: h / rows,
      },
    };
  }

  const count = options.count;
  const stripeW = w / count;
  const pieces = [];
  for (let i = 0; i < count; i += 1) {
    const sx = Math.floor(i * stripeW);
    const ex = i === count - 1 ? w : Math.floor((i + 1) * stripeW);
    const sw = ex - sx;
    const index = pieces.length;
    pieces.push({ sx, sy: 0, sw, sh: h, keyIndex: index });
  }
  return {
    pieces,
    layout: {
      mode: "stripes",
      width: w,
      height: h,
      cols: count,
      rows: 1,
      count,
      pieceW: w / count,
      pieceH: h,
    },
  };
}
