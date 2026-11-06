import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productosApi } from '../api/productosApi';
import { CuentaRegresiva } from '../components/product/CuentaRegresiva';
import { ProductGrid } from '../components/product/ProductGrid';
import { Cargando, ErrorDeCarga } from '../components/ui/Carga';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { Seccion } from '../components/ui/Seccion';
import { CATEGORIAS, LISTA_CATEGORIAS } from '../constants/negocio';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './Home.module.scss';

const POR_SECCION = 4;

export function Home() {
  useDocumentTitle('Zapatillas, indumentaria y carteras originales');
  // GET /productos: una sola lectura alimenta tendencias, promo y entrega inmediata.
  const { datos, cargando, error, recargar } = useApi(() => productosApi.listar(), []);
  const productos = useMemo(() => datos ?? [], [datos]);

  const tendencia = useMemo(() => productos.filter((p) => p.esTendencia).slice(0, POR_SECCION), [productos]);
  const enStock = useMemo(
    () => productos.filter((p) => p.enStock && !p.esTendencia).slice(0, POR_SECCION),
    [productos],
  );
  const promo = useMemo(() => productos.find((p) => p.promoActiva && p.promoRestanteMs !== null), [productos]);

  return (
    <>
      <header className={styles.hero}>
        <hgroup>
          <p className="eyebrow">Temporada 26 · Selección MISSL</p>
          <h1>Las piezas que buscás, traídas para vos.</h1>
          <p>
            Zapatillas, indumentaria y carteras originales por encargo, con entrega en tres semanas. También tenemos
            stock disponible para entrega inmediata.
          </p>
        </hgroup>
        <p className={styles.botones}>
          <Link to="/catalogo" className="btn">Ver catálogo</Link>
          <Link to="/entrega-inmediata" className="btn ghost">Entrega inmediata</Link>
        </p>
        <ImagePlaceholder texto="Foto editorial de portada" className={styles.foto} decorativa />
      </header>

      {cargando && !datos && <Cargando texto="Cargando productos…" />}
      {error && <ErrorDeCarga error={error} onReintentar={recargar} titulo="No pudimos cargar los productos" />}

      {tendencia.length > 0 && (
        <Seccion id="h-tendencia" titulo="En tendencia" enlace={{ to: '/catalogo', label: 'Ver todo' }}>
          <ProductGrid productos={tendencia} />
        </Seccion>
      )}

      {promo && promo.promoRestanteMs !== null && (
        <aside className={`${styles.promo} band`} aria-labelledby="h-promo">
          <hgroup>
            <p className="eyebrow">Promoción activa</p>
            <h2 id="h-promo">
              {promo.marca} {promo.nombre} con {promo.promoPct}% off
            </h2>
          </hgroup>
          <p className={styles.timer}>
            <span className="eyebrow">Termina en</span>
            <CuentaRegresiva key={promo.id} restanteMs={promo.promoRestanteMs} />
          </p>
          <Link to={`/producto/${promo.id}`} className="btn">
            Ver producto<span className="sr-only">: {promo.nombre}</span>
          </Link>
        </aside>
      )}

      {enStock.length > 0 && (
        <Seccion id="h-stock" titulo="Entrega inmediata" enlace={{ to: '/entrega-inmediata', label: 'Ver stock' }}>
          <ProductGrid productos={enStock} />
        </Seccion>
      )}

      <Seccion id="h-categorias" titulo="Categorías">
        <ul className={styles.categorias}>
          {LISTA_CATEGORIAS.map((cat) => (
            <li key={cat}>
              <Link to={`/catalogo/${CATEGORIAS[cat].slug}`}>
                <ImagePlaceholder texto={CATEGORIAS[cat].label} className={styles.catFoto} decorativa />
                <h3>
                  {CATEGORIAS[cat].label} <span aria-hidden="true">→</span>
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </Seccion>
    </>
  );
}
