import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productosApi } from '../api/productosApi';
import { CuentaRegresiva } from '../components/product/CuentaRegresiva';
import { Precios } from '../components/product/Precios';
import { ProductGrid } from '../components/product/ProductGrid';
import { TablaTalles } from '../components/product/TablaTalles';
import { Cargando, ErrorDeCarga } from '../components/ui/Carga';
import { EmptyState } from '../components/ui/EmptyState';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { Seccion } from '../components/ui/Seccion';
import { CATEGORIAS } from '../constants/negocio';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import type { ProductoDetalle } from '../types/producto';
import styles from './ProductDetail.module.scss';

const VISTAS = ['Frente', 'Detalle', 'Perfil', 'Caja'] as const;

/** /producto/:id → GET /productos/{id} (ficha + talles con stock + sugeridos). */
export function ProductDetail() {
  const { id: param } = useParams<{ id: string }>();
  const id = Number(param);
  const idValido = Number.isInteger(id) && id > 0;

  const { datos, error, recargar } = useApi(
    () => (idValido ? productosApi.detalle(id) : Promise.reject(new Error('id inválido'))),
    [id],
  );
  // Mientras llega el producto nuevo (al tocar un sugerido) no se muestra el anterior.
  const detalle = datos?.producto.id === id ? datos : null;

  useDocumentTitle(detalle ? `${detalle.producto.marca} ${detalle.producto.nombre}` : 'Producto');

  if (!idValido || error?.status === 404 || error?.status === 400) {
    return (
      <EmptyState nivel="h1" titulo="No encontramos este producto" texto="Puede que se haya dado de baja o que el enlace esté incompleto.">
        <Link to="/catalogo" className="btn">Ver catálogo</Link>
      </EmptyState>
    );
  }
  if (error) return <ErrorDeCarga error={error} onReintentar={recargar} titulo="No pudimos cargar el producto" />;
  if (!detalle) return <Cargando texto="Cargando producto…" />;

  // key: al pasar a otro producto se reinicia el talle y la foto elegidos.
  return <FichaProducto key={detalle.producto.id} detalle={detalle} />;
}

function FichaProducto({ detalle }: { detalle: ProductoDetalle }) {
  const { producto, descripcion, talles, sugeridos } = detalle;
  const navigate = useNavigate();
  const agregar = useCartStore((s) => s.agregar);
  const cliente = useAuthStore((s) => s.cliente);
  const mostrarAviso = useToastStore((s) => s.mostrar);

  /** Un talle con stock en 0 solo se bloquea si el producto es de entrega inmediata (por encargo se pide al proveedor). */
  const disponible = (stockUnidades: number) => !producto.enStock || stockUnidades > 0;
  const tallesDisponibles = talles.filter((t) => disponible(t.stockUnidades));

  const [talle, setTalle] = useState<string | null>(talles.length === 1 && tallesDisponibles.length === 1 ? talles[0].talle : null);
  const [faltaTalle, setFaltaTalle] = useState(false);
  const [vista, setVista] = useState<(typeof VISTAS)[number]>('Frente');
  const primerTalleRef = useRef<HTMLButtonElement>(null);

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
    if (cliente) {
      navigate('/checkout');
    } else {
      mostrarAviso('Creá tu cuenta o ingresá para finalizar la compra');
      navigate('/cuenta?volver=/checkout');
    }
  };

  const mensajeTalle = talle
    ? `Talle ${talle} seleccionado`
    : tallesDisponibles.length === 0
      ? 'Sin stock por el momento'
      : faltaTalle
        ? 'Elegí un talle para agregar al carrito'
        : 'Elegí un talle para continuar';

  return (
    <>
      <nav className="band" aria-label="Ruta de navegación">
        <ol className={styles.crumb}>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to={`/catalogo/${CATEGORIAS[producto.categoria].slug}`}>{CATEGORIAS[producto.categoria].label}</Link></li>
          <li aria-current="page">{producto.nombre}</li>
        </ol>
      </nav>

      <article className={`${styles.pdp} band`} aria-labelledby="pdp-nombre">
        <section className={styles.gallery} aria-label="Fotos del producto">
          <ImagePlaceholder
            texto={`Foto ${vista.toLowerCase()} · ${producto.nombre}`}
            className={styles.principal}
            imagenUrl={vista === 'Frente' ? producto.imagenUrl : null}
          />
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
              <p className="eyebrow">{producto.marca} · {producto.sku}</p>
              <h1 id="pdp-nombre">{producto.nombre}</h1>
            </hgroup>
            <Precios producto={producto} conBadge className={styles.precios} />
          </header>

          {producto.promoActiva && producto.promoRestanteMs !== null && (
            <p className={styles.promo}>
              <span>La promoción termina en</span> <CuentaRegresiva restanteMs={producto.promoRestanteMs} />
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
                {talles.map((t) => {
                  const hay = disponible(t.stockUnidades);
                  const esPrimero = t.talle === tallesDisponibles[0]?.talle;
                  return (
                    <button
                      key={t.talle}
                      ref={esPrimero ? primerTalleRef : undefined}
                      type="button"
                      className={styles.size}
                      aria-pressed={talle === t.talle}
                      disabled={!hay}
                      onClick={() => {
                        setTalle(t.talle);
                        setFaltaTalle(false);
                      }}
                    >
                      {t.talle}
                      {!hay && <span className="sr-only"> (sin stock)</span>}
                    </button>
                  );
                })}
              </p>
            </fieldset>
            <p className={styles.buyBtns}>
              <button type="submit" className="btn block" disabled={tallesDisponibles.length === 0}>Agregar al carrito</button>
              <button type="button" className="btn ghost block" onClick={comprarAhora} disabled={tallesDisponibles.length === 0}>
                Comprar ahora
              </button>
            </p>
            <p className="note">Pagás con Mercado Pago, débito o transferencia. No aceptamos tarjetas de crédito.</p>
          </form>

          <p className={styles.desc}>{descripcion || 'Este producto todavía no tiene descripción.'}</p>

          <details className={styles.guia} open>
            <summary>Guía de talles</summary>
            <TablaTalles categoria={producto.categoria} />
          </details>
        </section>
      </article>

      {sugeridos.length > 0 && (
        <Seccion id="h-relacionados" titulo="También te puede gustar">
          <ProductGrid productos={sugeridos} />
        </Seccion>
      )}
    </>
  );
}
