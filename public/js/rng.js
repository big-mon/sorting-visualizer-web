export function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function normalizeSeed(value) {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed | 0;
  }
  return (Date.now() ^ (Math.random() * 0xffffffff)) | 0;
}
