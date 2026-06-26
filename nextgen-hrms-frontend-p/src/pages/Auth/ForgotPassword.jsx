import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { authService } from '../../services/authService'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { isNotEmpty } from '../../utils/helpers'

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: enter employee ID, 2: enter OTP + new password
  const [employeeId, setEmployeeId] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!isNotEmpty(employeeId)) {
      setErrors({ employeeId: 'Enter your employee ID.' })
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await authService.forgotPassword(employeeId)
      setStep(2)
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          'Could not find that employee ID. Please check and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setServerError('')

    const next = {}
    if (!isNotEmpty(otp)) next.otp = 'Enter the OTP sent to your registered email.'
    if (newPassword.length < 6) next.newPassword = 'Minimum 6 characters.'
    if (confirmPassword !== newPassword) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      await authService.resetPassword({ employeeId, otp, newPassword })
      setDone(true)
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium text-ink-900/50 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-ink-800">
          <KeyRound className="h-5 w-5 text-amber-400" />
        </div>

        {done ? (
          <div className="mt-5 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-moss-500/15">
              <CheckCircle2 className="h-6 w-6 text-moss-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ink-900">Password reset</h2>
            <p className="text-sm text-ink-900/50">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to sign in
            </Button>
          </div>
        ) : step === 1 ? (
          <>
            <h2 className="mt-5 font-display text-2xl font-bold text-ink-900">Forgot password</h2>
            <p className="mt-1 text-sm text-ink-900/50">
              Enter your employee ID and we'll send a one-time code to your registered email.
            </p>

            <form onSubmit={handleRequestOtp} className="mt-6 space-y-4" noValidate>
              <Input
                id="employeeId"
                label="Employee ID"
                placeholder="e.g. EMP10234"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                error={errors.employeeId}
                autoComplete="username"
              />

              {serverError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
                  {serverError}
                </p>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Send reset code
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="mt-5 font-display text-2xl font-bold text-ink-900">Reset your password</h2>
            <p className="mt-1 text-sm text-ink-900/50">
              We've sent a one-time code to the email linked to employee ID{' '}
              <span className="font-semibold text-ink-900">{employeeId}</span>. Enter it below
              along with your new password.
            </p>

            <form onSubmit={handleResetPassword} className="mt-6 space-y-4" noValidate>
              <Input
                id="otp"
                label="One-time code"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                error={errors.otp}
                inputMode="numeric"
              />
              <Input
                id="newPassword"
                type="password"
                label="New password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={errors.newPassword}
                autoComplete="new-password"
              />
              <Input
                id="confirmPassword"
                type="password"
                label="Re-enter new password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              {serverError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
                  {serverError}
                </p>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Reset password
              </Button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm font-medium text-ink-900/50 hover:text-ink-900"
              >
                Use a different employee ID
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
