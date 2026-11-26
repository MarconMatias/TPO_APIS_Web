import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { Cargando, ErrorDeCarga } from '../components/ui/Carga';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { API_BASE_URL } from '../config';
import { CATEGORIAS, categoriaPorSlug } from '../constants/negocio';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { esOrden, OPCIONES_ORDEN } from '../util/orden';
import styles from './Catalog.module.scss';
import { NotFound } from './NotFound';

/**
 * Catálogo general, por categoría (/catalogo/:categoria) o solo stock (/entrega-inmediata).
 * Categoría, stock y orden se resuelven en el backend (GET /productos?categoria=&stock=&orden=);
 * la marca se filtra acá para poder mostrar todas las marcas disponibles como chips.
 * Marca y orden viven en la URL (?marca=&orden=): se pueden compartir y sobreviven al "atrás".
 */
export function Catalog({ soloStock = false }) {
  const { categoria: slug } = useParams();
  const [params, setParams] = useSearchParams();

  const categoria = categoriaPorSlug(slug);
  const ordenParam = params.get('orden');
  const orden = esOrden(ordenParam) ? ordenParam : 'destacados';

  // null = todavía no llegó la primera respuesta (mientras recarga se siguen mostrando los anteriores).
  const [productos, setProductos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const query = new URLSearchParams({ orden });
    if (categoria) query.set('categoria', categoria);
    if (soloStock) query.set('stock', 'true');

    // Si el usuario cambia de filtro antes de que responda, la respuesta vieja se descarta.
    let vigente = true;
    // Al cambiar de filtro hay que reiniciar los estados antes de pedir (patrón de fetch en useEffect de la doc de React).
    // oxlint-disable-next-line react/set-state-in-effect
    setCargando(true);
    setError(false);
    fetch(`${API_BASE_URL}/productos?${query}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error HTTP ' + res.status);
        return res.json();
      })
      .then((datos) => {
        if (vigente) setProductos(datos);
      })
      .catch((err) => {
        console.error('Fallo al cargar el catálogo:', err);
        if (vigente) setError(true);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [categoria, soloStock, orden, recarga]);

  const alcance = productos ?? [];
  const marcas = [...new Set(alcance.map((p) => p.marca))].sort((a, b) => a.localeCompare(b, 'es'));
  const marcaParam = params.get('marca');
  const marca = marcaParam && marcas.includes(marcaParam) ? marcaParam : null;
  const resultado = marca ? alcance.filter((p) => p.marca === marca) : alcance;

  const titulo = soloStock ? 'Entrega inmediata' : categoria ? CATEGORIAS[categoria].label : 'Todo el catálogo';
  useDocumentTitle(titulo);

  if (slug && !categoria) return <NotFound />;

  const actualizarFiltro = (clave, valor) => {
    const siguientes = new URLSearchParams(params);
    if (valor) siguientes.set(clave, valor);
    else siguientes.delete(clave);
    setParams(siguientes, { replace: true });
  };

  return (
    <>
      <PageHeader
        id="catalogo-titulo"
        eyebrow={soloStock ? 'MISSL · Disponibilidad' : 'MISSL · Catálogo'}
        titulo={titulo}
        bajada={
          soloStock
            ? 'Artículos con stock físico en Buenos Aires: los despachamos dentro de 24 a 72 horas de acreditado el pago.'
            : 'Modelos por encargo con entrega en 3 semanas. Filtrá por marca y ordená según tu preferencia.'
        }
      />

      <form className={`${styles.toolbar} band`} role="search" aria-label="Filtrar productos" onSubmit={(e) => e.preventDefault()}>
        <fieldset className={styles.chips}>
          <legend className="sr-only">Marca</legend>
          <button type="button" className="chip" aria-pressed={marca === null} onClick={() => actualizarFiltro('marca', null)}>
            Todas las marcas
          </button>
          {marcas.map((m) => (
            <button key={m} type="button" className="chip" aria-pressed={marca === m} onClick={() => actualizarFiltro('marca', m)}>
              {m}
            </button>
          ))}
        </fieldset>

        <p className={styles.orden}>
          <output className="num" aria-live="polite">
            {productos ? `${resultado.length} ${resultado.length === 1 ? 'producto' : 'productos'}` : ''}
          </output>
          <label htmlFor="orden" className="eyebrow">Ordenar</label>
          <select
            id="orden"
            className="select"
            value={orden}
            onChange={(e) => actualizarFiltro('orden', e.target.value === 'destacados' ? null : e.target.value)}
          >
            {OPCIONES_ORDEN.map((o) => (
              <option key={o.valor} value={o.valor}>{o.label}</option>
            ))}
          </select>
        </p>
      </form>

      {error ? (
        <ErrorDeCarga onReintentar={() => setRecarga((n) => n + 1)} titulo="No pudimos cargar el catálogo" />
      ) : !productos ? (
        <Cargando texto="Cargando catálogo…" />
      ) : resultado.length > 0 ? (
        <section className="band" aria-labelledby="resultados-titulo" aria-busy={cargando}>
          <h2 id="resultados-titulo" className="sr-only">Resultados</h2>
          <ProductGrid productos={resultado} />
        </section>
      ) : (
        <EmptyState titulo="No encontramos productos" texto="No hay artículos publicados que coincidan con estos filtros.">
          {marca ? (
            <button type="button" className="btn" onClick={() => actualizarFiltro('marca', null)}>Ver todas las marcas</button>
          ) : (
            <Link to="/catalogo" className="btn">Ver todo el catálogo</Link>
          )}
        </EmptyState>
      )}
    </>
  );
}
