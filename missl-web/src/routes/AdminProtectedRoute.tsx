import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';

/** El panel requiere JWT de administrador (obtenido tras contraseña + 2FA). Si vence, vuelve al login. */
export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAdminAuthStore((s) => s.token);
  if (!token) return <Navigate to="/admin" replace />;
  return children;
}
