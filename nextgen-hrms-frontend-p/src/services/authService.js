import api from './api'

export const authService = {
  /**
   * POST /api/auth/login
   * @returns { token, id, employeeId, name, email, role }
   */
  login: async (employeeId, password) => {
    const { data } = await api.post('/auth/login', { employeeId, password })
    return data
  },

  /**
   * POST /api/auth/forgot-password
   * Step 1: request a reset (e.g. sends an OTP/reset link to registered email)
   */
  forgotPassword: async (employeeId) => {
    const { data } = await api.post('/auth/forgot-password', { employeeId })
    return data
  },

  /**
   * POST /api/auth/reset-password
   * Step 2: set a new password using the employee ID (and OTP/token if your
   * backend issues one — add it to the payload here if required)
   */
  resetPassword: async ({ employeeId, otp, newPassword }) => {
    const { data } = await api.post('/auth/reset-password', { employeeId, otp, newPassword })
    return data
  },

  /**
   * POST /api/auth/register
   */
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    return data
  },

  /**
   * GET /api/auth/me — fetch the currently authenticated user
   */
  getProfile: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },

  logout: () => {
    localStorage.removeItem('hrms_token')
    localStorage.removeItem('hrms_user')
  },
}
