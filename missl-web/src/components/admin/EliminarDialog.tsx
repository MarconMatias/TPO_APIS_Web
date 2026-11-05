import { useCartStore } from '../../store/cartStore';
import { useProductStore } from '../../store/productStore';
import { useToastStore } from '../../store/toastStore';
import type { Producto } from '../../types';
import { Modal } from '../ui/Modal';

/** Confirmación de borrado en un <dialog> propio (el sitio no usa confirm()). */
export function EliminarDialog({ producto, onCerrar }: { producto: Producto; onCerrar: () => void }) {
  const eliminar = useProductStore((s) => s.eliminar);
  const quitarDelCarrito = useCartStore((s) => s.quitarProducto);
  const mostrarAviso = useToastStore((s) => s.mostrar);

  return (
    <Modal tituloId="dlg-eliminar-titulo" onCerrar={onCerrar}>
      {(cerrar) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            eliminar(producto.id);
            quitarDelCarrito(producto.id);
            mostrarAviso(`${producto.nombre} se eliminó del catálogo`);
            cerrar();
          }}
        >
          <h2 id="dlg-eliminar-titulo">¿Eliminar producto?</h2>
          <p className="dlg-text">
            <strong>{producto.marca} {producto.nombre}</strong> se va a quitar del catálogo y de los carritos. Esta acción
            no se puede deshacer.
          </p>
          <menu className="dlg-actions">
            <li>
              {/* autoFocus en la opción segura: Enter no borra por accidente. */}
              <button type="button" className="btn ghost" onClick={cerrar} autoFocus>Cancelar</button>
            </li>
            <li>
              <button type="submit" className="btn danger">Eliminar</button>
            </li>
          </menu>
        </form>
      )}
    </Modal>
  );
}
