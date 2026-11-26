import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Field } from '../components/ui/Field';
import { FormAlert } from '../components/ui/FormAlert';
import { API_BASE_URL, ERROR_CONEXION, ERROR_INESPERADO } from '../config';
import { DESCUENTO_REGISTRO_PCT } from '../constants/negocio';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { formatPrecio } from '../util/precio';
import * as v from '../util/validacion';
import styles from './Auth.module.scss';

/** /cuenta: registro (POST /auth/registro) e ingreso (POST /auth/login); con sesión muestra la cuenta. */
export function Auth() {
  const cliente = useAuthStore((s) => s.cliente);
  return cliente ? <MiCuenta cliente={cliente} /> : <Acceso />;
}

function Acceso() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const iniciarSesion = useAuthStore((s) => s.iniciarSesion);
  const hayItems = useCartStore((s) => s.items.length > 0);
  const mostrarAviso = useToastStore((s) => s.mostrar);

  // 'registro' o 'ingreso'.
  const [modo, setModo] = useState(params.get('modo') === 'ingreso' ? 'ingreso' : 'registro');
  const [verPassword, setVerPassword] = useState(false);
  const esRegistro = modo === 'registro';
  useDocumentTitle(esRegistro ? 'Crear cuenta' : 'Ingresar');

  // Campos del formulario.
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');

  // Estado del envío.
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  // Mismas reglas que las anotaciones de ClienteRegistroRequest en missl-api (el backend vuelve a validar).
  const errores = v.limpiarErrores({
    nombre: esRegistro ? v.largoMinimo(nombre, 3, 'Ingresá tu nombre y apellido.') : null,
    email: v.email(email),
    password: esRegistro ? v.password(password) : v.requerido(password, 'Ingresá tu contraseña.'),
    confirmar: !esRegistro
      ? null
      : !confirmar
        ? 'Repetí la contraseña.'
        : confirmar !== password
          ? 'Las contraseñas no coinciden.'
          : null,
  });
  // Los errores se muestran recién después del primer intento de envío.
  const visibles = intentoEnvio ? errores : {};

  const cambiarModo = (nuevo) => {
    setModo(nuevo);
    setIntentoEnvio(false);
    setErrorGeneral(null);
  };

  // Solo rutas internas: evita redirigir a otro sitio con ?volver=//dominio-ajeno.
  const volver = params.get('volver');
  const destino = volver?.startsWith('/') && !volver.startsWith('//') ? volver : hayItems ? '/carrito' : '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setIntentoEnvio(true);
    if (Object.keys(errores).length > 0) {
      v.enfocarPrimerError('auth', errores);
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);
    try {
      // POST /auth/registro (201, 409 si el email ya tiene cuenta) o POST /auth/login (401 si no coincide).
      const res = await fetch(`${API_BASE_URL}/auth/${esRegistro ? 'registro' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          esRegistro ? { nombre: nombre.trim(), email: email.trim(), password } : { email: email.trim(), password },
        ),
      });
      const datos = await res.json().catch(() => null);
      if (!res.ok) throw new Error(datos?.mensajes?.join(' ') || ERROR_INESPERADO);

      // La respuesta trae el JWT y los datos de la cuenta.
      const { token, ...cliente } = datos;
      iniciarSesion(token, cliente);
      mostrarAviso(
        esRegistro
          ? `Cuenta creada · ${DESCUENTO_REGISTRO_PCT}% de descuento en tu primera compra`
          : `Hola de nuevo, ${cliente.nombre.split(' ')[0]}`,
      );
      navigate(destino);
    } catch (err) {
      setErrorGeneral(err instanceof TypeError ? ERROR_CONEXION : err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className={`${styles.auth} band`} aria-labelledby="auth-titulo">
      <hgroup>
        <p className="eyebrow">Cuenta MISSL</p>
        <h1 id="auth-titulo">{esRegistro ? 'Creá tu cuenta' : 'Ingresá a tu cuenta'}</h1>
      </hgroup>

      <menu className={styles.tabs} aria-label="Elegí cómo continuar">
        <li>
          <button type="button" className={styles.tab} aria-pressed={esRegistro} onClick={() => cambiarModo('registro')}>
            Registrarme
          </button>
        </li>
        <li>
          <button type="button" className={styles.tab} aria-pressed={!esRegistro} onClick={() => cambiarModo('ingreso')}>
            Ingresar
          </button>
        </li>
      </menu>

      <p className={styles.perk}>
        {esRegistro ? (
          <>
            Para comprar necesitás una cuenta. Al registrarte se aplica un{' '}
            <strong>{DESCUENTO_REGISTRO_PCT}% de descuento</strong> en tu primera compra.
          </>
        ) : (
          'Ingresá con el email y la contraseña de tu cuenta MISSL.'
        )}
      </p>

      <form onSubmit={handleSubmit} noValidate aria-busy={enviando}>
        {esRegistro && (
          <Field id="auth-nombre" label="Nombre y apellido" error={visibles.nombre}>
            <input
              id="auth-nombre"
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              aria-invalid={visibles.nombre ? true : undefined}
              aria-describedby="auth-nombre-msg"
              autoComplete="name"
              placeholder="Camila Duarte"
              required
            />
          </Field>
        )}
        <Field id="auth-email" label="Email" error={visibles.email}>
          <input
            id="auth-email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={visibles.email ? true : undefined}
            aria-describedby="auth-email-msg"
            type="email"
            autoComplete="email"
            placeholder="camila.duarte@gmail.com"
            required
          />
        </Field>
        <Field
          id="auth-password"
          label="Contraseña"
          error={visibles.password}
          ayuda={esRegistro ? 'Mínimo 8 caracteres, con letras y números.' : undefined}
        >
          <span className={styles.password}>
            <input
              id="auth-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={visibles.password ? true : undefined}
              aria-describedby="auth-password-msg"
              type={verPassword ? 'text' : 'password'}
              autoComplete={esRegistro ? 'new-password' : 'current-password'}
              required
            />
            <button type="button" className={styles.ver} aria-pressed={verPassword} onClick={() => setVerPassword((x) => !x)}>
              {verPassword ? 'Ocultar' : 'Mostrar'}
              <span className="sr-only"> contraseña</span>
            </button>
          </span>
        </Field>
        {esRegistro && (
          <Field id="auth-confirmar" label="Repetí la contraseña" error={visibles.confirmar}>
            <input
              id="auth-confirmar"
              name="confirmar"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              aria-invalid={visibles.confirmar ? true : undefined}
              aria-describedby="auth-confirmar-msg"
              type={verPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
            />
          </Field>
        )}

        <FormAlert cantidadErrores={Object.keys(visibles).length} errorGeneral={errorGeneral} />

        <button className="btn block" type="submit" disabled={enviando} aria-busy={enviando}>
          {enviando
            ? esRegistro ? 'Creando cuenta…' : 'Ingresando…'
            : esRegistro ? `Registrarme y obtener ${DESCUENTO_REGISTRO_PCT}%` : 'Ingresar'}
        </button>
      </form>
    </section>
  );
}

function MiCuenta({ cliente }) {
  useDocumentTitle('Mi cuenta');
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const actualizarCliente = useAuthStore((s) => s.actualizarCliente);
  const salir = useAuthStore((s) => s.salir);
  const mostrarAviso = useToastStore((s) => s.mostrar);

  // GET /auth/me: trae el estado actualizado de la cuenta (ej.: si ya usó el descuento).
  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 401) {
          salir();
          mostrarAviso('Tu sesión expiró. Volvé a ingresar para continuar.');
          return null;
        }
        if (!res.ok) throw new Error('Error HTTP ' + res.status);
        return res.json();
      })
      .then((perfil) => perfil && actualizarCliente(perfil))
      .catch((err) => console.error('Fallo al actualizar la cuenta:', err));
  }, [token, actualizarCliente, salir, mostrarAviso]);

  const cerrarSesion = () => {
    salir();
    mostrarAviso('Cerraste sesión');
    navigate('/');
  };

  return (
    <section className={`${styles.auth} band`} aria-labelledby="cuenta-titulo">
      <hgroup>
        <p className="eyebrow">Cuenta MISSL</p>
        <h1 id="cuenta-titulo">Hola, {cliente.nombre.split(' ')[0]}</h1>
      </hgroup>
      <dl className={styles.datos}>
        <dt>Nombre</dt>
        <dd>{cliente.nombre}</dd>
        <dt>Email</dt>
        <dd>{cliente.email}</dd>
        <dt>Descuento de bienvenida</dt>
        <dd>
          {cliente.descuentoDisponible
            ? `${DESCUENTO_REGISTRO_PCT}% disponible para tu primera compra`
            : 'Ya usado en tu primera compra'}
        </dd>
      </dl>
      <p className={styles.acciones}>
        <Link to="/catalogo" className="btn">Seguir comprando</Link>
        <button type="button" className="btn ghost" onClick={cerrarSesion}>Cerrar sesión</button>
      </p>

      <MisCompras token={token} />
    </section>
  );
}

/** Historial del cliente: GET /ventas/mias. */
function MisCompras({ token }) {
  const [ventas, setVentas] = useState(null);
  const [error, setError] = useState(false);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ventas/mias`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Error HTTP ' + res.status);
        return res.json();
      })
      .then((datos) => setVentas(datos))
      .catch((err) => {
        console.error('Fallo al cargar las compras:', err);
        setError(true);
      });
  }, [token, recarga]);

  return (
    <section className={styles.compras} aria-labelledby="mis-compras-titulo">
      <h2 id="mis-compras-titulo">Mis compras</h2>
      {error ? (
        <p className="form-error" role="alert">
          No pudimos cargar tus compras.{' '}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setError(false);
              setRecarga((n) => n + 1);
            }}
          >
            Reintentar
          </button>
        </p>
      ) : !ventas ? (
        <p role="status" className="note">Cargando tus compras…</p>
      ) : ventas.length === 0 ? (
        <p className="note">Todavía no hiciste ninguna compra.</p>
      ) : (
        <figure className="table-scroll">
          <table className="num">
            <caption className="sr-only">Historial de compras</caption>
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Fecha</th>
                <th scope="col">Total</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.codigo}>
                  <th scope="row">{venta.codigo}</th>
                  <td>
                    <time dateTime={venta.fecha}>{new Date(venta.fecha).toLocaleDateString('es-AR')}</time>
                  </td>
                  <td>{formatPrecio(venta.total)}</td>
                  <td>{venta.estado === 'PENDIENTE' ? 'Pendiente' : 'Entregado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}
    </section>
  );
}
