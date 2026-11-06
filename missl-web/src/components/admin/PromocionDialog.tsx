import { adminApi } from '../../api/adminApi';
import { useForm } from '../../hooks/useForm';
import { useToastStore } from '../../store/toastStore';
import type { PromocionAdmin } from '../../types/admin';
import * as v from '../../util/validacion';
import { Field } from '../ui/Field';
import { FormAlert } from '../ui/FormAlert';
import { Modal } from '../ui/Modal';
import styles from './PromocionDialog.module.scss';

/** Límites de PromocionRequest en missl-api (@Max(30) descuentoPct, @Min(1) horas). */
const MAX_DESCUENTO = 30;
const MAX_HORAS = 720;

interface PromocionDialogProps {
  promocion: PromocionAdmin;
  onCerrar: () => void;
  onGuardado: () => void;
}

/** Tendencia y descuento por tiempo limitado: PATCH /admin/productos/{id}/promocion. */
export function PromocionDialog({ promocion, onCerrar, onGuardado }: PromocionDialogProps) {
  const mostrarAviso = useToastStore((s) => s.mostrar);
  const promoVigente = promocion.restanteMs !== null;

  const form = useForm({
    inicial: {
      descuentoPct: String(promoVigente ? promocion.descuentoPct : 0),
      horas: String(promocion.descuentoHoras || 24),
      esTendencia: promocion.esTendencia,
    },
    validar: (valores) =>
      v.limpiarErrores({
        descuentoPct: v.enteroEnRango(valores.descuentoPct, 0, MAX_DESCUENTO, 'el descuento'),
        horas: v.enteroEnRango(valores.horas, 1, MAX_HORAS, 'la duración'),
      }),
  });

  return (
    <Modal tituloId="dlg-promo-titulo" onCerrar={onCerrar} bloqueado={form.enviando}>
      {(cerrar) => (
        <form
          noValidate
          aria-busy={form.enviando}
          onSubmit={form.enviar(async (valores) => {
            const descuentoPct = Number(valores.descuentoPct);
            await adminApi.actualizarPromocion(promocion.id, {
              descuentoPct,
              horas: Number(valores.horas),
              esTendencia: valores.esTendencia,
            });
            mostrarAviso(
              descuentoPct > 0
                ? `${promocion.nombre}: ${descuentoPct}% por ${valores.horas} h`
                : `${promocion.nombre}: promoción actualizada`,
            );
            onGuardado();
            cerrar();
          })}
        >
          <h2 id="dlg-promo-titulo">Promoción</h2>
          <p className="dlg-text">
            {promocion.marca} {promocion.nombre}.{' '}
            {promoVigente ? `Tiene ${promocion.descuentoPct}% activo.` : 'No tiene un descuento activo.'}
          </p>

          <fieldset className={styles.dosColumnas}>
            <legend className="sr-only">Descuento por tiempo limitado</legend>
            <Field id={form.id('descuentoPct')} label="Descuento (%)" error={form.errores.descuentoPct} ayuda={`0 a ${MAX_DESCUENTO}. 0 = sin promoción`}>
              <input {...form.registrar('descuentoPct')} type="number" min={0} max={MAX_DESCUENTO} inputMode="numeric" />
            </Field>
            <Field id={form.id('horas')} label="Duración (horas)" error={form.errores.horas} ayuda="Desde ahora">
              <input {...form.registrar('horas')} type="number" min={1} max={MAX_HORAS} inputMode="numeric" />
            </Field>
          </fieldset>

          <p className="check">
            <input type="checkbox" {...form.registrarCheckbox('esTendencia')} />
            <label htmlFor={form.id('esTendencia')}>Destacar en "En tendencia"</label>
          </p>

          <FormAlert cantidadErrores={form.cantidadErrores} errorGeneral={form.errorGeneral} />

          <menu className="dlg-actions">
            <li>
              <button type="button" className="btn ghost" onClick={cerrar} disabled={form.enviando}>Cancelar</button>
            </li>
            <li>
              <button type="submit" className="btn" disabled={form.enviando} aria-busy={form.enviando}>
                {form.enviando ? 'Guardando…' : 'Guardar promoción'}
              </button>
            </li>
          </menu>
        </form>
      )}
    </Modal>
  );
}
