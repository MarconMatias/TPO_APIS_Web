import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Field } from '../../components/ui/Field';
import { FormAlert } from '../../components/ui/FormAlert';
import { API_BASE_URL, ERROR_CONEXION, ERROR_INESPERADO } from '../../config';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useToastStore } from '../../store/toastStore';
import styles from '../Auth.module.scss';

/** /admin/2fa — paso 2 de 2: código TOTP de 6 dígitos (POST /admin/2fa) → JWT de administrador. */
export function Admin2fa() {
  useDocumentTitle('Administración · Verificación');
  const navigate = useNavigate();
  const desafioVigente = useAdminAuthStore((s) => s.challengeId);
  const iniciarSesion = useAdminAuthStore((s) => s.iniciarSesion);
  const descartarDesafio = useAdminAuthStore((s) => s.descartarDesafio);
  const mostrarAviso = useToastStore((s) => s.mostrar);
  // Se lee una sola vez: si se entra sin pasar por el paso 1, se vuelve al login.
  const [desafioInicial] = useState(() => useAdminAuthStore.getState().challengeId);

  const [codigo, setCodigo] = useState('');
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const errores = /^\d{6}$/.test(codigo.trim()) ? {} : { codigo: 'El código tiene exactamente 6 dígitos.' };
  const visibles = intentoEnvio ? errores : {};

  if (!desafioInicial) return <Navigate to="/admin" replace />;

  // El backend admite hasta 5 códigos incorrectos; si se agotan o vence el desafío, hay que repetir el paso 1.
  const desafioConsumido = !desafioVigente;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setIntentoEnvio(true);
    if (errores.codigo) {
      document.getElementById('admin2fa-codigo')?.focus();
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: desafioVigente, codigo: codigo.trim() }),
      });
      const datos = await res.json().catch(() => null);
      if (!res.ok) {
        const mensaje = datos?.mensajes?.join(' ') || ERROR_INESPERADO;
        // Si el desafío venció o se agotaron los intentos, el mensaje pide volver a iniciar sesión.
        if (/iniciar sesion/i.test(mensaje)) descartarDesafio();
        throw new Error(mensaje);
      }

      iniciarSesion(datos.token, datos.email);
      mostrarAviso('Sesión de administrador iniciada');
      navigate('/admin/panel', { replace: true });
    } catch (err) {
      setErrorGeneral(err instanceof TypeError ? ERROR_CONEXION : err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className={`${styles.auth} band`} aria-labelledby="admin-2fa-titulo">
      <hgroup>
        <p className="eyebrow">MISSL · Administración · Paso 2 de 2</p>
        <h1 id="admin-2fa-titulo">Verificación en dos pasos</h1>
      </hgroup>
      <p className={styles.perk}>
        Abrí tu app autenticadora (Google Authenticator, Authy…) e ingresá el código de MISSL. Tenés 5 intentos y 5
        minutos.
      </p>

      <form onSubmit={handleSubmit} noValidate aria-busy={enviando}>
        <Field id="admin2fa-codigo" label="Código de 6 dígitos" error={visibles.codigo}>
          <input
            id="admin2fa-codigo"
            name="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            aria-invalid={visibles.codigo ? true : undefined}
            aria-describedby="admin2fa-codigo-msg"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            className={styles.codigo}
            disabled={desafioConsumido}
            required
          />
        </Field>

        <FormAlert cantidadErrores={Object.keys(visibles).length} errorGeneral={errorGeneral} />

        {desafioConsumido ? (
          <Link to="/admin" className="btn block">Volver a ingresar</Link>
        ) : (
          <button type="submit" className="btn block" disabled={enviando} aria-busy={enviando}>
            {enviando ? 'Verificando…' : 'Verificar e ingresar'}
          </button>
        )}
      </form>
    </section>
  );
}
