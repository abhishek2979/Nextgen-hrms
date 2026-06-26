import { useAuth } from '../../context/AuthContext'
import EmployeeDashboard from './EmployeeDashboard'
import AdminDashboard from './AdminDashboard'

export default function DashboardRouter() {
  const { role } = useAuth()
  return role === 'ADMIN' ? <AdminDashboard /> : <EmployeeDashboard />
}
