import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sand-50 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-800">
        <Compass className="h-7 w-7 text-amber-400" />
      </div>
      <h1 className="font-display text-3xl font-bold text-ink-900">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-900/50">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/dashboard" className="btn-primary mt-2">Back to dashboard</Link>
    </div>
  )
}
