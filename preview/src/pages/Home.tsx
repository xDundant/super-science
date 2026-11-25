import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs"
import { toastManager } from "@/components/ui/toast"
import { CONCEPTS, SUBJECTS, type Subject } from "@/data/concepts"

// Subject tag colours: amber maths, cyan physics, violet chemistry, green biology.
const TAG_CLASS: Record<Subject, string> = {
  Maths: "border-primary/50 bg-primary/12 text-primary",
  Physics: "border-brand-cyan/50 bg-brand-cyan/12 text-brand-cyan",
  Chemistry: "border-brand-violet/50 bg-brand-violet/12 text-brand-violet",
  Biology: "border-brand-green/50 bg-brand-green/12 text-brand-green",
}

export function Home() {
  const [subject, setSubject] = useState<string>("All")
  const count = (s: string) => CONCEPTS.filter((c) => s === "All" || c.tag === s).length

  function open(id: string) {
    if (id === "taylor") window.location.hash = "taylor"
    else toastManager.add({ title: "Preview only", description: "Only the Taylor series page is rebuilt in this coss ui preview." })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-muted-foreground">Pick a concept and play with it.</p>
      <Tabs value={subject} onValueChange={(v) => setSubject(String(v))}>
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex sm:justify-center sm:px-0">
          <TabsList size="sm">
            {SUBJECTS.map((s) => (
              <TabsTab key={s} value={s}>
                {s} <span className="ms-1 hidden text-xs opacity-60 tabular-nums sm:inline">{count(s)}</span>
              </TabsTab>
            ))}
          </TabsList>
        </div>
        {SUBJECTS.map((s) => (
          <TabsPanel key={s} value={s} className="pt-3">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CONCEPTS.filter((c) => s === "All" || c.tag === s).map((c) => (
                <li key={c.id}>
                  <Card
                    render={<button type="button" onClick={() => open(c.id)} />}
                    className="h-full w-full cursor-pointer text-left transition hover:-translate-y-0.5 hover:border-primary/70 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <CardHeader>
                      <Badge variant="outline" className={`w-fit uppercase tracking-wider ${TAG_CLASS[c.tag]}`}>{c.tag}</Badge>
                      <CardTitle className="text-lg font-extrabold text-primary">{c.title}</CardTitle>
                      <CardDescription>{c.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="text-sm font-semibold text-brand-cyan">
                      {c.id === "taylor" ? "Open →" : "Not in preview"}
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  )
}
