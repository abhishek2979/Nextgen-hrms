import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, ClipboardCheck, Users, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const employeeLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/apar/self-appraisal', label: 'Self Appraisal', icon: FileText },
  { to: '/apar/my-reports', label: 'My APAR Reports', icon: ClipboardCheck },
]

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/apar/assessment', label: 'Review Appraisals', icon: ClipboardCheck },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
]

export default function Sidebar({ open, onClose }) {
  const { role } = useAuth()
  const links = role === 'ADMIN' ? adminLinks : employeeLinks

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-ink-900/5 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-800 font-display text-base font-bold text-amber-400">
              N
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-tight text-ink-900">NextGen HRMS</p>
              <p className="text-[11px] uppercase tracking-wide text-ink-900/40">APAR Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-900/50 hover:bg-sand-100 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ink-800 text-sand-50'
                    : 'text-ink-700 hover:bg-sand-100'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 w-full px-6">
          <div className="rounded-xl bg-sand-100 p-4 text-xs text-ink-900/60">
            <p className="font-semibold text-ink-800">Appraisal cycle 2025–26</p>
            <p className="mt-1">Window open for self-appraisal submissions.</p>
          </div>
        </div>
      </aside>
    </>
  )
}
