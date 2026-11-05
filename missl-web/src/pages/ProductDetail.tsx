import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CuentaRegresiva } from '../components/product/CuentaRegresiva';
import { Precios } from '../components/product/Precios';
import { ProductGrid } from '../components/product/ProductGrid';
import { TablaTalles } from '../components/product/TablaTalles';
import { EmptyState } from '../components/ui/EmptyState';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { Seccion } from '../components/ui/Seccion';
import { CATEGORIAS, FIN_PROMOCION } from '../data/catalogo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';
import { useToastStore } from '../store/toastStore';
import type { Producto } from '../types';
import styles from './ProductDetail.module.scss';

const VISTAS = ['Frente', 'Detalle', 'Perfil', 'Caja'] as const;

/** /producto/:id. La ficha se remonta por id (key) para que el talle y la foto elegidos no pasen de un producto a otro. */
export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const producto = useProductStore((s) => s.productos.find((p) => p.id === id));

  useDocumentTitle(producto ? `${producto.marca} ${producto.nombre}` : 'Producto no encontrado');

  if (!producto) {
    return (
      <EmptyState nivel="h1" titulo="No encontramos este producto" texto="Puede que se haya dado de baja o que el enlace esté incompleto.">
        <Link to="/catalogo" className="btn">Ver catálogo</Link>
      </EmptyState>
    );
  }
  return <FichaProducto key={producto.id} producto={producto} />;
}

function FichaProducto({ producto }: { producto: Producto }) {
  const navigate = useNavigate();
  const productos = useProductStore((s) => s.productos);
  const agregar = useCartStore((s) => s.agregar);
  const usuario = useAuthStore((s) => s.usuario);
  const mostrarAviso = useToastStore((s) => s.mostrar);

  const talles = CATEGORIAS[producto.categoria].talles;
  const [talle, setTalle] = useState<string | null>(talles.length === 1 ? talles[0] : null);
  const [faltaTalle, setFaltaTalle] = useState(false);
  const [vista, setVista] = useState<(typeof VISTAS)[number]>('Frente');
  const primerTalleRef = useRef<HTMLButtonElement>(null);

  const relacionados = useMemo(
    () => productos.filter((p) => p.categoria === producto.categoria && p.id !== producto.id).slice(0, 4),
    [productos, producto],
  );

  /** Devuelve false (y lleva el foco a los talles) si todavía no se eligió uno. */
  const agregarAlCarrito = (): boolean => {
    if (!talle) {
      setFaltaTalle(true);
      primerTalleRef.current?.focus();
      return false;
    }
    agregar(producto.id, talle);
    return true;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (agregarAlCarrito()) {
      mostrarAviso(`${producto.nombre} · talle ${talle} agregado al carrito`, { label: 'Ver carrito', to: '/carrito' });
    }
  };

  const comprarAhora = () => {
    if (!agregarAlCarrito()) return;
    if (usuario) {
      navigate('/checkout');
    } else {
      mostrarAviso('Creá tu cuenta o ingresá para finalizar la compra');
      navigate('/cuenta?volver=/checkout');
    }
  };

  const mensajeTalle = talle
    ? `Talle ${talle} seleccionado`
    : faltaTalle
      ? 'Elegí un talle para agregar al carrito'
      : 'Elegí un talle para continuar';

  return (
    <>
      <nav className="band" aria-label="Ruta de navegación">
        <ol className={styles.crumb}>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to={`/catalogo/${producto.categoria}`}>{CATEGORIAS[producto.categoria].label}</Link></li>
          <li aria-current="page">{producto.nombre}</li>
        </ol>
      </nav>

      <article className={`${styles.pdp} band`} aria-labelledby="pdp-nombre">
        <section className={styles.gallery} aria-label="Fotos del producto">
          <ImagePlaceholder texto={`Foto ${vista.toLowerCase()} · ${producto.nombre}`} className={styles.principal} />
          <ul className={styles.thumbs}>
            {VISTAS.map((v) => (
              <li key={v}>
                <button type="button" className={styles.thumb} aria-pressed={vista === v} onClick={() => setVista(v)}>
                  <span aria-hidden="true">{v}</span>
                  <span className="sr-only">Ver foto: {v.toLowerCase()}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.info} aria-label="Detalle del producto">
          <header>
            <hgroup>
              <p className="eyebrow">{producto.marca}</p>
              <h1 id="pdp-nombre">{producto.nombre}</h1>
            </hgroup>
            <Precios producto={producto} conBadge className={styles.precios} />
          </header>

          {producto.descuento > 0 && (
            <p className={styles.promo}>
              <span>La promoción termina en</span> <CuentaRegresiva fin={FIN_PROMOCION} />
            </p>
          )}

          <p className={styles.delivery}>
            <span className={producto.enStock ? `${styles.dot} ${styles.ok}` : styles.dot} aria-hidden="true" />
            {producto.enStock ? (
              <span><strong>Entrega inmediata.</strong> Despacho en 24 a 72 h desde Buenos Aires.</span>
            ) : (
              <span><strong>Por encargo.</strong> Lo traemos para vos en 3 semanas.</span>
            )}
          </p>

          <form className={styles.buy} onSubmit={onSubmit} noValidate>
            <fieldset>
              <legend className={styles.labelRow}>
                <span>Talle</span>
                <output className={faltaTalle && !talle ? styles.error : undefined}>{mensajeTalle}</output>
              </legend>
              <p className={styles.sizes}>
                {talles.map((t, i) => (
                  <button
                    key={t}
                    ref={i === 0 ? primerTalleRef : undefined}
                    type="button"
                    className={styles.size}
                    aria-pressed={talle === t}
                    onClick={() => {
                      setTalle(t);
                      setFaltaTalle(false);
                    }}
                  >
                    {t}
                  </button>
                ))}
              </p>
            </fieldset>
            <p className={styles.buyBtns}>
              <button type="submit" className="btn block">Agregar al carrito</button>
              <button type="button" className="btn ghost block" onClick={comprarAhora}>Comprar ahora</button>
            </p>
            <p className="note">Pagás con Mercado Pago, débito o transferencia. No aceptamos tarjetas de crédito.</p>
          </form>

          <p className={styles.desc}>{producto.descripcion}</p>

          <details className={styles.guia} open>
            <summary>Guía de talles</summary>
            <TablaTalles categoria={producto.categoria} />
          </details>
        </section>
      </article>

      {relacionados.length > 0 && (
        <Seccion id="h-relacionados" titulo="También te puede gustar">
          <ProductGrid productos={relacionados} />
        </Seccion>
      )}
    </>
  );
}
