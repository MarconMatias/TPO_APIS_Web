import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/** Para comprar hace falta una cuenta: sin sesión se redirige al registro y luego se vuelve. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const usuario = useAuthStore((s) => s.usuario);
  const { pathname } = useLocation();

  if (!usuario) {
    return <Navigate to={`/cuenta?volver=${encodeURIComponent(pathname)}`} replace />;
  }
  return children;
}
