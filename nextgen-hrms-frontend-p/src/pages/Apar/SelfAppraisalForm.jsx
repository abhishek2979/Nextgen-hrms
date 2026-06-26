import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save, Send, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { aparService } from '../../services/aparService'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

const emptyAchievement = () => ({ id: crypto.randomUUID(), description: '' })
const emptyTarget = () => ({ id: crypto.randomUUID(), target: '', achievement: '' })

const RATINGS = [
  { value: '', label: 'Select a rating' },
  { value: 'OUTSTANDING', label: 'Outstanding' },
  { value: 'VERY_GOOD', label: 'Very Good' },
  { value: 'GOOD', label: 'Good' },
  { value: 'AVERAGE', label: 'Average' },
  { value: 'BELOW_AVERAGE', label: 'Below Average' },
]

export default function SelfAppraisalForm() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const currentYear = new Date().getFullYear()
  const [form, setForm] = useState({
    cycle: `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
    periodFrom: '',
    periodTo: '',
    postHeld: '',
    workSummary: '',
    achievements: [emptyAchievement()],
    targets: [emptyTarget()],
    trainingsAttended: '',
    selfRating: '',
    additionalRemarks: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState(null)

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const updateListItem = (listKey, id, field, value) => {
    setForm((f) => ({
      ...f,
      [listKey]: f[listKey].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  const addListItem = (listKey, factory) =>
    setForm((f) => ({ ...f, [listKey]: [...f[listKey], factory()] }))

  const removeListItem = (listKey, id) =>
    setForm((f) => ({ ...f, [listKey]: f[listKey].filter((item) => item.id !== id) }))

  const validate = () => {
    const next = {}
    if (!form.periodFrom) next.periodFrom = 'Required'
    if (!form.periodTo) next.periodTo = 'Required'
    if (!form.postHeld.trim()) next.postHeld = 'Required'
    if (!form.workSummary.trim()) next.workSummary = 'Please summarise your role and responsibilities.'
    if (!form.selfRating) next.selfRating = 'Please select a self-assessment rating.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const buildPayload = () => ({
    employeeId: user?.id,
    cycle: form.cycle,
    periodFrom: form.periodFrom,
    periodTo: form.periodTo,
    postHeld: form.postHeld,
    workSummary: form.workSummary,
    achievements: form.achievements.map((a) => a.description).filter(Boolean),
    targets: form.targets
      .filter((t) => t.target || t.achievement)
      .map(({ target, achievement }) => ({ target, achievement })),
    trainingsAttended: form.trainingsAttended,
    selfRating: form.selfRating,
    additionalRemarks: form.additionalRemarks,
  })

  const handleSaveDraft = async () => {
    setNotice(null)
    setSaving(true)
    try {
      await aparService.saveDraft(buildPayload())
      setNotice({ type: 'success', text: 'Draft saved. You can come back and finish it anytime.' })
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Could not save draft. Try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setNotice(null)
    if (!validate()) {
      setNotice({ type: 'error', text: 'Please complete the highlighted fields before submitting.' })
      return
    }
    setSubmitting(true)
    try {
      await aparService.submitReport(buildPayload())
      navigate('/dashboard', { state: { submitted: true } })
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Submission failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-ink-900/50 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Self Appraisal — {form.cycle}</h1>
        <p className="mt-1 text-sm text-ink-900/50">
          Describe your work during the appraisal period in your own words. Be specific — this forms
          the basis of your reporting officer's assessment.
        </p>
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

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Basic details */}
        <section className="card p-6">
          <h2 className="text-base font-semibold text-ink-900">1. Basic details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Employee name" value={user?.name || ''} disabled />
            <Input label="Department" value={user?.department || '—'} disabled />
            <Input
              label="Post held during the period"
              placeholder="e.g. Assistant Section Officer"
              value={form.postHeld}
              onChange={(e) => update('postHeld', e.target.value)}
              error={errors.postHeld}
            />
            <Input label="Appraisal cycle" value={form.cycle} onChange={(e) => update('cycle', e.target.value)} />
            <Input
              type="date"
              label="Period from"
              value={form.periodFrom}
              onChange={(e) => update('periodFrom', e.target.value)}
              error={errors.periodFrom}
            />
            <Input
              type="date"
              label="Period to"
              value={form.periodTo}
              onChange={(e) => update('periodTo', e.target.value)}
              error={errors.periodTo}
            />
          </div>
        </section>

        {/* Work summary */}
        <section className="card p-6">
          <h2 className="text-base font-semibold text-ink-900">2. Summary of work done</h2>
          <p className="mt-1 text-sm text-ink-900/50">
            Briefly describe your core responsibilities and how you carried them out.
          </p>
          <Input
            textarea
            rows={5}
            className="mt-4"
            placeholder="During this period, I was responsible for…"
            value={form.workSummary}
            onChange={(e) => update('workSummary', e.target.value)}
            error={errors.workSummary}
          />
        </section>

        {/* Achievements */}
        <section className="card p-6">
          <h2 className="text-base font-semibold text-ink-900">3. Key achievements</h2>
          <p className="mt-1 text-sm text-ink-900/50">List specific accomplishments, ideally with measurable outcomes.</p>
          <div className="mt-4 space-y-3">
            {form.achievements.map((item, idx) => (
              <div key={item.id} className="flex items-start gap-2">
                <span className="mt-3 text-sm font-semibold text-ink-900/30">{idx + 1}.</span>
                <Input
                  className="flex-1"
                  placeholder="e.g. Digitised the leave record system, reducing processing time by 40%"
                  value={item.description}
                  onChange={(e) => updateListItem('achievements', item.id, 'description', e.target.value)}
                />
                {form.achievements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeListItem('achievements', item.id)}
                    className="mt-2.5 rounded-lg p-1.5 text-ink-900/30 hover:bg-rose-50 hover:text-rose-500"
                    aria-label="Remove achievement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addListItem('achievements', emptyAchievement)}
            className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-ink-800 hover:underline"
          >
            <Plus className="h-4 w-4" /> Add another achievement
          </button>
        </section>

        {/* Targets vs achievements */}
        <section className="card p-6">
          <h2 className="text-base font-semibold text-ink-900">4. Targets vs. achievements</h2>
          <p className="mt-1 text-sm text-ink-900/50">If targets were set for this period, list them alongside what was achieved.</p>
          <div className="mt-4 space-y-3">
            {form.targets.map((item) => (
              <div key={item.id} className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Target"
                    value={item.target}
                    onChange={(e) => updateListItem('targets', item.id, 'target', e.target.value)}
                  />
                </div>
                <div className="flex items-start gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Achievement against target"
                    value={item.achievement}
                    onChange={(e) => updateListItem('targets', item.id, 'achievement', e.target.value)}
                  />
                  {form.targets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeListItem('targets', item.id)}
                      className="mt-2.5 rounded-lg p-1.5 text-ink-900/30 hover:bg-rose-50 hover:text-rose-500"
                      aria-label="Remove target"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addListItem('targets', emptyTarget)}
            className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-ink-800 hover:underline"
          >
            <Plus className="h-4 w-4" /> Add another target
          </button>
        </section>

        {/* Training */}
        <section className="card p-6">
          <h2 className="text-base font-semibold text-ink-900">5. Training & development</h2>
          <Input
            textarea
            rows={3}
            className="mt-4"
            placeholder="List any training programmes, workshops, or courses attended during this period."
            value={form.trainingsAttended}
            onChange={(e) => update('trainingsAttended', e.target.value)}
          />
        </section>

        {/* Self rating */}
        <section className="card p-6">
          <h2 className="text-base font-semibold text-ink-900">6. Overall self-assessment</h2>
          <div className="mt-4 max-w-xs">
            <label className="label-text" htmlFor="selfRating">Self-assessment grading</label>
            <select
              id="selfRating"
              className={`input-field ${errors.selfRating ? 'border-rose-400' : ''}`}
              value={form.selfRating}
              onChange={(e) => update('selfRating', e.target.value)}
            >
              {RATINGS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.selfRating && <p className="mt-1 text-xs font-medium text-rose-600">{errors.selfRating}</p>}
          </div>
          <Input
            textarea
            rows={3}
            className="mt-4"
            label="Additional remarks (optional)"
            placeholder="Anything else you'd like your reviewing officer to know."
            value={form.additionalRemarks}
            onChange={(e) => update('additionalRemarks', e.target.value)}
          />
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" loading={saving} onClick={handleSaveDraft}>
            <Save className="h-4 w-4" /> Save as draft
          </Button>
          <Button type="submit" loading={submitting}>
            <Send className="h-4 w-4" /> Submit appraisal
          </Button>
        </div>
      </form>
    </div>
  )
}
