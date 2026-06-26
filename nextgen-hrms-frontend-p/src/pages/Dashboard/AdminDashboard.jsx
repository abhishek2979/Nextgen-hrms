import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileClock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { aparService } from '../../services/aparService'
import Loader from '../../components/common/Loader'
import { formatDate, statusBadgeClass, statusLabel } from '../../utils/helpers'

export default function AdminDashboard() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    aparService
      .getAllReports()
      .then((data) => active && setReports(Array.isArray(data) ? data : []))
      .catch(() => active && setError('Could not load appraisal reports right now.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const pending = reports.filter((r) => (r.status || '').toUpperCase() === 'SUBMITTED')
  const approved = reports.filter((r) => (r.status || '').toUpperCase() === 'APPROVED')
  const rejected = reports.filter((r) => (r.status || '').toUpperCase() === 'REJECTED')
  const uniqueEmployees = new Set(reports.map((r) => r.employeeId || r.employeeName)).size

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Admin overview</h1>
        <p className="mt-1 text-sm text-ink-900/50">
          Track appraisal submissions across your organisation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Employees with reports" value={uniqueEmployees} accent="bg-ink-800" />
        <StatCard icon={FileClock} label="Pending review" value={pending.length} accent="bg-amber-500" />
        <StatCard icon={CheckCircle2} label="Approved" value={approved.length} accent="bg-moss-500" />
        <StatCard icon={XCircle} label="Returned" value={rejected.length} accent="bg-rose-500" />
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Awaiting your review</h2>
          <Link to="/apar/assessment" className="flex items-center gap-1 text-sm font-semibold text-ink-800 hover:underline">
            Open review queue <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <Loader label="Loading review queue…" />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-900/15 px-6 py-10 text-center text-sm text-ink-900/50">
            Nothing pending — every submitted appraisal has been reviewed.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-ink-900/40">
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 pr-4">Submitted</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5">
                {pending.slice(0, 6).map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 pr-4 font-medium text-ink-900">{r.employeeName || '—'}</td>
                    <td className="py-3 pr-4 text-ink-900/60">{r.department || '—'}</td>
                    <td className="py-3 pr-4 text-ink-900/60">{formatDate(r.submittedAt || r.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <span className={statusBadgeClass(r.status)}>{statusLabel(r.status)}</span>
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/apar/assessment?focus=${r.id}`} className="text-sm font-semibold text-ink-800 hover:underline">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-ink-900">{value}</p>
        <p className="text-sm text-ink-900/50">{label}</p>
      </div>
    </div>
  )
}
