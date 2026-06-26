export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isNotEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function statusLabel(status) {
  if (!status) return 'Draft'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

export function statusBadgeClass(status) {
  switch ((status || '').toUpperCase()) {
    case 'APPROVED':
      return 'badge badge-approved'
    case 'FORWARDED':
      return 'badge badge-forwarded'
    case 'REJECTED':
      return 'badge badge-rejected'
    case 'SUBMITTED':
    case 'PENDING':
      return 'badge badge-submitted'
    default:
      return 'badge badge-draft'
  }
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}
