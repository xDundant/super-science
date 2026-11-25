import { useEffect, useState } from "react"
import { PowerBar } from "@/components/PowerBar"
import { ProfileDialog } from "@/components/ProfileDialog"
import { Home } from "@/pages/Home"
import { TaylorPage } from "@/pages/TaylorPage"

// Simple hash routing, like the live app: "" = home, "#taylor" = Taylor page.
function useHash() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1))
  useEffect(() => {
    const onChange = () => { setHash(window.location.hash.slice(1)); window.scrollTo(0, 0) }
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  const [xp, setXp] = useState(155) // sample data: level 3, a few XP short of level 4
  const streak = 3

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 pt-6 pb-2">
        <h1 className="text-[clamp(2rem,9vw,3.4rem)] font-black italic leading-none tracking-wide text-primary [text-shadow:0_0_18px_rgb(255_179_0/35%)]">
          <a href="#">SUPER <span className="text-foreground">SCIENCE</span></a>
        </h1>
        <PowerBar xp={xp} streak={streak} onEarn={(n) => setXp((x) => x + n)} />
        <div className="flex items-center gap-2">
          <ProfileDialog xp={xp} streak={streak} />
          <span className="rounded-full border border-brand-cyan/40 px-2.5 py-0.5 text-xs text-brand-cyan">coss ui preview</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4">
        {hash === "taylor" ? <TaylorPage /> : <Home />}
      </main>

      <footer className="py-6 text-center">
        <a className="inline-block rounded-full border border-brand-cyan/40 px-5 py-3 text-brand-cyan" href="https://instagram.com/super.science9" target="_blank" rel="noopener">
          Follow <b className="text-primary">@super.science9</b>
        </a>
      </footer>
    </div>
  )
}
