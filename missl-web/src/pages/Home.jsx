import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CuentaRegresiva } from '../components/product/CuentaRegresiva';
import { ProductGrid } from '../components/product/ProductGrid';
import { Cargando, ErrorDeCarga } from '../components/ui/Carga';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { Seccion } from '../components/ui/Seccion';
import { API_BASE_URL } from '../config';
import { CATEGORIAS, LISTA_CATEGORIAS } from '../constants/negocio';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './Home.module.scss';

const POR_SECCION = 4;

export function Home() {
  useDocumentTitle('Zapatillas, indumentaria y carteras originales');
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [recarga, setRecarga] = useState(0);

  // GET /productos: una sola lectura alimenta tendencias, promo y entrega inmediata.
  useEffect(() => {
    fetch(`${API_BASE_URL}/productos`)
      .then((res) => {
        if (!res.ok) throw new Error('Error HTTP ' + res.status);
        return res.json();
      })
      .then((datos) => setProductos(datos))
      .catch((err) => {
        console.error('Fallo al cargar los productos:', err);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, [recarga]);

  const reintentar = () => {
    setError(false);
    setCargando(true);
    setRecarga((n) => n + 1);
  };

  const tendencia = productos.filter((p) => p.esTendencia).slice(0, POR_SECCION);
  const enStock = productos.filter((p) => p.enStock && !p.esTendencia).slice(0, POR_SECCION);
  const promo = productos.find((p) => p.promoActiva && p.promoRestanteMs !== null);

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

      {cargando && productos.length === 0 && <Cargando texto="Cargando productos…" />}
      {error && <ErrorDeCarga onReintentar={reintentar} titulo="No pudimos cargar los productos" />}

      {tendencia.length > 0 && (
        <Seccion id="h-tendencia" titulo="En tendencia" enlace={{ to: '/catalogo', label: 'Ver todo' }}>
          <ProductGrid productos={tendencia} />
        </Seccion>
      )}

      {promo && (
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
