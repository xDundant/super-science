import { useState } from "react"
import { TaylorGraph } from "@/components/TaylorGraph"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { polynomialLabel, taylorSin } from "@/lib/taylor"

export function TaylorPage() {
  const [terms, setTerms] = useState(1)
  const err = Math.abs(taylorSin(Math.PI, terms) - Math.sin(Math.PI))

  return (
    <div className="flex flex-col gap-3">
      <Button variant="ghost" className="w-fit text-brand-cyan" onClick={() => { window.location.hash = "" }}>
        ← All concepts
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl font-extrabold text-primary sm:text-2xl">Taylor series of sin(x)</CardTitle>
        </CardHeader>
        <CardPanel className="flex flex-col gap-3">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground" aria-hidden="true">
            <span className="flex items-center gap-1.5"><i className="h-1 w-4 rounded bg-white" />sin(x)</span>
            <span className="flex items-center gap-1.5"><i className="h-1 w-4 rounded bg-primary" />Taylor polynomial</span>
          </div>

          <TaylorGraph terms={terms} />

          <p className="min-h-12 text-center text-lg text-primary [font-family:'Cambria_Math','STIX_Two_Math',Georgia,'Times_New_Roman',serif] sm:text-xl" aria-live="polite">
            {polynomialLabel(terms)}
          </p>

          <div className="flex flex-col gap-1">
            <p className="text-center text-muted-foreground">
              Terms: <b className="text-2xl text-primary tabular-nums">{terms}</b>
            </p>
            <Slider
              className="ss-slider"
              min={1}
              max={10}
              step={1}
              value={terms}
              onValueChange={(v) => setTerms(Array.isArray(v) ? v[0] : v)}
              getAriaLabel={() => "Number of terms"}
            />
            <div className="flex justify-between text-xs text-muted-foreground" aria-hidden="true">
              <span>1</span><span>10</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Error at x = π: <b className="text-brand-red tabular-nums">{err < 1e-4 ? err.toExponential(1) : err.toFixed(4)}</b>
          </p>
          <p className="text-center">Add more terms and the polynomial hugs sin(x) further out.</p>
        </CardPanel>
      </Card>
    </div>
  )
}
