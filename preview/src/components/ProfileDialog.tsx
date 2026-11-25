import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { levelInfo } from "@/lib/xp"

// Profile button + coss ui Dialog with placeholder content.
export function ProfileDialog({ xp, streak }: { xp: number; streak: number }) {
  const info = levelInfo(xp)
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Profile</DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Your Power Level</DialogTitle>
          <DialogDescription>Placeholder for the Profile screen (auras, stats, reset).</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div className="rounded-xl border border-primary/60 bg-navy p-5 text-center">
            <p className="text-xl font-black uppercase tracking-[0.15em] text-primary">{info.rank}</p>
            <p className="mt-1 text-muted-foreground">
              Level <b className="text-3xl font-black text-foreground">{info.level}</b>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{xp} XP total · 🔥 {streak} day streak</p>
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
