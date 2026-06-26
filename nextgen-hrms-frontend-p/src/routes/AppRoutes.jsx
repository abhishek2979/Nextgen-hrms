import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Auth/Login'
import ForgotPassword from '../pages/Auth/ForgotPassword'
import DashboardRouter from '../pages/Dashboard'
import AdminUsers from '../pages/Dashboard/AdminUsers'
import SelfAppraisalForm from '../pages/Apar/SelfAppraisalForm'
import MyReports from '../pages/Apar/MyReports'
import AssessmentView from '../pages/Apar/AssessmentView'
import NotFound from '../pages/NotFound'
import LayoutWrapper from '../components/layout/LayoutWrapper'
import ProtectedRoute from './ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Employee */}
          <Route path="/apar/self-appraisal" element={<SelfAppraisalForm />} />
          <Route path="/apar/my-reports" element={<MyReports />} />

          {/* Admin / reviewer only */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/apar/assessment" element={<AssessmentView />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
