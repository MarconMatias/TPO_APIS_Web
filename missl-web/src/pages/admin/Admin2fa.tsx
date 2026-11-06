import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Field } from '../../components/ui/Field';
import { FormAlert } from '../../components/ui/FormAlert';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useForm } from '../../hooks/useForm';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useToastStore } from '../../store/toastStore';
import styles from '../Auth.module.scss';

/** /admin/2fa — paso 2 de 2: código TOTP de 6 dígitos (POST /admin/2fa) → JWT de administrador. */
export function Admin2fa() {
  useDocumentTitle('Administración · Verificación');
  const navigate = useNavigate();
  const verificar2fa = useAdminAuthStore((s) => s.verificar2fa);
  const desafioVigente = useAdminAuthStore((s) => s.challengeId);
  const mostrarAviso = useToastStore((s) => s.mostrar);
  // Se lee una sola vez: si se entra sin pasar por el paso 1, se vuelve al login.
  const [desafioInicial] = useState(() => useAdminAuthStore.getState().challengeId);

  const form = useForm({
    inicial: { codigo: '' },
    validar: (valores) =>
      /^\d{6}$/.test(valores.codigo.trim()) ? {} : { codigo: 'El código tiene exactamente 6 dígitos.' },
  });

  if (!desafioInicial) return <Navigate to="/admin" replace />;

  // El backend admite hasta 5 códigos incorrectos; si se agotan o vence el desafío, hay que repetir el paso 1.
  const desafioConsumido = !desafioVigente;

  const onSubmit = form.enviar(async ({ codigo }) => {
    await verificar2fa(codigo.trim());
    mostrarAviso('Sesión de administrador iniciada');
    navigate('/admin/panel', { replace: true });
  });

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

      <form onSubmit={onSubmit} noValidate aria-busy={form.enviando}>
        <Field id={form.id('codigo')} label="Código de 6 dígitos" error={form.errores.codigo}>
          <input
            {...form.registrar('codigo')}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            className={styles.codigo}
            disabled={desafioConsumido}
            required
          />
        </Field>

        <FormAlert cantidadErrores={form.cantidadErrores} errorGeneral={form.errorGeneral} />

        {desafioConsumido ? (
          <Link to="/admin" className="btn block">Volver a ingresar</Link>
        ) : (
          <button type="submit" className="btn block" disabled={form.enviando} aria-busy={form.enviando}>
            {form.enviando ? 'Verificando…' : 'Verificar e ingresar'}
          </button>
        )}
      </form>
    </section>
  );
}
