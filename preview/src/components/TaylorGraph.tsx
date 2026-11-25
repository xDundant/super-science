import { useEffect, useRef, useState } from "react"
import { taylorSin } from "@/lib/taylor"

// The live app's SVG graph, rebuilt as a React component (same ranges, colours and logic).
const X_MIN = -2 * Math.PI, X_MAX = 2 * Math.PI, Y_MIN = -3, Y_MAX = 3, SAMPLES = 600
const PAD = { left: 30, right: 12, top: 12, bottom: 28 }
const COLORS = { sin: "#FFFFFF", taylor: "#FFB300", axis: "#4DD9FF", grid: "rgba(77, 217, 255, 0.12)" }
const PI_LABELS: Record<number, string> = { [-2]: "−2π", [-1]: "−π", 0: "0", 1: "π", 2: "2π" }

export function TaylorGraph({ terms }: { terms: number }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(800)

  // Redraw at the real on-screen width so text stays crisp (like watchWidth in the live app).
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(Math.max(280, Math.round(el.clientWidth))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const H = Math.round(W < 600 ? W * 0.85 : W * 0.5)
  const sx = (x: number) => PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD.left - PAD.right)
  const sy = (y: number) => PAD.top + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * (H - PAD.top - PAD.bottom)
  const pathFor = (fn: (x: number) => number) => {
    let d = ""
    for (let i = 0; i <= SAMPLES; i++) {
      const x = X_MIN + (i / SAMPLES) * (X_MAX - X_MIN)
      const y = Math.max(-50, Math.min(50, fn(x)))
      d += (i === 0 ? "M" : "L") + sx(x).toFixed(2) + "," + sy(y).toFixed(2)
    }
    return d
  }
  const fontSize = W < 500 ? 12 : 14
  const halfPis = [-4, -3, -2, -1, 0, 1, 2, 3, 4]
  const ys = [-3, -2, -1, 0, 1, 2, 3]

  return (
    <div ref={wrap} className="w-full overflow-hidden rounded-xl bg-navy">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Graph of sin(x) and its Taylor polynomial">
        <defs>
          <clipPath id="taylor-clip">
            <rect x={PAD.left} y={PAD.top} width={W - PAD.left - PAD.right} height={H - PAD.top - PAD.bottom} />
          </clipPath>
        </defs>
        <g stroke={COLORS.grid} strokeWidth={1}>
          {halfPis.map((i) => <line key={`v${i}`} x1={sx((i * Math.PI) / 2)} y1={sy(Y_MAX)} x2={sx((i * Math.PI) / 2)} y2={sy(Y_MIN)} />)}
          {ys.map((y) => <line key={`h${y}`} x1={sx(X_MIN)} y1={sy(y)} x2={sx(X_MAX)} y2={sy(y)} />)}
        </g>
        <g stroke={COLORS.axis} strokeWidth={1.5} opacity={0.8}>
          <line x1={sx(X_MIN)} y1={sy(0)} x2={sx(X_MAX)} y2={sy(0)} />
          <line x1={sx(0)} y1={sy(Y_MIN)} x2={sx(0)} y2={sy(Y_MAX)} />
        </g>
        <g fill={COLORS.axis} fontSize={fontSize} fontFamily="system-ui, sans-serif">
          {[-2, -1, 0, 1, 2].map((i) => <text key={`x${i}`} x={sx(i * Math.PI)} y={H - 8} textAnchor="middle">{PI_LABELS[i]}</text>)}
          {ys.filter((y) => y !== 0).map((y) => (
            <text key={`y${y}`} x={PAD.left - 6} y={sy(y) + fontSize * 0.35} textAnchor="end">{y < 0 ? "−" + Math.abs(y) : y}</text>
          ))}
        </g>
        <g clipPath="url(#taylor-clip)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={pathFor(Math.sin)} stroke={COLORS.sin} strokeWidth={2.5} />
          <path d={pathFor((x) => taylorSin(x, terms))} stroke={COLORS.taylor} strokeWidth={3} />
        </g>
      </svg>
    </div>
  )
}
