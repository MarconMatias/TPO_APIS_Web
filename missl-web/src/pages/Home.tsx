import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CuentaRegresiva } from '../components/product/CuentaRegresiva';
import { ProductGrid } from '../components/product/ProductGrid';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { Seccion } from '../components/ui/Seccion';
import { CATEGORIAS, FIN_PROMOCION, LISTA_CATEGORIAS } from '../data/catalogo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useProductStore } from '../store/productStore';
import styles from './Home.module.scss';

const POR_SECCION = 4;

export function Home() {
  useDocumentTitle('Zapatillas, indumentaria y carteras originales');
  const productos = useProductStore((s) => s.productos);

  const tendencia = useMemo(() => productos.filter((p) => p.tendencia).slice(0, POR_SECCION), [productos]);
  const enStock = useMemo(
    () => productos.filter((p) => p.enStock && !p.tendencia).slice(0, POR_SECCION),
    [productos],
  );
  const promo = useMemo(() => productos.find((p) => p.descuento > 0), [productos]);

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
              {promo.marca} {promo.nombre} con {promo.descuento}% off
            </h2>
          </hgroup>
          <p className={styles.timer}>
            <span className="eyebrow">Termina en</span>
            <CuentaRegresiva fin={FIN_PROMOCION} />
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
              <Link to={`/catalogo/${cat}`}>
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
