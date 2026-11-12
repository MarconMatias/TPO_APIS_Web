import { Link, useNavigate } from 'react-router-dom';
import { ResumenPedido } from '../components/cart/ResumenPedido';
import { Cargando, ErrorDeCarga } from '../components/ui/Carga';
import { EmptyState } from '../components/ui/EmptyState';
import { Field } from '../components/ui/Field';
import { FormAlert } from '../components/ui/FormAlert';
import { PageHeader } from '../components/ui/PageHeader';
import { MEDIOS_PAGO } from '../constants/negocio';
import { useCarrito } from '../hooks/useCarrito';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useForm } from '../hooks/useForm';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import type { MedioPago } from '../types/venta';
import { formatPrecio } from '../util/precio';
import * as v from '../util/validacion';
import styles from './Checkout.module.scss';

const LISTA_MEDIOS = Object.keys(MEDIOS_PAGO) as MedioPago[];

/** Paso 2 de la compra → POST /ventas con el JWT del cliente. Ruta protegida por RequireAuth. */
export function Checkout() {
  useDocumentTitle('Envío y pago');
  const navigate = useNavigate();
  const { lineas, totales, cliente, hayItems, cargando, error, recargar } = useCarrito();
  const confirmarCompra = useOrderStore((s) => s.confirmarCompra);
  const vaciarCarrito = useCartStore((s) => s.vaciar);
  const refrescarPerfil = useAuthStore((s) => s.refrescarPerfil);

  const form = useForm({
    inicial: { direccion: '', localidad: '', telefono: '', pago: 'MERCADOPAGO' as string },
    validar: (valores) =>
      v.limpiarErrores({
        direccion: v.largoMinimo(valores.direccion, 5, 'Ingresá la dirección de entrega (calle, número y piso).'),
        localidad: v.requerido(valores.localidad, 'Ingresá la localidad y la provincia.'),
        telefono: v.telefono(valores.telefono),
      }),
  });

  if (!hayItems || !cliente) {
    return (
      <EmptyState nivel="h1" titulo="No hay productos para pagar" texto="Tu carrito está vacío. Agregá productos para iniciar la compra.">
        <Link to="/catalogo" className="btn">Ver catálogo</Link>
      </EmptyState>
    );
  }

  const onSubmit = form.enviar(async ({ direccion, localidad, telefono, pago }) => {
    await confirmarCompra(
      {
        items: lineas.map((l) => ({ productoId: l.productoId, talle: l.talle, cantidad: l.cantidad })),
        medioPago: pago as MedioPago,
        domicilio: `${direccion.trim()}, ${localidad.trim()}`,
        telefono: telefono.trim(),
      },
      lineas.map((l) => ({ nombre: l.producto.nombre, talle: l.talle, cantidad: l.cantidad })),
    );
    vaciarCarrito();
    navigate('/confirmacion');
    // El backend marcó el descuento de bienvenida como usado: se actualiza la cuenta en segundo plano.
    refrescarPerfil().catch(() => {});
  });

  return (
    <>
      <PageHeader id="h-checkout" eyebrow="MISSL · Tu compra" titulo="Envío y pago">
        <ol className={styles.steps} aria-label="Pasos de la compra">
          <li><Link to="/carrito">Carrito</Link></li>
          <li aria-current="step">Envío y pago</li>
          <li>Confirmación</li>
        </ol>
      </PageHeader>

      {error ? (
        <ErrorDeCarga error={error} onReintentar={recargar} titulo="No pudimos cargar tu pedido" />
      ) : cargando ? (
        <Cargando texto="Preparando tu pedido…" />
      ) : (
        <section className={`${styles.layout} band`} aria-label="Datos de la compra">
          <form className={styles.form} onSubmit={onSubmit} noValidate aria-busy={form.enviando}>
            <fieldset disabled={form.enviando}>
              <legend>Datos de envío</legend>
              <Field id={form.id('direccion')} label="Dirección" error={form.errores.direccion}>
                <input {...form.registrar('direccion')} autoComplete="street-address" placeholder="Av. Corrientes 1234, 5° B" required />
              </Field>
              <Field id={form.id('localidad')} label="Localidad y provincia" error={form.errores.localidad}>
                <input {...form.registrar('localidad')} autoComplete="address-level2" placeholder="CABA, Buenos Aires" required />
              </Field>
              <Field id={form.id('telefono')} label="Teléfono" error={form.errores.telefono} ayuda="Te escribimos por WhatsApp para coordinar la entrega.">
                <input {...form.registrar('telefono')} type="tel" autoComplete="tel" inputMode="tel" placeholder="11 5555-1234" required />
              </Field>
            </fieldset>

            <fieldset disabled={form.enviando}>
              <legend>Medio de pago</legend>
              {LISTA_MEDIOS.map((medio) => (
                <label key={medio} className={styles.payOpt}>
                  <input
                    type="radio"
                    name="pago"
                    value={medio}
                    checked={form.valores.pago === medio}
                    onChange={() => form.cambiar('pago', medio)}
                  />
                  <span>
                    <strong>{MEDIOS_PAGO[medio].label}</strong>
                    <small>{MEDIOS_PAGO[medio].ayuda}</small>
                  </span>
                </label>
              ))}
              <p className="note">No operamos con tarjetas de crédito ni cuotas.</p>
            </fieldset>

            <FormAlert cantidadErrores={form.cantidadErrores} errorGeneral={form.errorGeneral} />

            <button type="submit" className="btn block" disabled={form.enviando} aria-busy={form.enviando}>
              {form.enviando ? 'Procesando pago…' : `Confirmar pago · ${formatPrecio(totales.total)}`}
            </button>
            <p className="note">
              El importe final lo confirma el sistema al procesar el pago. Al confirmar aceptás los{' '}
              <Link to="/terminos" target="_blank">
                términos y condiciones<span className="sr-only"> (abre en otra pestaña)</span>
              </Link>
              .
            </p>
          </form>

          <ResumenPedido lineas={lineas} totales={totales} cliente={cliente} conItems />
        </section>
      )}
    </>
  );
}
