export function renderPanel(ctx, baseCanvas, pieces, layout, order, highlight) {
  const { width, height, cols, rows, pieceW, pieceH } = layout;
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;

  for (let pos = 0; pos < order.length; pos += 1) {
    const piece = pieces[order[pos]];
    const col = pos % cols;
    const row = Math.floor(pos / cols);
    const dx = col * pieceW;
    const dy = row * pieceH;
    ctx.drawImage(
      baseCanvas,
      piece.sx,
      piece.sy,
      piece.sw,
      piece.sh,
      dx,
      dy,
      pieceW,
      pieceH
    );
  }

  if (highlight && highlight.indices.length) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = highlight.type === "cmp" ? "#e9c46a" : highlight.type === "swap" ? "#f4a261" : "#2a9d8f";
    highlight.indices.forEach((pos) => {
      if (pos == null) {
        return;
      }
      const col = pos % cols;
      const row = Math.floor(pos / cols);
      ctx.fillRect(col * pieceW, row * pieceH, pieceW, pieceH);
    });
    ctx.restore();
  }
}
