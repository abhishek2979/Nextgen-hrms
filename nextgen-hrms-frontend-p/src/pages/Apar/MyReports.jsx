
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { aparService } from '../../services/aparService'
import Loader from '../../components/common/Loader'
import { formatDate, statusBadgeClass, statusLabel } from '../../utils/helpers'

export default function MyReports() {
  const { user } = useAuth()
  const location = useLocation()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)


  useEffect(() => {
    let active = true
    aparService
      .getMyReports(user?.id)
      .then((data) => active && setReports(Array.isArray(data) ? data : []))
      .catch(() => active && setError('Could not load your reports right now.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user, location.key])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">My APAR Reports</h1>
        <p className="mt-1 text-sm text-ink-900/50">View the status and details of all your appraisal submissions.</p>
      </div>

      {location.state?.submitted && (
        <div className="rounded-xl bg-moss-500/10 px-4 py-3 text-sm font-medium text-moss-600">
          Your self-appraisal has been submitted and is now awaiting review.
        </div>
      )}

      {loading ? (
        <Loader label="Loading your reports…" />
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : reports.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <FileText className="h-8 w-8 text-ink-900/20" />
          <p className="font-medium text-ink-900">No appraisal reports yet</p>
          <p className="text-sm text-ink-900/50">Once you submit a self-appraisal, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const open = expandedId === r.id
            return (
              <div key={r.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedId(open ? null : r.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div>
                    <p className="font-semibold text-ink-900">{r.cycle || 'Appraisal cycle'}</p>
                    <p className="mt-0.5 text-xs text-ink-900/50">
                      {r.status?.toUpperCase() === 'APPROVED' || r.status?.toUpperCase() === 'REJECTED'
                        ? `Reviewed on ${formatDate(r.reviewedAt)}`
                        : `Submitted on ${formatDate(r.submittedAt || r.createdAt)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={statusBadgeClass(r.status)}>{statusLabel(r.status)}</span>
                    {open ? <ChevronUp className="h-4 w-4 text-ink-900/40" /> : <ChevronDown className="h-4 w-4 text-ink-900/40" />}
                  </div>
                </button>

                {open && (
                  <div className="border-t border-ink-900/5 px-5 py-4 text-sm">
                    <DetailRow label="Post held" value={r.postHeld} />
                    <DetailRow label="Period" value={`${formatDate(r.periodFrom)} – ${formatDate(r.periodTo)}`} />
                    <DetailRow label="Work summary" value={r.workSummary} block />
                    {Array.isArray(r.achievements) && r.achievements.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">Key achievements</p>
                        <ul className="mt-1 space-y-1 text-ink-900/70">
                          {r.achievements.map((a, i) => (
                            <li key={i}>• {a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <DetailRow label="Self rating" value={statusLabel(r.selfRating)} />

                    {r.status?.toUpperCase() === 'APPROVED' && (
                      <div className="mt-4 rounded-lg bg-moss-500/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-moss-600">Final grading</p>
                        <p className="mt-1 font-semibold text-ink-900">{statusLabel(r.finalGrading || r.grading)}</p>
                        {r.reviewerRemarks && <p className="mt-1 text-ink-900/60">{r.reviewerRemarks}</p>}
                      </div>
                    )}
                    {r.status?.toUpperCase() === 'REJECTED' && (
                      <div className="mt-4 rounded-lg bg-rose-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Returned for revision</p>
                        {r.reviewerRemarks && <p className="mt-1 text-ink-900/60">{r.reviewerRemarks}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value, block }) {
  if (!value) return null
  return (
    <div className={block ? 'mt-3' : 'mt-2 flex gap-2'}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">{label}</p>
      <p className={block ? 'mt-1 text-ink-900/70' : 'text-ink-900/70'}>{value}</p>
    </div>
  )
}
