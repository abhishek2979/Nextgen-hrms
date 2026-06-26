import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 text-white px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-rose-700 disabled:opacity-50',
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  type = 'button',
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={loading || rest.disabled}
      className={`${VARIANTS[variant] || VARIANTS.primary} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
