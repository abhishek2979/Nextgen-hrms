import { useState, useEffect, useRef } from 'react'
import { Menu, ChevronDown, LogOut, User, Bell, CheckCheck, BellRing } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { reminderService } from '../../services/reminderService'
import { getInitials, formatDateTime } from '../../utils/helpers'

export default function Navbar({ onMenuClick }) {
  const { user, logout, role } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [reminders, setReminders] = useState([])
  const [markingAll, setMarkingAll] = useState(false)
  const navigate = useNavigate()
  const bellRef = useRef(null)

  const unreadCount = reminders.filter((r) => !r.read).length

  useEffect(() => {
    if (!user?.id || role !== 'EMPLOYEE') return
    let active = true
    const load = () => {
      reminderService
          .getMyReminders(user.id)
          .then((data) => active && setReminders(Array.isArray(data) ? data : []))
          .catch(() => {})
    }
    load()
    const interval = setInterval(load, 30000)
    return () => { active = false; clearInterval(interval) }
  }, [user, role])

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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

  const handleLogout = () => { logout(); navigate('/login') }

  return (
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-900/5 bg-sand-50/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="rounded-lg p-2 text-ink-700 hover:bg-sand-100 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm text-ink-900/50">Welcome back,</p>
            <p className="font-display text-base font-semibold text-ink-900">{user?.name?.split(' ')[0] || 'there'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">

          {role === 'EMPLOYEE' && (
              <div className="relative" ref={bellRef}>
                <button
                    onClick={() => { setBellOpen((v) => !v); setUserMenuOpen(false) }}
                    className="relative rounded-lg p-2 text-ink-700 hover:bg-sand-100"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
                  )}
                </button>

                {bellOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-ink-900/5 bg-white shadow-soft sm:w-96">
                      <div className="flex items-center justify-between border-b border-ink-900/5 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <BellRing className="h-4 w-4 text-amber-500" />
                          <p className="font-semibold text-ink-900">Reminders</p>
                          {unreadCount > 0 && (
                              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount} new
                      </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                disabled={markingAll}
                                className="flex items-center gap-1 text-xs font-semibold text-ink-800 hover:underline disabled:opacity-50"
                            >
                              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                            </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {reminders.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                              <Bell className="h-8 w-8 text-ink-900/20" />
                              <p className="text-sm text-ink-900/40">No reminders yet</p>
                            </div>
                        ) : (
                            reminders.map((r) => (
                                <div
                                    key={r.id}
                                    className={`flex items-start gap-3 border-b border-ink-900/5 px-4 py-3 last:border-0 ${r.read ? '' : 'bg-amber-400/10'}`}
                                >
                                  <div className="mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center">
                                    {!r.read && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-sm leading-snug ${r.read ? 'text-ink-900/60' : 'font-medium text-ink-900'}`}>
                                      {r.message}
                                    </p>
                                    <p className="mt-1 text-xs text-ink-900/40">{formatDateTime(r.sentAt)}</p>
                                  </div>
                                  {!r.read && (
                                      <button
                                          onClick={() => handleMarkRead(r.id)}
                                          className="shrink-0 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-400/25"
                                      >
                                        Read
                                      </button>
                                  )}
                                </div>
                            ))
                        )}
                      </div>

                      {reminders.length > 0 && (
                          <div className="border-t border-ink-900/5 px-4 py-2.5 text-center">
                            <p className="text-xs text-ink-900/40">{reminders.length} reminder{reminders.length === 1 ? '' : 's'} total</p>
                          </div>
                      )}
                    </div>
                )}
              </div>
          )}

          <div className="relative">
            <button
                onClick={() => { setUserMenuOpen((v) => !v); setBellOpen(false) }}
                className="flex items-center gap-2 rounded-xl border border-ink-900/10 bg-white px-2.5 py-1.5 transition-colors hover:bg-sand-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20 text-sm font-semibold text-amber-600">
                {getInitials(user?.name)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight text-ink-900">{user?.name}</p>
                <p className="text-xs capitalize leading-tight text-ink-900/50">{user?.role?.toLowerCase()}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-ink-900/40" />
            </button>

            {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-ink-900/5 bg-white p-1.5 shadow-soft">
                    <div className="px-3 py-2 text-xs text-ink-900/50">{user?.email}</div>
                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-sand-100">
                      <User className="h-4 w-4" /> My Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
            )}
          </div>

        </div>
      </header>
  )
}