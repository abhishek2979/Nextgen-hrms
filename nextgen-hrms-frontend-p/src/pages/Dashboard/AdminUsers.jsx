import { useEffect, useState } from 'react'
import { UserPlus, BellRing } from 'lucide-react'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { getInitials, isValidEmail, isNotEmpty } from '../../utils/helpers'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ employeeId: '', name: '', email: '', password: '', role: 'EMPLOYEE', department: '' })
  const [errors, setErrors] = useState({})
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [selected, setSelected] = useState(new Set())
  const [reminderOpen, setReminderOpen] = useState(false)
  const [reminderMessage, setReminderMessage] = useState('')
  const [sendingReminder, setSendingReminder] = useState(false)
  const [reminderError, setReminderError] = useState('')
  const [notice, setNotice] = useState(null)

  const hasAdmin = users.some((u) => (u.role || '').toUpperCase() === 'ADMIN')

  // The admin doesn't need to manage/select themselves in this table.
  const employees = users.filter((u) => (u.role || '').toUpperCase() !== 'ADMIN')

  const load = () => {
    setLoading(true)
    api
      .get('/users')
      .then(({ data }) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load users right now.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const validate = () => {
    const next = {}
    if (!isNotEmpty(form.employeeId)) next.employeeId = 'Required'
    if (!isNotEmpty(form.name)) next.name = 'Required'
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email'
    if (form.password.length < 6) next.password = 'Minimum 6 characters'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError('')
    if (!validate()) return
    setCreating(true)
    try {
      await api.post('/users', form)
      setOpen(false)
      setForm({ employeeId: '', name: '', email: '', password: '', role: 'EMPLOYEE', department: '' })
      load()
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Could not create user.')
    } finally {
      setCreating(false)
    }
  }

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) => (prev.size === employees.length ? new Set() : new Set(employees.map((u) => u.id))))
  }

  const openReminder = () => {
    setReminderMessage('')
    setReminderError('')
    setReminderOpen(true)
  }

  const sendReminder = async () => {
    setSendingReminder(true)
    setReminderError('')
    try {
      const { data } = await api.post('/users/send-reminders', {
        employeeIds: Array.from(selected),
        message: reminderMessage.trim() || undefined,
      })
      setNotice({ type: 'success', text: data?.message || 'Reminder sent.' })
      setReminderOpen(false)
      setSelected(new Set())
    } catch (err) {
      setReminderError(err.response?.data?.message || 'Could not send reminder. Please try again.')
    } finally {
      setSendingReminder(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Manage users</h1>
          <p className="mt-1 text-sm text-ink-900/50">Add employees and reviewers, and manage their roles.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4" /> Add user
        </Button>
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

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="card flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-ink-900">
            {selected.size} employee{selected.size === 1 ? '' : 's'} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={openReminder}>
              <BellRing className="h-4 w-4" /> Send reminder
            </Button>
            <Button variant="secondary" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader label="Loading users…" />
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : employees.length === 0 ? (
        <div className="card px-6 py-12 text-center text-sm text-ink-900/50">No employees added yet.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-100/60">
              <tr className="text-xs uppercase tracking-wide text-ink-900/40">
                <th className="w-10 px-5 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-ink-900/20 accent-ink-800"
                    checked={selected.size === employees.length}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Employee ID</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {employees.map((u) => (
                <tr key={u.id} className={selected.has(u.id) ? 'bg-amber-400/5' : undefined}>
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-ink-900/20 accent-ink-800"
                      checked={selected.has(u.id)}
                      onChange={() => toggleOne(u.id)}
                      aria-label={`Select ${u.name}`}
                    />
                  </td>
                  <td className="flex items-center gap-3 px-5 py-3 font-medium text-ink-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20 text-xs font-semibold text-amber-600">
                      {getInitials(u.name)}
                    </span>
                    {u.name}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-900/70">{u.employeeId || '—'}</td>
                  <td className="px-5 py-3 text-ink-900/60">{u.email}</td>
                  <td className="px-5 py-3 text-ink-900/60">{u.department || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="badge badge-draft capitalize">{(u.role || '').toLowerCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add user modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a new user"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={creating} onClick={handleCreate}>Create user</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4" noValidate>
          <Input
            label="Employee ID"
            placeholder="e.g. EMP10005"
            value={form.employeeId}
            onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
            error={errors.employeeId}
            hint="This is what the user signs in with."
          />
          <Input label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} />
          <Input label="Temporary password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} />
          <Input label="Department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
          <div>
            <label className="label-text" htmlFor="role">Role</label>
            <select id="role" className="input-field" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="EMPLOYEE">Employee</option>
              {!hasAdmin && <option value="ADMIN">Admin / Reviewer</option>}
            </select>
            {hasAdmin && (
              <p className="mt-1 text-xs text-ink-900/40">
                Only one admin account is allowed, and one already exists.
              </p>
            )}
          </div>
          {createError && <p className="text-sm font-medium text-rose-600">{createError}</p>}
        </form>
      </Modal>

      {/* Send reminder modal */}
      <Modal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        title={`Send reminder to ${selected.size} employee${selected.size === 1 ? '' : 's'}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReminderOpen(false)}>Cancel</Button>
            <Button loading={sendingReminder} onClick={sendReminder}>
              <BellRing className="h-4 w-4" /> Send reminder
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-sand-100 p-3 text-sm text-ink-900/70">
            <p className="font-semibold text-ink-900">Recipients:</p>
            <ul className="mt-1 space-y-0.5">
              {users.filter((u) => selected.has(u.id)).map((u) => (
                <li key={u.id}>• {u.name} ({u.employeeId || '—'})</li>
              ))}
            </ul>
          </div>
          <Input
            textarea
            rows={3}
            label="Message (optional)"
            placeholder="Please complete and submit your self-appraisal for this cycle."
            value={reminderMessage}
            onChange={(e) => setReminderMessage(e.target.value)}
          />
          {reminderError && <p className="text-sm font-medium text-rose-600">{reminderError}</p>}
        </div>
      </Modal>
    </div>
  )
}
