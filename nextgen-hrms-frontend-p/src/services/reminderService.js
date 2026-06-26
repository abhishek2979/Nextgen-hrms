import api from './api'

export const reminderService = {
  // Employee: get all reminders sent to them
  getMyReminders: async (employeeId) => {
    const { data } = await api.get('/reminders/my-reminders', {
      params: { employeeId },
    })
    return data
  },

  // Employee: get count of unread reminders (for bell badge)
  getUnreadCount: async (employeeId) => {
    const { data } = await api.get('/reminders/unread-count', {
      params: { employeeId },
    })
    return data.count || 0
  },

  // Employee: mark one reminder as read
  markRead: async (id) => {
    const { data } = await api.put(`/reminders/${id}/read`)
    return data
  },

  // Employee: mark all reminders as read
  markAllRead: async (employeeId) => {
    const { data } = await api.put('/reminders/mark-all-read', null, {
      params: { employeeId },
    })
    return data
  },
}
