import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LogIn, ShieldCheck, FileSignature, Gauge } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { isNotEmpty } from '../../utils/helpers'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ employeeId: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const next = {}
    if (!isNotEmpty(form.employeeId)) next.employeeId = 'Enter your employee ID.'
    if (!isNotEmpty(form.password)) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    setLoading(true)
    try {
      await login(form.employeeId, form.password)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Invalid employee ID or password. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-10 text-sand-50 lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-moss-500/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 font-display text-lg font-bold text-ink-900">
            N
          </div>
          <span className="font-display text-lg font-bold">NextGen HRMS</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight">
            One portal for every step of your annual appraisal.
          </h1>
          <p className="mt-4 text-sand-50/70">
            Submit self-assessments, track reviews, and view final gradings —
            all in one place, built for clarity and accountability.
          </p>

          <div className="mt-10 space-y-5">
            {[
              { icon: FileSignature, text: 'Guided self-appraisal forms with auto-save drafts' },
              { icon: Gauge, text: 'Real-time status from submission to final grading' },
              { icon: ShieldCheck, text: 'Role-based access for employees and reviewers' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4.5 w-4.5 text-amber-400" />
                </div>
                <p className="text-sm text-sand-50/80">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-sand-50/40">
          Appraisal Cycle 2025–26 · Submissions close as per departmental schedule
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center bg-sand-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800 font-display text-lg font-bold text-amber-400">
              N
            </div>
            <span className="font-display text-lg font-bold text-ink-900">NextGen HRMS</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-ink-900">Sign in to your account</h2>
          <p className="mt-1 text-sm text-ink-900/50">
            Enter your employee ID and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <Input
              id="employeeId"
              type="text"
              label="Employee ID"
              placeholder="e.g. EMP10234"
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              error={errors.employeeId}
              autoComplete="username"
            />
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label-text mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-ink-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                error={errors.password}
                autoComplete="current-password"
                className="mt-1.5"
              />
            </div>

            {serverError && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
                {serverError}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-900/50">
            Trouble logging in?{' '}
            <Link to="/" className="font-semibold text-ink-800 hover:underline">
              Contact your HR administrator
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
