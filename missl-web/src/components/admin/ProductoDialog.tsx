import { adminApi } from '../../api/adminApi';
import { CATEGORIAS, LISTA_CATEGORIAS } from '../../constants/negocio';
import { useForm } from '../../hooks/useForm';
import { useToastStore } from '../../store/toastStore';
import type { ProductoAdmin } from '../../types/admin';
import type { Categoria } from '../../types/producto';
import * as v from '../../util/validacion';
import { Field } from '../ui/Field';
import { FormAlert } from '../ui/FormAlert';
import { Modal } from '../ui/Modal';

const MAX_DESCRIPCION = 2000;

interface ProductoDialogProps {
  /** null = alta de un producto nuevo. */
  producto: ProductoAdmin | null;
  /** Para avisar de duplicados antes de enviar. */
  existentes: ProductoAdmin[];
  onCerrar: () => void;
  onGuardado: () => void;
}

/**
 * Alta (POST /admin/productos) y modificación (PUT /admin/productos/{id}) con ProductoAltaRequest.
 * Las validaciones replican las del backend; si igual falla, se muestra el mensaje que devuelve la API.
 */
export function ProductoDialog({ producto, existentes, onCerrar, onGuardado }: ProductoDialogProps) {
  const mostrarAviso = useToastStore((s) => s.mostrar);
  const esNuevo = producto === null;

  const form = useForm({
    inicial: {
      nombre: producto?.nombre ?? '',
      marca: producto?.marca ?? '',
      categoria: producto?.categoria ?? ('ZAPATILLAS' as string),
      precio: producto ? String(producto.precio) : '',
      enStock: producto?.enStock ?? true,
      descripcion: producto?.descripcion ?? '',
    },
    validar: (valores) => {
      const duplicado = existentes.some(
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
            const request = {
              nombre: valores.nombre.trim(),
              marca: valores.marca.trim(),
              categoria: valores.categoria as Categoria,
              precio: Number(valores.precio),
              enStock: valores.enStock,
              descripcion: valores.descripcion.trim() || null,
            };
            const guardado = producto
              ? await adminApi.editarProducto(producto.id, request)
              : await adminApi.crearProducto(request);
            mostrarAviso(esNuevo ? `${guardado.nombre} se cargó al catálogo` : `${guardado.nombre} se actualizó`, {
              label: 'Ver ficha',
              to: `/producto/${guardado.id}`,
            });
            onGuardado();
            cerrar();
          })}
        >
          <h2 id="dlg-producto-titulo">{esNuevo ? 'Nuevo producto' : 'Modificar producto'}</h2>
          {producto && <p className="dlg-text">Código {producto.sku}</p>}

          <Field id={form.id('nombre')} label="Nombre" error={form.errores.nombre}>
            <input {...form.registrar('nombre')} required />
          </Field>
          <Field id={form.id('marca')} label="Marca" error={form.errores.marca}>
            <input {...form.registrar('marca')} required />
          </Field>
          <Field
            id={form.id('categoria')}
            label="Categoría"
            ayuda={producto ? 'Si cambiás la categoría se regeneran los talles del producto.' : undefined}
          >
            <select {...form.registrar('categoria')}>
              {LISTA_CATEGORIAS.map((c) => (
                <option key={c} value={c}>{CATEGORIAS[c].label}</option>
              ))}
            </select>
          </Field>
          <Field id={form.id('precio')} label="Precio de lista (ARS)" error={form.errores.precio}>
            <input {...form.registrar('precio')} type="number" min={1} step={100} inputMode="numeric" required />
          </Field>

          <p className="check">
            <input type="checkbox" {...form.registrarCheckbox('enStock')} />
            <label htmlFor={form.id('enStock')}>Stock disponible para entrega inmediata</label>
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
