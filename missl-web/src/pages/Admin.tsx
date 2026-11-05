import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EliminarDialog } from '../components/admin/EliminarDialog';
import { ProductoDialog } from '../components/admin/ProductoDialog';
import { PageHeader } from '../components/ui/PageHeader';
import { CATEGORIAS } from '../data/catalogo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useProductStore } from '../store/productStore';
import { useToastStore } from '../store/toastStore';
import type { Producto } from '../types';
import { formatPrecio, precioFinal } from '../util/precio';
import styles from './Admin.module.scss';

const codigo = (p: Producto) => 'MSL-' + p.id.toUpperCase();

/** Listado de productos con búsqueda, detalle, alta, modificación y borrado. */
export function Admin() {
  useDocumentTitle('Administración de productos');
  const productos = useProductStore((s) => s.productos);
  const restablecer = useProductStore((s) => s.restablecer);
  const mostrarAviso = useToastStore((s) => s.mostrar);

  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState<Producto | 'nuevo' | null>(null);
  const [borrando, setBorrando] = useState<Producto | null>(null);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return productos;
    return productos.filter((p) => `${p.nombre} ${p.marca} ${codigo(p)}`.toLowerCase().includes(texto));
  }, [productos, busqueda]);

  return (
    <>
      <PageHeader
        id="h-admin"
        eyebrow="MISSL · Administración"
        titulo="Productos"
        bajada="Consultá el detalle, cargá, modificá o eliminá los productos publicados en el catálogo."
      />

      <section className={`${styles.admin} band`} aria-label="Listado de productos">
        <header className={styles.bar}>
          <form role="search" className={styles.buscar} onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="admin-buscar" className="sr-only">Buscar productos</label>
            <input
              id="admin-buscar"
              type="search"
              className="select"
              placeholder="Buscar por nombre, marca o código"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </form>
          <output className="num" aria-live="polite">
            {busqueda
              ? `${filtrados.length} de ${productos.length} productos`
              : `${productos.length} ${productos.length === 1 ? 'producto publicado' : 'productos publicados'}`}
          </output>
          <button type="button" className="btn" onClick={() => setEditando('nuevo')}>Nuevo producto</button>
        </header>

        <figure className="table-scroll">
          <table className={`${styles.tabla} num`}>
            <caption className="sr-only">Productos publicados en el catálogo</caption>
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Categoría</th>
                <th scope="col">Precio</th>
                <th scope="col">Disponibilidad</th>
                <th scope="col"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id}>
                  <th scope="row">
                    {p.nombre}
                    <small>{p.marca} · {codigo(p)}</small>
                  </th>
                  <td>{CATEGORIAS[p.categoria].label}</td>
                  <td>
                    {formatPrecio(precioFinal(p))}
                    {p.descuento > 0 && <small>−{p.descuento}% sobre {formatPrecio(p.precio)}</small>}
                  </td>
                  <td>
                    <span className={p.enStock ? 'badge solid' : 'badge'}>{p.enStock ? 'En stock' : 'Por encargo'}</span>
                  </td>
                  <td className={styles.acciones}>
                    <Link to={`/producto/${p.id}`} className="mini-btn">
                      Ver detalle<span className="sr-only"> de {p.nombre}</span>
                    </Link>
                    <button type="button" className="mini-btn" onClick={() => setEditando(p)}>
                      Modificar<span className="sr-only"> {p.nombre}</span>
                    </button>
                    <button type="button" className="mini-btn danger" onClick={() => setBorrando(p)}>
                      Eliminar<span className="sr-only"> {p.nombre}</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.vacio}>
                    {productos.length === 0 ? 'No hay productos publicados.' : `Ningún producto coincide con "${busqueda}".`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </figure>

        <p className="note">
          Los cambios se guardan en este navegador (datos simulados).{' '}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              restablecer();
              mostrarAviso('Se restauraron los productos de ejemplo');
            }}
          >
            Restaurar productos de ejemplo
          </button>
        </p>
      </section>

      {editando && <ProductoDialog producto={editando === 'nuevo' ? null : editando} onCerrar={() => setEditando(null)} />}
      {borrando && <EliminarDialog producto={borrando} onCerrar={() => setBorrando(null)} />}
    </>
  );
}
