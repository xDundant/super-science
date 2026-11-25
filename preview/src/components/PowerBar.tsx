import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toastManager } from "@/components/ui/toast"
import { levelInfo } from "@/lib/xp"

interface Props {
  xp: number
  streak: number
  onEarn: (amount: number) => void
}

// Power Level bar: rank, level, coss ui Progress for XP, and the day streak.
export function PowerBar({ xp, streak, onEarn }: Props) {
  const info = levelInfo(xp)
  const percent = Math.round((info.into / info.needed) * 100)

  function testXP() {
    const before = levelInfo(xp).level
    onEarn(10)
    const after = levelInfo(xp + 10)
    toastManager.add({ title: "+10 XP", description: `${after.into}/${after.needed} XP to level ${after.level + 1}` })
    if (after.level > before) {
      toastManager.add({ title: "POWER UP!", description: `Level ${after.level} · ${after.rank}` })
    }
  }

  return (
    <div className="flex w-full items-center gap-2">
      <div
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-primary/70 bg-card px-3.5 py-2 shadow-[0_0_14px_rgb(255_179_0/35%)] sm:gap-3"
        aria-label={`Power level: ${info.rank}, level ${info.level}. ${info.into} of ${info.needed} XP. ${streak} day streak.`}
        role="group"
      >
        <span className="text-[0.7rem] font-black uppercase tracking-widest text-primary">{info.rank}</span>
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          Lv <b className="text-base text-foreground">{info.level}</b>
        </span>
        <Progress value={percent} className="min-w-12 flex-1" aria-label="XP to next level" />
        <span className="hidden whitespace-nowrap text-xs tabular-nums text-muted-foreground min-[400px]:inline">
          {info.into}/{info.needed}
        </span>
        <span className="whitespace-nowrap font-extrabold tabular-nums">🔥 {streak}</span>
      </div>
      <Button size="sm" onClick={testXP}>Test XP</Button>
    </div>
  )
}
