export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Smooth a series using simple moving average; good enough w/o deps
export function smoothSeries(src: number[], window = 2) {
  if (window <= 1) return src.slice();
  const out: number[] = [];
  for (let i = 0; i < src.length; i++) {
    let acc = 0, n = 0;
    for (let k = -window; k <= window; k++) {
      const j = i + k;
      if (j >= 0 && j < src.length) {
        acc += src[j];
        n++;
      }
    }
    out.push(acc / n);
  }
  return out;
}

export function fitToRange(values: number[], pad = 0.1) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return { min: min - span * pad, max: max + span * pad };
}

export function genDemo(seed = 1, n = 30, drift = 0.2, vol = 1.2) {
  // deterministic LCG
  let s = seed >>> 0;
  const rnd = () => ((s = (1664525 * s + 1013904223) >>> 0) / 0xffffffff);
  const data: number[] = [];
  let v = 100;
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.5) * vol + drift;
    data.push(v);
  }
  return data;
}