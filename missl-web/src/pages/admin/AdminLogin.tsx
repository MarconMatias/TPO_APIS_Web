import { Navigate, useNavigate } from 'react-router-dom';
import { Field } from '../../components/ui/Field';
import { FormAlert } from '../../components/ui/FormAlert';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useForm } from '../../hooks/useForm';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import * as v from '../../util/validacion';
import styles from '../Auth.module.scss';

/** /admin — paso 1 de 2: email y contraseña (POST /admin/login) → desafío para el 2FA. */
export function AdminLogin() {
  useDocumentTitle('Administración · Ingresar');
  const navigate = useNavigate();
  const token = useAdminAuthStore((s) => s.token);
  const login = useAdminAuthStore((s) => s.login);

  const form = useForm({
    inicial: { email: '', password: '' },
    validar: (valores) =>
      v.limpiarErrores({
        email: v.email(valores.email),
        password: v.requerido(valores.password, 'Ingresá tu contraseña.'),
      }),
  });

  if (token) return <Navigate to="/admin/panel" replace />;

  const onSubmit = form.enviar(async ({ email, password }) => {
    await login(email.trim(), password);
    navigate('/admin/2fa');
  });

  return (
    <section className={`${styles.auth} band`} aria-labelledby="admin-login-titulo">
      <hgroup>
        <p className="eyebrow">MISSL · Administración · Paso 1 de 2</p>
        <h1 id="admin-login-titulo">Ingreso de administrador</h1>
      </hgroup>
      <p className={styles.perk}>Después de la contraseña te vamos a pedir el código de 6 dígitos de tu app autenticadora.</p>

      <form onSubmit={onSubmit} noValidate aria-busy={form.enviando}>
        <Field id={form.id('email')} label="Email" error={form.errores.email}>
          <input {...form.registrar('email')} type="email" autoComplete="username" required />
        </Field>
        <Field id={form.id('password')} label="Contraseña" error={form.errores.password}>
          <input {...form.registrar('password')} type="password" autoComplete="current-password" required />
        </Field>

        <FormAlert cantidadErrores={form.cantidadErrores} errorGeneral={form.errorGeneral} />

        <button type="submit" className="btn block" disabled={form.enviando} aria-busy={form.enviando}>
          {form.enviando ? 'Verificando…' : 'Continuar'}
        </button>
      </form>
    </section>
  );
}
