import { Loader2 } from 'lucide-react'

export default function Loader({ label = 'Loading…', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center gap-3 text-ink-900/60">
      <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )

  if (fullScreen) {
    return <div className="flex h-screen w-full items-center justify-center bg-sand-50">{content}</div>
  }

  return <div className="flex w-full items-center justify-center py-16">{content}</div>
}
