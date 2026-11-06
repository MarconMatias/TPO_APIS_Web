import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { EliminarDialog } from '../../components/admin/EliminarDialog';
import { ProductoDialog } from '../../components/admin/ProductoDialog';
import { PromocionDialog } from '../../components/admin/PromocionDialog';
import { Cargando, ErrorDeCarga } from '../../components/ui/Carga';
import { PageHeader } from '../../components/ui/PageHeader';
import { CATEGORIAS } from '../../constants/negocio';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useToastStore } from '../../store/toastStore';
import type { ProductoAdmin, PromocionAdmin } from '../../types/admin';
import { formatPrecio } from '../../util/precio';
import styles from './AdminPanel.module.scss';

/** Fila de la tabla: ProductoAdminDTO + su PromocionAdminDTO (dos endpoints del backend). */
interface Fila {
  producto: ProductoAdmin;
  promocion: PromocionAdmin | null;
}

async function cargarFilas(): Promise<Fila[]> {
  const [productos, promociones] = await Promise.all([adminApi.listarProductos(), adminApi.listarPromociones()]);
  return productos.map((producto) => ({
    producto,
    promocion: promociones.find((p) => p.id === producto.id) ?? null,
  }));
}

/** /admin/panel (protegido): ABM de productos, promociones y búsqueda. */
export function AdminPanel() {
  useDocumentTitle('Administración de productos');
  const navigate = useNavigate();
  const email = useAdminAuthStore((s) => s.email);
  const salir = useAdminAuthStore((s) => s.salir);
  const mostrarAviso = useToastStore((s) => s.mostrar);

  const { datos, error, recargar } = useApi(cargarFilas, []);
  const filas = useMemo(() => datos ?? [], [datos]);

  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState<ProductoAdmin | 'nuevo' | null>(null);
  const [promocionando, setPromocionando] = useState<PromocionAdmin | null>(null);
  const [borrando, setBorrando] = useState<ProductoAdmin | null>(null);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return filas;
    return filas.filter(({ producto: p }) => `${p.nombre} ${p.marca} ${p.sku}`.toLowerCase().includes(texto));
  }, [filas, busqueda]);

  const cerrarSesion = () => {
    salir();
    mostrarAviso('Cerraste la sesión de administrador');
    navigate('/admin');
  };

  return (
    <>
      <PageHeader
        id="h-admin"
        eyebrow="MISSL · Administración"
        titulo="Productos"
        bajada="Consultá el detalle, cargá, modificá, promocioná o eliminá los productos publicados en el catálogo."
      >
        <p className={styles.sesion}>
          Sesión: <strong>{email}</strong>
          <button type="button" className="link-btn" onClick={cerrarSesion}>Cerrar sesión</button>
        </p>
      </PageHeader>

      {error ? (
        <ErrorDeCarga error={error} onReintentar={recargar} titulo="No pudimos cargar los productos" />
      ) : !datos ? (
        <Cargando texto="Cargando productos…" />
      ) : (
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
                ? `${filtradas.length} de ${filas.length} productos`
                : `${filas.length} ${filas.length === 1 ? 'producto publicado' : 'productos publicados'}`}
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
                  <th scope="col">Promoción</th>
                  <th scope="col"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(({ producto: p, promocion }) => (
                  <tr key={p.id}>
                    <th scope="row">
                      {p.nombre}
                      <small>{p.marca} · {p.sku}</small>
                    </th>
                    <td>{CATEGORIAS[p.categoria].label}</td>
                    <td>{formatPrecio(p.precio)}</td>
                    <td>
                      <span className={p.enStock ? 'badge solid' : 'badge'}>{p.enStock ? 'En stock' : 'Por encargo'}</span>
                    </td>
                    <td>
                      {promocion?.restanteMs != null ? `−${promocion.descuentoPct}%` : 'Sin descuento'}
                      <small>{p.esTendencia ? 'En tendencia' : '—'}</small>
                    </td>
                    <td className={styles.acciones}>
                      <Link to={`/producto/${p.id}`} className="mini-btn">
                        Ver<span className="sr-only"> detalle de {p.nombre}</span>
                      </Link>
                      <button type="button" className="mini-btn" onClick={() => setEditando(p)}>
                        Modificar<span className="sr-only"> {p.nombre}</span>
                      </button>
                      {promocion && (
                        <button type="button" className="mini-btn" onClick={() => setPromocionando(promocion)}>
                          Promoción<span className="sr-only"> de {p.nombre}</span>
                        </button>
                      )}
                      <button type="button" className="mini-btn danger" onClick={() => setBorrando(p)}>
                        Eliminar<span className="sr-only"> {p.nombre}</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.vacio}>
                      {filas.length === 0 ? 'No hay productos publicados.' : `Ningún producto coincide con "${busqueda}".`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </figure>
        </section>
      )}

      {editando && (
        <ProductoDialog
          producto={editando === 'nuevo' ? null : editando}
          existentes={filas.map((f) => f.producto)}
          onCerrar={() => setEditando(null)}
          onGuardado={recargar}
        />
      )}
      {promocionando && (
        <PromocionDialog promocion={promocionando} onCerrar={() => setPromocionando(null)} onGuardado={recargar} />
      )}
      {borrando && <EliminarDialog producto={borrando} onCerrar={() => setBorrando(null)} onEliminado={recargar} />}
    </>
  );
}
