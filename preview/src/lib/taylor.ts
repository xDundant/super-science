// Same maths as concepts/taylor.js in the live app.
// Taylor polynomial of sin(x) with n terms: sum_{k=0}^{n-1} (-1)^k x^(2k+1) / (2k+1)!
export function taylorSin(x: number, n: number): number {
  let term = x
  let sum = term
  for (let k = 1; k < n; k++) {
    term *= -(x * x) / ((2 * k) * (2 * k + 1))
    sum += term
  }
  return sum
}

const SUPERSCRIPT: Record<string, string> = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" }
const sup = (num: number) => String(num).split("").map((d) => SUPERSCRIPT[d]).join("")

// e.g. "x − x³/3! + x⁵/5!"
export function polynomialLabel(n: number): string {
  let label = ""
  for (let k = 0; k < n; k++) {
    const p = 2 * k + 1
    const term = p === 1 ? "x" : `x${sup(p)}/${p}!`
    label += k === 0 ? term : (k % 2 === 1 ? " − " : " + ") + term
  }
  return label
}
