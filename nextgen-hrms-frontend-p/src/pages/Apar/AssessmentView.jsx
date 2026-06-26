import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, FileSearch, Send } from 'lucide-react'
import { aparService } from '../../services/aparService'
import Loader from '../../components/common/Loader'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { formatDate, statusBadgeClass, statusLabel } from '../../utils/helpers'

const FILTERS = [
  { value: 'SUBMITTED', label: 'Pending review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'FORWARDED', label: 'Forwarded' },
  { value: 'REJECTED', label: 'Returned' },
  { value: '', label: 'All' },
]

const GRADINGS = [
  { value: '', label: 'Select grading' },
  { value: 'OUTSTANDING', label: 'Outstanding' },
  { value: 'VERY_GOOD', label: 'Very Good' },
  { value: 'GOOD', label: 'Good' },
  { value: 'AVERAGE', label: 'Average' },
  { value: 'BELOW_AVERAGE', label: 'Below Average' },
]

// Which filters support row-selection + a bulk action bar, and what that
// bulk action does.
const BULK_ACTIONS = {
  SUBMITTED: [
    { type: 'bulk-approve', label: 'Approve selected', icon: CheckCircle2, variant: 'primary' },
    { type: 'bulk-reject', label: 'Return selected', icon: XCircle, variant: 'danger' },
  ],
  APPROVED: [
    { type: 'bulk-forward', label: 'Forward to Head Office', icon: Send, variant: 'primary' },
  ],
}

export default function AssessmentView() {
  const [filter, setFilter] = useState('SUBMITTED')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(new Set())

  // Single-row view/action modal state
  const [active, setActive] = useState(null)
  const [actionType, setActionType] = useState(null) // 'approve' | 'reject' | 'forward' | 'bulk-approve' | 'bulk-reject' | 'bulk-forward'
  const [remarks, setRemarks] = useState('')
  const [grading, setGrading] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState(null)

  const load = () => {
    setLoading(true)
    aparService
      .getAllReports(filter || undefined)
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load appraisal reports right now.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setError('')
    setSelected(new Set())
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const bulkActions = BULK_ACTIONS[filter] || []
  const showCheckboxes = bulkActions.length > 0

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) => (prev.size === reports.length ? new Set() : new Set(reports.map((r) => r.id))))
  }

  const openAction = (report, type) => {
    setActive(report)
    setActionType(type)
    setRemarks('')
    setGrading('')
    setActionError('')
  }

  const openBulkAction = (type) => {
    setActive(null)
    setActionType(type)
    setRemarks('')
    setGrading('')
    setActionError('')
  }

  const closeAction = () => {
    setActive(null)
    setActionType(null)
  }

  const isBulk = actionType?.startsWith('bulk-')

  const submitAction = async () => {
    const needsGrading = actionType === 'approve' || actionType === 'bulk-approve'
    const needsReason = actionType === 'reject' || actionType === 'bulk-reject'

    if (needsGrading && !grading) {
      setActionError('Please select a final grading before approving.')
      return
    }
    if (needsReason && !remarks.trim()) {
      setActionError('Please add a remark explaining what needs revision.')
      return
    }

    setSubmitting(true)
    setActionError('')
    setNotice(null)
    try {
      switch (actionType) {
        case 'approve':
          await aparService.approveReport(active.id, remarks, grading)
          break
        case 'reject':
          await aparService.rejectReport(active.id, remarks)
          break
        case 'forward':
          await aparService.forwardReport(active.id, remarks)
          break
        case 'bulk-approve': {
          const ids = Array.from(selected)
          const res = await aparService.bulkApprove(ids, remarks, grading)
          setNotice({ type: 'success', text: res?.message || `${ids.length} report(s) approved.` })
          break
        }
        case 'bulk-reject': {
          const ids = Array.from(selected)
          const res = await aparService.bulkReject(ids, remarks)
          setNotice({ type: 'success', text: res?.message || `${ids.length} report(s) returned.` })
          break
        }
        case 'bulk-forward': {
          const ids = Array.from(selected)
          const res = await aparService.bulkForward(ids, remarks)
          setNotice({ type: 'success', text: res?.message || `${ids.length} report(s) forwarded.` })
          break
        }
        default:
          break
      }
      setSelected(new Set())
      closeAction()
      load()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const actionTitles = {
    approve: 'Approve appraisal',
    reject: 'Return for revision',
    forward: 'Forward to Head Office',
    'bulk-approve': `Approve ${selected.size} appraisal${selected.size === 1 ? '' : 's'}`,
    'bulk-reject': `Return ${selected.size} appraisal${selected.size === 1 ? '' : 's'} for revision`,
    'bulk-forward': `Forward ${selected.size} appraisal${selected.size === 1 ? '' : 's'} to Head Office`,
  }

  const confirmLabels = {
    approve: 'Confirm approval',
    reject: 'Confirm return',
    forward: 'Confirm forward',
    'bulk-approve': 'Approve selected',
    'bulk-reject': 'Return selected',
    'bulk-forward': 'Forward selected',
  }

  const dangerVariants = new Set(['reject', 'bulk-reject'])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Review appraisals</h1>
        <p className="mt-1 text-sm text-ink-900/50">Assess self-appraisals submitted by your team and record a final grading.</p>
      </div>

      {notice && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            notice.type === 'success' ? 'bg-moss-500/10 text-moss-600' : 'bg-rose-50 text-rose-600'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.value ? 'bg-ink-800 text-sand-50' : 'bg-white text-ink-700 border border-ink-900/10 hover:bg-sand-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {showCheckboxes && selected.size > 0 && (
        <div className="card flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-ink-900">
            {selected.size} employee{selected.size === 1 ? '' : 's'} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {bulkActions.map(({ type, label, icon: Icon, variant }) => (
              <Button key={type} variant={variant} onClick={() => openBulkAction(type)}>
                <Icon className="h-4 w-4" /> {label}
              </Button>
            ))}
            <Button variant="secondary" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader label="Loading reports…" />
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : reports.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <FileSearch className="h-8 w-8 text-ink-900/20" />
          <p className="font-medium text-ink-900">No reports in this view</p>
          <p className="text-sm text-ink-900/50">Try selecting a different filter above.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand-100/60">
                <tr className="text-xs uppercase tracking-wide text-ink-900/40">
                  {showCheckboxes && (
                    <th className="w-10 px-5 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-ink-900/20 accent-ink-800"
                        checked={selected.size === reports.length}
                        onChange={toggleAll}
                        aria-label="Select all"
                      />
                    </th>
                  )}
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Cycle</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5">
                {reports.map((r) => {
                  const status = (r.status || '').toUpperCase()
                  return (
                    <tr key={r.id} className={selected.has(r.id) ? 'bg-amber-400/5' : undefined}>
                      {showCheckboxes && (
                        <td className="px-5 py-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-ink-900/20 accent-ink-800"
                            checked={selected.has(r.id)}
                            onChange={() => toggleOne(r.id)}
                            aria-label={`Select ${r.employeeName || 'employee'}`}
                          />
                        </td>
                      )}
                      <td className="px-5 py-3 font-medium text-ink-900">{r.employeeName || 'Employee'}</td>
                      <td className="px-5 py-3 text-ink-900/60">{r.department || '—'}</td>
                      <td className="px-5 py-3 text-ink-900/60">{r.cycle || '—'}</td>
                      <td className="px-5 py-3 text-ink-900/60">{formatDate(r.submittedAt || r.createdAt)}</td>
                      <td className="px-5 py-3">
                        <span className={statusBadgeClass(r.status)}>{statusLabel(r.status)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" onClick={() => setActive(r)}>
                            View
                          </Button>
                          {status === 'SUBMITTED' && (
                            <>
                              <Button variant="danger" onClick={() => openAction(r, 'reject')}>
                                <XCircle className="h-4 w-4" /> Return
                              </Button>
                              <Button onClick={() => openAction(r, 'approve')}>
                                <CheckCircle2 className="h-4 w-4" /> Approve
                              </Button>
                            </>
                          )}
                          {status === 'APPROVED' && (
                            <Button onClick={() => openAction(r, 'forward')}>
                              <Send className="h-4 w-4" /> Forward
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View report details (no action) */}
      <Modal
        open={!!active && !actionType}
        onClose={() => setActive(null)}
        title={active ? `${active.employeeName || 'Employee'} — ${active.cycle || 'Appraisal'}` : ''}
        footer={<Button variant="secondary" onClick={() => setActive(null)}>Close</Button>}
      >
        {active && (
          <div className="space-y-3 text-sm">
            <Detail label="Post held" value={active.postHeld} />
            <Detail label="Period" value={`${formatDate(active.periodFrom)} – ${formatDate(active.periodTo)}`} />
            <Detail label="Work summary" value={active.workSummary} />
            {Array.isArray(active.achievements) && active.achievements.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">Key achievements</p>
                <ul className="mt-1 space-y-1 text-ink-900/70">
                  {active.achievements.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>
            )}
            <Detail label="Self rating" value={statusLabel(active.selfRating)} />
            <Detail label="Additional remarks" value={active.additionalRemarks} />
            {active.reviewerRemarks && <Detail label="Reviewer remarks" value={active.reviewerRemarks} />}
            {active.finalGrading && <Detail label="Final grading" value={statusLabel(active.finalGrading)} />}
          </div>
        )}
      </Modal>

      {/* Single + bulk action modal */}
      <Modal
        open={!!actionType}
        onClose={closeAction}
        title={actionTitles[actionType] || ''}
        footer={
          <>
            <Button variant="secondary" onClick={closeAction}>Cancel</Button>
            <Button
              variant={dangerVariants.has(actionType) ? 'danger' : 'primary'}
              loading={submitting}
              onClick={submitAction}
            >
              {confirmLabels[actionType] || 'Confirm'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {!isBulk ? (
            <p className="text-sm text-ink-900/60">
              {active?.employeeName} — {active?.cycle}
            </p>
          ) : (
            <div className="rounded-lg bg-sand-100 p-3 text-sm text-ink-900/70">
              <p className="font-semibold text-ink-900">{selected.size} employee{selected.size === 1 ? '' : 's'} selected:</p>
              <ul className="mt-1 space-y-0.5">
                {reports.filter((r) => selected.has(r.id)).map((r) => (
                  <li key={r.id}>• {r.employeeName} ({r.department || '—'})</li>
                ))}
              </ul>
            </div>
          )}

          {(actionType === 'approve' || actionType === 'bulk-approve') && (
            <div>
              <label className="label-text" htmlFor="grading">Final grading</label>
              <select id="grading" className="input-field" value={grading} onChange={(e) => setGrading(e.target.value)}>
                {GRADINGS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
              {actionType === 'bulk-approve' && (
                <p className="mt-1 text-xs text-ink-900/40">This grading will be applied to all selected reports.</p>
              )}
            </div>
          )}

          <Input
            textarea
            rows={4}
            label={
              actionType === 'approve' || actionType === 'bulk-approve'
                ? 'Remarks (optional)'
                : actionType === 'forward' || actionType === 'bulk-forward'
                ? 'Note for the next-level reviewer (optional)'
                : 'Reason for return'
            }
            placeholder={
              actionType === 'approve' || actionType === 'bulk-approve'
                ? 'Add any feedback for the employee…'
                : actionType === 'forward' || actionType === 'bulk-forward'
                ? 'Add any context for the Head Office reviewer…'
                : 'Let the employee know what needs to be revised…'
            }
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          {actionError && <p className="text-sm font-medium text-rose-600">{actionError}</p>}
        </div>
      </Modal>
    </div>
  )
}

function Detail({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">{label}</p>
      <p className="mt-0.5 text-ink-900/70">{value}</p>
    </div>
  )
}
