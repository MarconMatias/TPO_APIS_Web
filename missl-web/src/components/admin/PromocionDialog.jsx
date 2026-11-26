import { useState } from 'react';
import { API_BASE_URL, ERROR_CONEXION, ERROR_INESPERADO } from '../../config';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useToastStore } from '../../store/toastStore';
import * as v from '../../util/validacion';
import { Field } from '../ui/Field';
import { FormAlert } from '../ui/FormAlert';
import { Modal } from '../ui/Modal';
import styles from './PromocionDialog.module.scss';

/** Límites de PromocionRequest en missl-api (@Max(30) descuentoPct, @Min(1) horas). */
const MAX_DESCUENTO = 30;
const MAX_HORAS = 720;

/** Tendencia y descuento por tiempo limitado: PATCH /admin/productos/{id}/promocion. */
export function PromocionDialog({ promocion, onCerrar, onGuardado }) {
  const token = useAdminAuthStore((s) => s.token);
  const salir = useAdminAuthStore((s) => s.salir);
  const mostrarAviso = useToastStore((s) => s.mostrar);
  const promoVigente = promocion.restanteMs !== null;

  // Campos del formulario.
  const [descuentoPct, setDescuentoPct] = useState(String(promoVigente ? promocion.descuentoPct : 0));
  const [horas, setHoras] = useState(String(promocion.descuentoHoras || 24));
  const [esTendencia, setEsTendencia] = useState(promocion.esTendencia);

  // Estado del envío.
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const errores = v.limpiarErrores({
    descuentoPct: v.enteroEnRango(descuentoPct, 0, MAX_DESCUENTO, 'el descuento'),
    horas: v.enteroEnRango(horas, 1, MAX_HORAS, 'la duración'),
  });
  // Los errores se muestran recién después del primer intento de envío.
  const visibles = intentoEnvio ? errores : {};

  const handleSubmit = async (e, cerrar) => {
    e.preventDefault();
    if (enviando) return;
    setIntentoEnvio(true);
    if (Object.keys(errores).length > 0) {
      v.enfocarPrimerError('promo', errores);
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);
    const pct = Number(descuentoPct);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/productos/${promocion.id}/promocion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ descuentoPct: pct, horas: Number(horas), esTendencia }),
      });
      const datos = await res.json().catch(() => null);

      if (res.status === 401) {
        salir();
        mostrarAviso('Tu sesión expiró. Volvé a ingresar para continuar.');
        return;
      }
      if (!res.ok) throw new Error(datos?.mensajes?.join(' ') || ERROR_INESPERADO);

      mostrarAviso(
        pct > 0 ? `${promocion.nombre}: ${pct}% por ${horas} h` : `${promocion.nombre}: promoción actualizada`,
      );
      onGuardado();
      cerrar();
    } catch (err) {
      setErrorGeneral(err instanceof TypeError ? ERROR_CONEXION : err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal tituloId="dlg-promo-titulo" onCerrar={onCerrar} bloqueado={enviando}>
      {(cerrar) => (
        <form noValidate aria-busy={enviando} onSubmit={(e) => handleSubmit(e, cerrar)}>
          <h2 id="dlg-promo-titulo">Promoción</h2>
          <p className="dlg-text">
            {promocion.marca} {promocion.nombre}.{' '}
            {promoVigente ? `Tiene ${promocion.descuentoPct}% activo.` : 'No tiene un descuento activo.'}
          </p>

          <fieldset className={styles.dosColumnas}>
            <legend className="sr-only">Descuento por tiempo limitado</legend>
            <Field id="promo-descuentoPct" label="Descuento (%)" error={visibles.descuentoPct} ayuda={`0 a ${MAX_DESCUENTO}. 0 = sin promoción`}>
              <input
                id="promo-descuentoPct"
                name="descuentoPct"
                value={descuentoPct}
                onChange={(e) => setDescuentoPct(e.target.value)}
                aria-invalid={visibles.descuentoPct ? true : undefined}
                aria-describedby="promo-descuentoPct-msg"
                type="number"
                min={0}
                max={MAX_DESCUENTO}
                inputMode="numeric"
              />
            </Field>
            <Field id="promo-horas" label="Duración (horas)" error={visibles.horas} ayuda="Desde ahora">
              <input
                id="promo-horas"
                name="horas"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                aria-invalid={visibles.horas ? true : undefined}
                aria-describedby="promo-horas-msg"
                type="number"
                min={1}
                max={MAX_HORAS}
                inputMode="numeric"
              />
            </Field>
          </fieldset>

          <p className="check">
            <input
              id="promo-esTendencia"
              name="esTendencia"
              type="checkbox"
              checked={esTendencia}
              onChange={(e) => setEsTendencia(e.target.checked)}
            />
            <label htmlFor="promo-esTendencia">Destacar en "En tendencia"</label>
          </p>

          <FormAlert cantidadErrores={Object.keys(visibles).length} errorGeneral={errorGeneral} />

          <menu className="dlg-actions">
            <li>
              <button type="button" className="btn ghost" onClick={cerrar} disabled={enviando}>Cancelar</button>
            </li>
            <li>
              <button type="submit" className="btn" disabled={enviando} aria-busy={enviando}>
                {enviando ? 'Guardando…' : 'Guardar promoción'}
              </button>
            </li>
          </menu>
        </form>
      )}
    </Modal>
  );
}
