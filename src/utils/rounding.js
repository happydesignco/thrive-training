export function roundToNearest(n, step = 5) {
  return Math.round(n / step) * step
}
