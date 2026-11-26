import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ResumenPedido } from '../components/cart/ResumenPedido';
import { Cargando, ErrorDeCarga } from '../components/ui/Carga';
import { EmptyState } from '../components/ui/EmptyState';
import { Field } from '../components/ui/Field';
import { FormAlert } from '../components/ui/FormAlert';
import { PageHeader } from '../components/ui/PageHeader';
import { API_BASE_URL, ERROR_CONEXION, ERROR_INESPERADO } from '../config';
import { MEDIOS_PAGO } from '../constants/negocio';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { useToastStore } from '../store/toastStore';
import { armarLineas, calcularTotales, formatPrecio } from '../util/precio';
import * as v from '../util/validacion';
import styles from './Checkout.module.scss';

const LISTA_MEDIOS = Object.keys(MEDIOS_PAGO);

/** Paso 2 de la compra → POST /ventas con el JWT del cliente. Ruta protegida por RequireAuth. */
export function Checkout() {
  useDocumentTitle('Envío y pago');
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const conservarSolo = useCartStore((s) => s.conservarSolo);
  const vaciarCarrito = useCartStore((s) => s.vaciar);
  const token = useAuthStore((s) => s.token);
  const cliente = useAuthStore((s) => s.cliente);
  const actualizarCliente = useAuthStore((s) => s.actualizarCliente);
  const salir = useAuthStore((s) => s.salir);
  const guardarPedido = useOrderStore((s) => s.guardarPedido);
  const mostrarAviso = useToastStore((s) => s.mostrar);

  // Catálogo vigente para mostrar precios y promociones actualizados.
  const [productos, setProductos] = useState(null);
  const [errorCarga, setErrorCarga] = useState(false);
  const [recarga, setRecarga] = useState(0);

  // Campos del formulario.
  const [direccion, setDireccion] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pago, setPago] = useState('MERCADOPAGO');

  // Estado del envío.
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/productos`)
      .then((res) => {
        if (!res.ok) throw new Error('Error HTTP ' + res.status);
        return res.json();
      })
      .then((datos) => {
        setProductos(datos);
        conservarSolo(datos.map((p) => p.id));
      })
      .catch((err) => {
        console.error('Fallo al cargar el pedido:', err);
        setErrorCarga(true);
      });
  }, [conservarSolo, recarga]);

  const lineas = armarLineas(items, productos ?? []);
  const totales = calcularTotales(lineas, cliente);

  const errores = v.limpiarErrores({
    direccion: v.largoMinimo(direccion, 5, 'Ingresá la dirección de entrega (calle, número y piso).'),
    localidad: v.requerido(localidad, 'Ingresá la localidad y la provincia.'),
    telefono: v.telefono(telefono),
  });
  // Los errores se muestran recién después del primer intento de envío.
  const visibles = intentoEnvio ? errores : {};

  if (items.length === 0 || !cliente) {
    return (
      <EmptyState nivel="h1" titulo="No hay productos para pagar" texto="Tu carrito está vacío. Agregá productos para iniciar la compra.">
        <Link to="/catalogo" className="btn">Ver catálogo</Link>
      </EmptyState>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setIntentoEnvio(true);
    if (Object.keys(errores).length > 0) {
      v.enfocarPrimerError('checkout', errores);
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);
    const domicilio = `${direccion.trim()}, ${localidad.trim()}`;
    try {
      // POST /ventas: el backend calcula precios, descuento y total. El cliente sale del JWT.
      const res = await fetch(`${API_BASE_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: lineas.map((l) => ({ productoId: l.productoId, talle: l.talle, cantidad: l.cantidad })),
          medioPago: pago,
          domicilio,
          telefono: telefono.trim(),
        }),
      });
      const datos = await res.json().catch(() => null);

      if (res.status === 401) {
        salir();
        mostrarAviso('Tu sesión expiró. Volvé a ingresar para continuar.');
        return;
      }
      if (!res.ok) throw new Error(datos?.mensajes?.join(' ') || ERROR_INESPERADO);

      // La confirmación no devuelve los ítems: se guardan tal como se vieron en el checkout.
      guardarPedido({
        confirmacion: datos,
        lineas: lineas.map((l) => ({ nombre: l.producto.nombre, talle: l.talle, cantidad: l.cantidad })),
        domicilio,
      });
      vaciarCarrito();
      navigate('/confirmacion');

      // El backend marcó el descuento de bienvenida como usado: se actualiza la cuenta en segundo plano.
      fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((perfil) => perfil && actualizarCliente(perfil))
        .catch(() => {});
    } catch (err) {
      setErrorGeneral(err instanceof TypeError ? ERROR_CONEXION : err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <PageHeader id="h-checkout" eyebrow="MISSL · Tu compra" titulo="Envío y pago">
        <ol className={styles.steps} aria-label="Pasos de la compra">
          <li><Link to="/carrito">Carrito</Link></li>
          <li aria-current="step">Envío y pago</li>
          <li>Confirmación</li>
        </ol>
      </PageHeader>

      {errorCarga ? (
        <ErrorDeCarga
          onReintentar={() => {
            setErrorCarga(false);
            setRecarga((n) => n + 1);
          }}
          titulo="No pudimos cargar tu pedido" />
      ) : !productos ? (
        <Cargando texto="Preparando tu pedido…" />
      ) : (
        <section className={`${styles.layout} band`} aria-label="Datos de la compra">
          <form className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={enviando}>
            <fieldset disabled={enviando}>
              <legend>Datos de envío</legend>
              <Field id="checkout-direccion" label="Dirección" error={visibles.direccion}>
                <input
                  id="checkout-direccion"
                  name="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  aria-invalid={visibles.direccion ? true : undefined}
                  aria-describedby="checkout-direccion-msg"
                  autoComplete="street-address"
                  placeholder="Av. Corrientes 1234, 5° B"
                  required
                />
              </Field>
              <Field id="checkout-localidad" label="Localidad y provincia" error={visibles.localidad}>
                <input
                  id="checkout-localidad"
                  name="localidad"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  aria-invalid={visibles.localidad ? true : undefined}
                  aria-describedby="checkout-localidad-msg"
                  autoComplete="address-level2"
                  placeholder="CABA, Buenos Aires"
                  required
                />
              </Field>
              <Field
                id="checkout-telefono"
                label="Teléfono"
                error={visibles.telefono}
                ayuda="Te escribimos por WhatsApp para coordinar la entrega."
              >
                <input
                  id="checkout-telefono"
                  name="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  aria-invalid={visibles.telefono ? true : undefined}
                  aria-describedby="checkout-telefono-msg"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="11 5555-1234"
                  required
                />
              </Field>
            </fieldset>

            <fieldset disabled={enviando}>
              <legend>Medio de pago</legend>
              {LISTA_MEDIOS.map((medio) => (
                <label key={medio} className={styles.payOpt}>
                  <input type="radio" name="pago" value={medio} checked={pago === medio} onChange={() => setPago(medio)} />
                  <span>
                    <strong>{MEDIOS_PAGO[medio].label}</strong>
                    <small>{MEDIOS_PAGO[medio].ayuda}</small>
                  </span>
                </label>
              ))}
              <p className="note">No operamos con tarjetas de crédito ni cuotas.</p>
            </fieldset>

            <FormAlert cantidadErrores={Object.keys(visibles).length} errorGeneral={errorGeneral} />

            <button type="submit" className="btn block" disabled={enviando} aria-busy={enviando}>
              {enviando ? 'Procesando pago…' : `Confirmar pago · ${formatPrecio(totales.total)}`}
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
