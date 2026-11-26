import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFound() {
  useDocumentTitle('Página no encontrada');
  return (
    <EmptyState nivel="h1" titulo="No encontramos esta página" texto="Puede que el enlace esté mal escrito o que la sección ya no exista.">
      <Link to="/" className="btn">Volver al inicio</Link>
      <Link to="/catalogo" className="btn ghost">Ver catálogo</Link>
    </EmptyState>
  );
}
