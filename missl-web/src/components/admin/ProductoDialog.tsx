import { CATEGORIAS, LISTA_CATEGORIAS } from '../../data/catalogo';
import { useForm } from '../../hooks/useForm';
import { useProductStore } from '../../store/productStore';
import { useToastStore } from '../../store/toastStore';
import type { Categoria, Producto } from '../../types';
import * as v from '../../util/validacion';
import { Field } from '../ui/Field';
import { FormAlert } from '../ui/FormAlert';
import { Modal } from '../ui/Modal';
import styles from './ProductoDialog.module.scss';

const MAX_DESCRIPCION = 400;

interface ProductoDialogProps {
  /** null = alta de un producto nuevo. */
  producto: Producto | null;
  onCerrar: () => void;
}

function valoresIniciales(p: Producto | null) {
  return {
    nombre: p?.nombre ?? '',
    marca: p?.marca ?? '',
    categoria: p?.categoria ?? ('zapatillas' as string),
    precio: p ? String(p.precio) : '',
    descuento: p ? String(p.descuento) : '0',
    enStock: p?.enStock ?? true,
    tendencia: p?.tendencia ?? false,
    descripcion: p?.descripcion ?? '',
  };
}

/** Alta y modificación de productos con validación del lado del cliente. */
export function ProductoDialog({ producto, onCerrar }: ProductoDialogProps) {
  const productos = useProductStore((s) => s.productos);
  const guardar = useProductStore((s) => s.guardar);
  const mostrarAviso = useToastStore((s) => s.mostrar);
  const esNuevo = producto === null;

  const form = useForm({
    inicial: valoresIniciales(producto),
    validar: (valores) => {
      const duplicado = productos.some(
        (p) =>
          p.id !== producto?.id &&
          p.nombre.trim().toLowerCase() === valores.nombre.trim().toLowerCase() &&
          p.marca.trim().toLowerCase() === valores.marca.trim().toLowerCase(),
      );
      return v.limpiarErrores({
        nombre:
          v.largoMinimo(valores.nombre, 2, 'Ingresá el nombre del producto (mínimo 2 caracteres).') ??
          (duplicado ? 'Ya existe un producto con ese nombre y esa marca.' : null),
        marca: v.requerido(valores.marca, 'Ingresá la marca.'),
        precio: v.enteroEnRango(valores.precio, 1, 50_000_000, 'el precio'),
        descuento: v.enteroEnRango(valores.descuento, 0, 90, 'el descuento'),
        descripcion:
          valores.descripcion.length > MAX_DESCRIPCION
            ? `La descripción no puede superar los ${MAX_DESCRIPCION} caracteres.`
            : null,
      });
    },
  });

  return (
    <Modal tituloId="dlg-producto-titulo" onCerrar={onCerrar} bloqueado={form.enviando}>
      {(cerrar) => (
        <form
          noValidate
          aria-busy={form.enviando}
          onSubmit={form.enviar(async (valores) => {
            const guardado = await guardar(producto?.id ?? null, {
              nombre: valores.nombre.trim(),
              marca: valores.marca.trim(),
              categoria: valores.categoria as Categoria,
              precio: Number(valores.precio),
              descuento: Number(valores.descuento),
              enStock: valores.enStock,
              tendencia: valores.tendencia,
              descripcion: valores.descripcion.trim() || 'Descripción pendiente de carga.',
            });
            mostrarAviso(esNuevo ? `${guardado.nombre} se cargó al catálogo` : `${guardado.nombre} se actualizó`, {
              label: 'Ver ficha',
              to: `/producto/${guardado.id}`,
            });
            cerrar();
          })}
        >
          <h2 id="dlg-producto-titulo">{esNuevo ? 'Nuevo producto' : 'Modificar producto'}</h2>

          <Field id={form.id('nombre')} label="Nombre" error={form.errores.nombre}>
            <input {...form.registrar('nombre')} required />
          </Field>
          <Field id={form.id('marca')} label="Marca" error={form.errores.marca}>
            <input {...form.registrar('marca')} required />
          </Field>
          <Field id={form.id('categoria')} label="Categoría">
            <select {...form.registrar('categoria')}>
              {LISTA_CATEGORIAS.map((c) => (
                <option key={c} value={c}>{CATEGORIAS[c].label}</option>
              ))}
            </select>
          </Field>

          <fieldset className={styles.dosColumnas}>
            <legend className="sr-only">Precio y promoción</legend>
            <Field id={form.id('precio')} label="Precio de lista (ARS)" error={form.errores.precio}>
              <input {...form.registrar('precio')} type="number" min={1} step={100} inputMode="numeric" required />
            </Field>
            <Field id={form.id('descuento')} label="Descuento (%)" error={form.errores.descuento} ayuda="0 = sin promoción">
              <input {...form.registrar('descuento')} type="number" min={0} max={90} inputMode="numeric" />
            </Field>
          </fieldset>

          <p className="check">
            <input type="checkbox" {...form.registrarCheckbox('enStock')} />
            <label htmlFor={form.id('enStock')}>Stock disponible para entrega inmediata</label>
          </p>
          <p className="check">
            <input type="checkbox" {...form.registrarCheckbox('tendencia')} />
            <label htmlFor={form.id('tendencia')}>Destacar en "En tendencia"</label>
          </p>

          <Field
            id={form.id('descripcion')}
            label="Descripción"
            error={form.errores.descripcion}
            ayuda={`${form.valores.descripcion.length} / ${MAX_DESCRIPCION} caracteres`}
          >
            <textarea {...form.registrar('descripcion')} rows={3} />
          </Field>

          <FormAlert cantidadErrores={form.cantidadErrores} errorGeneral={form.errorGeneral} />

          <menu className="dlg-actions">
            <li>
              <button type="button" className="btn ghost" onClick={cerrar} disabled={form.enviando}>Cancelar</button>
            </li>
            <li>
              <button type="submit" className="btn" disabled={form.enviando} aria-busy={form.enviando}>
                {form.enviando ? 'Guardando…' : esNuevo ? 'Cargar producto' : 'Guardar cambios'}
              </button>
            </li>
          </menu>
        </form>
      )}
    </Modal>
  );
}
