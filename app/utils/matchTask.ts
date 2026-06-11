export type Assignments = Record<number, number>

export function assignPair(a: Assignments, lIdx: number, rIdx: number): Assignments {
  const next: Assignments = {}
  for (const [k, v] of Object.entries(a)) {
    if (v !== rIdx) next[+k] = v
  }
  if (a[lIdx] !== rIdx) next[lIdx] = rIdx
  return next
}

export function countCorrect(a: Assignments): number {
  return Object.entries(a).filter(([l, r]) => +l === +r).length
}

export const totalPairs = (left: number, right: number) => Math.min(left, right)
