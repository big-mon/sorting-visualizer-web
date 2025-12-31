export function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed() {
  return Math.floor(Math.random() * 1000000000) + 1;
}

export function normalizeSeed(value) {
  if (value === "" || value == null) {
    return randomSeed();
  }
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return Math.trunc(parsed);
  }
  return randomSeed();
}
