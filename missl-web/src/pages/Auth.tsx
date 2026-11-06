import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Field } from '../components/ui/Field';
import { FormAlert } from '../components/ui/FormAlert';
import { DESCUENTO_REGISTRO_PCT } from '../constants/negocio';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useForm } from '../hooks/useForm';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import type { Cliente } from '../types/cliente';
import * as v from '../util/validacion';
import styles from './Auth.module.scss';

type Modo = 'registro' | 'ingreso';

/** /cuenta: registro (POST /auth/registro) e ingreso (POST /auth/login); con sesión muestra la cuenta. */
export function Auth() {
  const cliente = useAuthStore((s) => s.cliente);
  return cliente ? <MiCuenta cliente={cliente} /> : <Acceso />;
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

  // Mismas reglas que las anotaciones de ClienteRegistroRequest en missl-api (el backend vuelve a validar).
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
      await registrar({ nombre: nombre.trim(), email: email.trim(), password });
      mostrarAviso(`Cuenta creada · ${DESCUENTO_REGISTRO_PCT}% de descuento en tu primera compra`);
    } else {
      const cliente = await ingresar({ email: email.trim(), password });
      mostrarAviso(`Hola de nuevo, ${cliente.nombre.split(' ')[0]}`);
    }
    navigate(destino);
  });

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

      <form onSubmit={onSubmit} noValidate aria-busy={form.enviando}>
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

function MiCuenta({ cliente }: { cliente: Cliente }) {
  useDocumentTitle('Mi cuenta');
  const navigate = useNavigate();
  const salir = useAuthStore((s) => s.salir);
  const refrescarPerfil = useAuthStore((s) => s.refrescarPerfil);
  const mostrarAviso = useToastStore((s) => s.mostrar);

  // GET /auth/me: trae el estado actualizado de la cuenta (ej.: si ya usó el descuento).
  useEffect(() => {
    refrescarPerfil().catch(() => {
      /* Si el token venció, el cliente HTTP ya cerró la sesión y avisó. */
    });
  }, [refrescarPerfil]);

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
          {cliente.descuentoRegistroUsado
            ? 'Ya usado en tu primera compra'
            : `${DESCUENTO_REGISTRO_PCT}% disponible para tu primera compra`}
        </dd>
      </dl>
      <p className={styles.acciones}>
        <Link to="/catalogo" className="btn">Seguir comprando</Link>
        <button type="button" className="btn ghost" onClick={cerrarSesion}>Cerrar sesión</button>
      </p>
    </section>
  );
}
