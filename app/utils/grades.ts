export function avg(grades: (number | null)[]): number | null {
  const vals = grades.filter((g): g is number => g !== null)
  if (!vals.length) return null
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}
