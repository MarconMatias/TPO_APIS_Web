import { Link, useNavigate } from 'react-router-dom';
import { ResumenPedido } from '../components/cart/ResumenPedido';
import { EmptyState } from '../components/ui/EmptyState';
import { Field } from '../components/ui/Field';
import { FormAlert } from '../components/ui/FormAlert';
import { PageHeader } from '../components/ui/PageHeader';
import { useCarrito } from '../hooks/useCarrito';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useForm } from '../hooks/useForm';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import type { MedioPago } from '../types';
import { formatPrecio } from '../util/precio';
import * as v from '../util/validacion';
import styles from './Checkout.module.scss';

const MEDIOS_PAGO: { valor: MedioPago; ayuda: string }[] = [
  { valor: 'Mercado Pago', ayuda: 'Dinero en cuenta o débito vinculado' },
  { valor: 'Tarjeta de débito', ayuda: 'Procesado por la API de pagos, sin cuotas' },
  { valor: 'Transferencia bancaria', ayuda: 'CBU enviado por email, acredita en 24 h' },
];

/** Paso 2 de la compra. Ruta protegida por RequireAuth: siempre hay usuario. */
export function Checkout() {
  useDocumentTitle('Envío y pago');
  const navigate = useNavigate();
  const { lineas, totales, usuario } = useCarrito();
  const confirmarPago = useOrderStore((s) => s.confirmarPago);
  const vaciarCarrito = useCartStore((s) => s.vaciar);
  const registrarCompra = useAuthStore((s) => s.registrarCompra);

  const form = useForm({
    inicial: { direccion: '', localidad: '', telefono: '', pago: 'Mercado Pago' as string },
    validar: (valores) =>
      v.limpiarErrores({
        direccion: v.largoMinimo(valores.direccion, 5, 'Ingresá la dirección de entrega (calle, número y piso).'),
        localidad: v.requerido(valores.localidad, 'Ingresá la localidad y la provincia.'),
        telefono: v.telefono(valores.telefono),
      }),
  });

  if (lineas.length === 0 || !usuario) {
    return (
      <EmptyState nivel="h1" titulo="No hay productos para pagar" texto="Tu carrito está vacío. Agregá productos para iniciar la compra.">
        <Link to="/catalogo" className="btn">Ver catálogo</Link>
      </EmptyState>
    );
  }

  const onSubmit = form.enviar(async ({ direccion, localidad, pago }) => {
    await confirmarPago({
      lineas: lineas.map((l) => ({ nombre: l.producto.nombre, talle: l.talle, cantidad: l.cantidad, subtotal: l.subtotal })),
      subtotal: totales.subtotal,
      descuento: totales.descuento,
      total: totales.total,
      medioPago: pago as MedioPago,
      direccion: `${direccion.trim()}, ${localidad.trim()}`,
      email: usuario.email,
      entregaEstimada: lineas.some((l) => !l.producto.enStock)
        ? '3 semanas (incluye modelos por encargo)'
        : '24 a 72 horas (stock disponible)',
    });
    vaciarCarrito();
    registrarCompra();
    navigate('/confirmacion');
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
            {MEDIOS_PAGO.map((medio) => (
              <label key={medio.valor} className={styles.payOpt}>
                <input
                  type="radio"
                  name="pago"
                  value={medio.valor}
                  checked={form.valores.pago === medio.valor}
                  onChange={() => form.cambiar('pago', medio.valor)}
                />
                <span>
                  <strong>{medio.valor}</strong>
                  <small>{medio.ayuda}</small>
                </span>
              </label>
            ))}
            <p className="note">No operamos con tarjetas de crédito ni cuotas. Esta es una simulación: no se realiza ningún cobro.</p>
          </fieldset>

          <FormAlert cantidadErrores={form.cantidadErrores} errorGeneral={form.errorGeneral} />

          <button type="submit" className="btn block" disabled={form.enviando} aria-busy={form.enviando}>
            {form.enviando ? 'Procesando pago…' : `Confirmar pago · ${formatPrecio(totales.total)}`}
          </button>
        </form>

        <ResumenPedido lineas={lineas} totales={totales} usuario={usuario} conItems />
      </section>
    </>
  );
}
