import api from './api'

export const aparService = {
  // Employee: fetch their own APAR reports
  getMyReports: async (employeeId) => {
    const { data } = await api.get('/apar/my-reports', {
      params: employeeId ? { employeeId } : {},
    })
    return data
  },

  // Employee: get a single report by id
  getReportById: async (id) => {
    const { data } = await api.get(`/apar/${id}`)
    return data
  },

  // Employee: submit a new self-appraisal
  submitReport: async (payload) => {
    const { data } = await api.post('/apar/submit', payload)
    return data
  },

  // Employee: save a draft without submitting
  saveDraft: async (payload) => {
    const { data } = await api.post('/apar/draft', payload)
    return data
  },

  // Admin/Reviewer: list all reports, optionally filtered by status
  getAllReports: async (status) => {
    const { data } = await api.get('/apar/all', { params: status ? { status } : {} })
    return data
  },

  // Admin/Reviewer: approve a report with remarks & grading
  approveReport: async (id, remarks, grading) => {
    const { data } = await api.put(`/apar/${id}/approve`, { remarks, grading })
    return data
  },

  // Admin/Reviewer: reject/return a report with remarks
  rejectReport: async (id, remarks) => {
    const { data } = await api.put(`/apar/${id}/reject`, { remarks })
    return data
  },

  // Admin/HOD: forward a single approved report to the next-level reviewer
  forwardReport: async (id, remarks) => {
    const { data } = await api.put(`/apar/${id}/forward`, { remarks })
    return data
  },

  // Admin/Reviewer: approve multiple reports at once
  bulkApprove: async (ids, remarks, grading) => {
    const { data } = await api.put('/apar/bulk-approve', { ids, remarks, grading })
    return data
  },

  // Admin/Reviewer: return multiple reports for revision at once
  bulkReject: async (ids, remarks) => {
    const { data } = await api.put('/apar/bulk-reject', { ids, remarks })
    return data
  },

  // Admin/HOD: forward multiple approved reports to the next-level reviewer
  bulkForward: async (ids, remarks) => {
    const { data } = await api.put('/apar/bulk-forward', { ids, remarks })
    return data
  },
}
