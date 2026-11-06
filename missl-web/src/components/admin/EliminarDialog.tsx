import { useState } from 'react';
import { ApiError } from '../../api/client';
import { adminApi } from '../../api/adminApi';
import { useToastStore } from '../../store/toastStore';
import type { ProductoAdmin } from '../../types/admin';
import { Modal } from '../ui/Modal';

interface EliminarDialogProps {
  producto: ProductoAdmin;
  onCerrar: () => void;
  onEliminado: () => void;
}

/** Confirmación de borrado → DELETE /admin/productos/{id} (baja lógica en el backend). */
export function EliminarDialog({ producto, onCerrar, onEliminado }: EliminarDialogProps) {
  const mostrarAviso = useToastStore((s) => s.mostrar);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal tituloId="dlg-eliminar-titulo" onCerrar={onCerrar} bloqueado={eliminando}>
      {(cerrar) => (
        <form
          aria-busy={eliminando}
          onSubmit={async (e) => {
            e.preventDefault();
            setEliminando(true);
            setError(null);
            try {
              await adminApi.eliminarProducto(producto.id);
              // Los carritos que lo tengan lo descartan solos al recargar precios (useCarrito).
              mostrarAviso(`${producto.nombre} se eliminó del catálogo`);
              onEliminado();
              cerrar();
            } catch (err) {
              setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el producto.');
              setEliminando(false);
            }
          }}
        >
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
