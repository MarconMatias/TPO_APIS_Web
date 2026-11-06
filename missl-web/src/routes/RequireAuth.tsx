import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/** Comprar requiere cuenta (no hay checkout invitado): sin JWT de cliente se redirige al registro y luego se vuelve. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const { pathname } = useLocation();

  if (!token) {
    return <Navigate to={`/cuenta?volver=${encodeURIComponent(pathname)}`} replace />;
  }
  return children;
}
