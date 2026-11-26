import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Field } from '../../components/ui/Field';
import { FormAlert } from '../../components/ui/FormAlert';
import { API_BASE_URL, ERROR_CONEXION, ERROR_INESPERADO } from '../../config';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import * as v from '../../util/validacion';
import styles from '../Auth.module.scss';

/** /admin — paso 1 de 2: email y contraseña (POST /admin/login) → desafío para el 2FA. */
export function AdminLogin() {
  useDocumentTitle('Administración · Ingresar');
  const navigate = useNavigate();
  const token = useAdminAuthStore((s) => s.token);
  const guardarDesafio = useAdminAuthStore((s) => s.guardarDesafio);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const errores = v.limpiarErrores({
    email: v.email(email),
    password: v.requerido(password, 'Ingresá tu contraseña.'),
  });
  // Los errores se muestran recién después del primer intento de envío.
  const visibles = intentoEnvio ? errores : {};

  if (token) return <Navigate to="/admin/panel" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setIntentoEnvio(true);
    if (Object.keys(errores).length > 0) {
      v.enfocarPrimerError('admin', errores);
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const datos = await res.json().catch(() => null);
      if (!res.ok) throw new Error(datos?.mensajes?.join(' ') || ERROR_INESPERADO);

      guardarDesafio(datos.challengeId);
      navigate('/admin/2fa');
    } catch (err) {
      setErrorGeneral(err instanceof TypeError ? ERROR_CONEXION : err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className={`${styles.auth} band`} aria-labelledby="admin-login-titulo">
      <hgroup>
        <p className="eyebrow">MISSL · Administración · Paso 1 de 2</p>
        <h1 id="admin-login-titulo">Ingreso de administrador</h1>
      </hgroup>
      <p className={styles.perk}>Después de la contraseña te vamos a pedir el código de 6 dígitos de tu app autenticadora.</p>

      <form onSubmit={handleSubmit} noValidate aria-busy={enviando}>
        <Field id="admin-email" label="Email" error={visibles.email}>
          <input
            id="admin-email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={visibles.email ? true : undefined}
            aria-describedby="admin-email-msg"
            type="email"
            autoComplete="username"
            required
          />
        </Field>
        <Field id="admin-password" label="Contraseña" error={visibles.password}>
          <input
            id="admin-password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={visibles.password ? true : undefined}
            aria-describedby="admin-password-msg"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        <FormAlert cantidadErrores={Object.keys(visibles).length} errorGeneral={errorGeneral} />

        <button type="submit" className="btn block" disabled={enviando} aria-busy={enviando}>
          {enviando ? 'Verificando…' : 'Continuar'}
        </button>
      </form>
    </section>
  );
}
