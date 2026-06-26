import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { FileText, Clock, CheckCircle2, ArrowRight, PlusCircle, BellRing, CheckCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { aparService } from '../../services/aparService'
import { reminderService } from '../../services/reminderService'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { formatDate, formatDateTime, statusBadgeClass, statusLabel } from '../../utils/helpers'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const [reports, setReports] = useState([])
  const [reminders, setReminders] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [loadingReminders, setLoadingReminders] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return
    let active = true

    // Load APAR reports
    aparService
      .getMyReports(user.id)
      .then((data) => active && setReports(Array.isArray(data) ? data : []))
      .catch(() => active && setError('Could not load your APAR reports right now.'))
      .finally(() => active && setLoadingReports(false))

    // Load reminders
    reminderService
      .getMyReminders(user.id)
      .then((data) => active && setReminders(Array.isArray(data) ? data : []))
      .catch(() => {}) // silent fail for reminders
      .finally(() => active && setLoadingReminders(false))

    return () => { active = false }
  },[user, location.key])

  const latest = reports[0]
  const counts = {
    total: reports.length,
    submitted: reports.filter((r) => (r.status || '').toUpperCase() === 'SUBMITTED').length,
    approved: reports.filter((r) => (r.status || '').toUpperCase() === 'APPROVED').length,
  }
  const unreadCount = reminders.filter((r) => !r.read).length

  const handleMarkRead = async (id) => {
    await reminderService.markRead(id)
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)))
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    await reminderService.markAllRead(user.id)
    setReminders((prev) => prev.map((r) => ({ ...r, read: true })))
    setMarkingAll(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-900/50">
            Here's where your APAR appraisal currently stands.
          </p>
        </div>
        <Link to="/apar/self-appraisal" className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          Start self-appraisal
        </Link>
      </div>

      {location.state?.submitted && (
          <div className="rounded-xl bg-moss-500/10 px-4 py-3 text-sm font-medium text-moss-600">
            Your self-appraisal has been submitted and is now awaiting review.
          </div>
      )}



      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label="Total reports" value={counts.total} accent="bg-ink-800" />
        <StatCard icon={Clock} label="Awaiting review" value={counts.submitted} accent="bg-amber-500" />
        <StatCard icon={CheckCircle2} label="Approved" value={counts.approved} accent="bg-moss-500" />
      </div>

      {/* Reminders inbox */}
      {/*{(loadingReminders || reminders.length > 0) && (*/}
      {/*  <div className="card p-6">*/}
      {/*    <div className="mb-4 flex items-center justify-between">*/}
      {/*      <div className="flex items-center gap-2">*/}
      {/*        <BellRing className="h-5 w-5 text-amber-500" />*/}
      {/*        <h2 className="text-lg font-semibold text-ink-900">Reminders from HR</h2>*/}
      {/*        {unreadCount > 0 && (*/}
      {/*          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">*/}
      {/*            {unreadCount}*/}
      {/*          </span>*/}
      {/*        )}*/}
      {/*      </div>*/}
      {/*      {unreadCount > 0 && (*/}
      {/*        <Button*/}
      {/*          variant="ghost"*/}
      {/*          loading={markingAll}*/}
      {/*          onClick={handleMarkAllRead}*/}
      {/*        >*/}
      {/*          <CheckCheck className="h-4 w-4" />*/}
      {/*          Mark all read*/}
      {/*        </Button>*/}
      {/*      )}*/}
      {/*    </div>*/}

      {/*    {loadingReminders ? (*/}
      {/*      <Loader label="Loading reminders…" />*/}
      {/*    ) : reminders.length === 0 ? (*/}
      {/*      <p className="text-sm text-ink-900/40">No reminders yet.</p>*/}
      {/*    ) : (*/}
      {/*      <div className="space-y-2">*/}
      {/*        {reminders.map((r) => (*/}
      {/*          <div*/}
      {/*            key={r.id}*/}
      {/*            className={`flex items-start justify-between gap-4 rounded-xl px-4 py-3 transition-colors ${*/}
      {/*              r.read ? 'bg-sand-50' : 'bg-amber-400/10 border border-amber-400/20'*/}
      {/*            }`}*/}
      {/*          >*/}
      {/*            <div className="flex items-start gap-3">*/}
      {/*              {!r.read && (*/}
      {/*                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />*/}
      {/*              )}*/}
      {/*              <div>*/}
      {/*                <p className={`text-sm ${r.read ? 'text-ink-900/60' : 'font-medium text-ink-900'}`}>*/}
      {/*                  {r.message}*/}
      {/*                </p>*/}
      {/*                <p className="mt-0.5 text-xs text-ink-900/40">*/}
      {/*                  {formatDateTime(r.sentAt)}*/}
      {/*                </p>*/}
      {/*              </div>*/}
      {/*            </div>*/}
      {/*            {!r.read && (*/}
      {/*              <button*/}
      {/*                onClick={() => handleMarkRead(r.id)}*/}
      {/*                className="shrink-0 text-xs font-semibold text-amber-600 hover:underline"*/}
      {/*              >*/}
      {/*                Mark read*/}
      {/*              </button>*/}
      {/*            )}*/}
      {/*          </div>*/}
      {/*        ))}*/}
      {/*      </div>*/}
      {/*    )}*/}
      {/*  </div>*/}
      {/*)}*/}

      {/* Latest report */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Latest appraisal cycle</h2>
          {latest && (
            <Link to="/apar/my-reports" className="flex items-center gap-1 text-sm font-semibold text-ink-800 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {loadingReports ? (
          <Loader label="Loading your appraisal data…" />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : !latest ? (
          <div className="rounded-xl border border-dashed border-ink-900/15 px-6 py-10 text-center">
            <p className="font-medium text-ink-900">You haven't submitted an appraisal yet.</p>
            <p className="mt-1 text-sm text-ink-900/50">
              Start your self-appraisal to begin this year's review cycle.
            </p>
            <Link to="/apar/self-appraisal" className="btn-primary mt-4 inline-flex">
              <PlusCircle className="h-4 w-4" /> Start self-appraisal
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink-900">
                {latest.cycle || latest.appraisalYear || 'Current cycle'} Performance Appraisal
              </p>
              <p className="mt-1 text-sm text-ink-900/50">
                Submitted on {formatDate(latest.submittedAt || latest.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={statusBadgeClass(latest.status)}>{statusLabel(latest.status)}</span>
              <Link to="/apar/my-reports" className="btn-secondary">
                View details
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink-900">Before you begin</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-900/60">
          <li>• Keep your achievements specific and quantifiable wherever possible.</li>
          <li>• You can save your self-appraisal as a draft and return to it later.</li>
          <li>• Once submitted, your reporting officer will review and grade your appraisal.</li>
        </ul>
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
