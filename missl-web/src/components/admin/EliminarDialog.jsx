import { useState } from 'react';
import { API_BASE_URL, ERROR_CONEXION } from '../../config';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useToastStore } from '../../store/toastStore';
import { Modal } from '../ui/Modal';

/** Confirmación de borrado → DELETE /admin/productos/{id} (baja lógica en el backend). */
export function EliminarDialog({ producto, onCerrar, onEliminado }) {
  const token = useAdminAuthStore((s) => s.token);
  const salir = useAdminAuthStore((s) => s.salir);
  const mostrarAviso = useToastStore((s) => s.mostrar);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e, cerrar) => {
    e.preventDefault();
    setEliminando(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/productos/${producto.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        salir();
        mostrarAviso('Tu sesión expiró. Volvé a ingresar para continuar.');
        return;
      }
      if (!res.ok) {
        const datos = await res.json().catch(() => null);
        throw new Error(datos?.mensajes?.join(' ') || 'No se pudo eliminar el producto.');
      }

      // Los carritos que lo tengan lo descartan solos al recargar precios (Cart y Checkout).
      mostrarAviso(`${producto.nombre} se eliminó del catálogo`);
      onEliminado();
      cerrar();
    } catch (err) {
      setError(err instanceof TypeError ? ERROR_CONEXION : err.message);
      setEliminando(false);
    }
  };

  return (
    <Modal tituloId="dlg-eliminar-titulo" onCerrar={onCerrar} bloqueado={eliminando}>
      {(cerrar) => (
        <form aria-busy={eliminando} onSubmit={(e) => handleSubmit(e, cerrar)}>
          <h2 id="dlg-eliminar-titulo">¿Eliminar producto?</h2>
          <p className="dlg-text">
            <strong>{producto.marca} {producto.nombre}</strong> ({producto.sku}) se va a quitar del catálogo. Las ventas
            ya realizadas se conservan.
          </p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <menu className="dlg-actions">
            <li>
              {/* autoFocus en la opción segura: Enter no borra por accidente. */}
              <button type="button" className="btn ghost" onClick={cerrar} disabled={eliminando} autoFocus>Cancelar</button>
            </li>
            <li>
              <button type="submit" className="btn danger" disabled={eliminando} aria-busy={eliminando}>
                {eliminando ? 'Eliminando…' : 'Eliminar'}
              </button>
            </li>
          </menu>
        </form>
      )}
    </Modal>
  );
}
