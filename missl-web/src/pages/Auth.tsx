import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Field } from '../components/ui/Field';
import { FormAlert } from '../components/ui/FormAlert';
import { DESCUENTO_REGISTRO_PCT, USUARIO_DEMO } from '../data/catalogo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useForm } from '../hooks/useForm';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import type { Usuario } from '../types';
import * as v from '../util/validacion';
import styles from './Auth.module.scss';

type Modo = 'registro' | 'ingreso';

/** /cuenta: registro e ingreso; con sesión iniciada muestra los datos de la cuenta. */
export function Auth() {
  const usuario = useAuthStore((s) => s.usuario);
  return usuario ? <MiCuenta usuario={usuario} /> : <Acceso />;
}

function Acceso() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const registrar = useAuthStore((s) => s.registrar);
  const ingresar = useAuthStore((s) => s.ingresar);
  const hayItems = useCartStore((s) => s.items.length > 0);
  const mostrarAviso = useToastStore((s) => s.mostrar);

  const [modo, setModo] = useState<Modo>(params.get('modo') === 'ingreso' ? 'ingreso' : 'registro');
  const [verPassword, setVerPassword] = useState(false);
  const esRegistro = modo === 'registro';
  useDocumentTitle(esRegistro ? 'Crear cuenta' : 'Ingresar');

  const form = useForm({
    inicial: { nombre: '', email: '', password: '', confirmar: '' },
    validar: (valores) =>
      v.limpiarErrores({
        nombre: esRegistro ? v.largoMinimo(valores.nombre, 3, 'Ingresá tu nombre y apellido.') : null,
        email: v.email(valores.email),
        password: esRegistro ? v.password(valores.password) : v.requerido(valores.password, 'Ingresá tu contraseña.'),
        confirmar: !esRegistro
          ? null
          : !valores.confirmar
            ? 'Repetí la contraseña.'
            : valores.confirmar !== valores.password
              ? 'Las contraseñas no coinciden.'
              : null,
      }),
  });

  const cambiarModo = (nuevo: Modo) => {
    setModo(nuevo);
    form.reiniciarValidacion();
  };

  // Solo rutas internas: evita redirigir a otro sitio con ?volver=//dominio-ajeno.
  const volver = params.get('volver');
  const destino = volver?.startsWith('/') && !volver.startsWith('//') ? volver : hayItems ? '/carrito' : '/';

  const onSubmit = form.enviar(async ({ nombre, email, password }) => {
    if (esRegistro) {
      await registrar({ nombre, email, password });
      mostrarAviso(`Cuenta creada · ${DESCUENTO_REGISTRO_PCT}% aplicado a tu primera compra`);
    } else {
      const usuario = await ingresar({ email, password });
      mostrarAviso(`Hola de nuevo, ${usuario.nombre.split(' ')[0]}`);
    }
    navigate(destino);
  });

  const usarCuentaDemo = () => {
    form.cambiar('email', USUARIO_DEMO.email);
    form.cambiar('password', USUARIO_DEMO.password);
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

      {esRegistro ? (
        <p className={styles.perk}>
          Al registrarte se aplica un <strong>{DESCUENTO_REGISTRO_PCT}% de descuento</strong> en tu primera compra.
        </p>
      ) : (
        <p className={styles.perk}>
          Cuenta de prueba: <strong>{USUARIO_DEMO.email}</strong> / <strong>{USUARIO_DEMO.password}</strong>{' '}
          <button type="button" className="link-btn" onClick={usarCuentaDemo}>Completar</button>
        </p>
      )}

      <form onSubmit={onSubmit} noValidate>
        {esRegistro && (
          <Field id={form.id('nombre')} label="Nombre y apellido" error={form.errores.nombre}>
            <input {...form.registrar('nombre')} autoComplete="name" placeholder="Camila Duarte" required />
          </Field>
        )}
        <Field id={form.id('email')} label="Email" error={form.errores.email}>
          <input {...form.registrar('email')} type="email" autoComplete="email" placeholder="camila.duarte@gmail.com" required />
        </Field>
        <Field
          id={form.id('password')}
          label="Contraseña"
          error={form.errores.password}
          ayuda={esRegistro ? 'Mínimo 8 caracteres, con letras y números.' : undefined}
        >
          <span className={styles.password}>
            <input
              {...form.registrar('password')}
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
          <Field id={form.id('confirmar')} label="Repetí la contraseña" error={form.errores.confirmar}>
            <input {...form.registrar('confirmar')} type={verPassword ? 'text' : 'password'} autoComplete="new-password" required />
          </Field>
        )}

        <FormAlert cantidadErrores={form.cantidadErrores} errorGeneral={form.errorGeneral} />

        <button className="btn block" type="submit" disabled={form.enviando} aria-busy={form.enviando}>
          {form.enviando
            ? esRegistro ? 'Creando cuenta…' : 'Ingresando…'
            : esRegistro ? `Registrarme y obtener ${DESCUENTO_REGISTRO_PCT}%` : 'Ingresar'}
        </button>
      </form>
    </section>
  );
}

function MiCuenta({ usuario }: { usuario: Usuario }) {
  useDocumentTitle('Mi cuenta');
  const navigate = useNavigate();
  const salir = useAuthStore((s) => s.salir);
  const mostrarAviso = useToastStore((s) => s.mostrar);

  const cerrarSesion = () => {
    salir();
    mostrarAviso('Cerraste sesión');
    navigate('/');
  };

  return (
    <section className={`${styles.auth} band`} aria-labelledby="cuenta-titulo">
      <hgroup>
        <p className="eyebrow">Cuenta MISSL</p>
        <h1 id="cuenta-titulo">Hola, {usuario.nombre.split(' ')[0]}</h1>
      </hgroup>
      <dl className={styles.datos}>
        <dt>Nombre</dt>
        <dd>{usuario.nombre}</dd>
        <dt>Email</dt>
        <dd>{usuario.email}</dd>
        <dt>Descuento de registro</dt>
        <dd>{usuario.primeraCompraUsada ? 'Ya usado en tu primera compra' : `${DESCUENTO_REGISTRO_PCT}% disponible para tu primera compra`}</dd>
      </dl>
      <p className={styles.acciones}>
        <Link to="/catalogo" className="btn">Seguir comprando</Link>
        <button type="button" className="btn ghost" onClick={cerrarSesion}>Cerrar sesión</button>
      </p>
    </section>
  );
}
