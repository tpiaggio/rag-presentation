function center(matrix: number[][]): number[][] {
  const cols = matrix[0].length
  const means = new Array(cols).fill(0)
  for (const row of matrix) for (let i = 0; i < cols; i++) means[i] += row[i]
  for (let i = 0; i < cols; i++) means[i] /= matrix.length
  return matrix.map((row) => row.map((v, i) => v - means[i]))
}

function dot(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

function norm(a: number[]): number {
  return Math.sqrt(dot(a, a))
}

function multiplyMatTransposeMat(m: number[][], v: number[]): number[] {
  const u = m.map((row) => dot(row, v))
  const cols = m[0].length
  const out = new Array(cols).fill(0)
  for (let r = 0; r < m.length; r++) {
    const ur = u[r]
    const row = m[r]
    for (let c = 0; c < cols; c++) out[c] += row[c] * ur
  }
  return out
}

function powerIteration(matrix: number[][], iters = 50): number[] {
  const cols = matrix[0].length
  let v: number[] = new Array(cols).fill(0).map(() => Math.random() - 0.5)
  for (let i = 0; i < iters; i++) {
    v = multiplyMatTransposeMat(matrix, v)
    const n = norm(v) || 1
    v = v.map((x) => x / n)
  }
  return v
}

function deflate(matrix: number[][], v: number[]): number[][] {
  return matrix.map((row) => {
    const proj = dot(row, v)
    return row.map((x, i) => x - proj * v[i])
  })
}

export function pca2(matrix: number[][]): { x: number; y: number }[] {
  if (matrix.length === 0) return []
  const centered = center(matrix)
  const pc1 = powerIteration(centered)
  const deflated = deflate(centered, pc1)
  const pc2 = powerIteration(deflated)
  return centered.map((row) => ({ x: dot(row, pc1), y: dot(row, pc2) }))
}
