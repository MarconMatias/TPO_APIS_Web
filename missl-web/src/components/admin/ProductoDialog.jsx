import { useState } from 'react';
import { API_BASE_URL, ERROR_CONEXION, ERROR_INESPERADO } from '../../config';
import { CATEGORIAS, LISTA_CATEGORIAS } from '../../constants/negocio';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useToastStore } from '../../store/toastStore';
import * as v from '../../util/validacion';
import { Field } from '../ui/Field';
import { FormAlert } from '../ui/FormAlert';
import { Modal } from '../ui/Modal';

const MAX_DESCRIPCION = 2000;

/**
 * Alta (POST /admin/productos) y modificación (PUT /admin/productos/{id}) con ProductoAltaRequest.
 * - `producto`: null = alta de un producto nuevo.
 * - `existentes`: para avisar de duplicados antes de enviar.
 * Las validaciones replican las del backend; si igual falla, se muestra el mensaje que devuelve la API.
 */
export function ProductoDialog({ producto, existentes, onCerrar, onGuardado }) {
  const token = useAdminAuthStore((s) => s.token);
  const salir = useAdminAuthStore((s) => s.salir);
  const mostrarAviso = useToastStore((s) => s.mostrar);
  const esNuevo = producto === null;

  // Campos del formulario (en la modificación arrancan con los datos actuales).
  const [nombre, setNombre] = useState(producto?.nombre ?? '');
  const [marca, setMarca] = useState(producto?.marca ?? '');
  const [categoria, setCategoria] = useState(producto?.categoria ?? 'ZAPATILLAS');
  const [precio, setPrecio] = useState(producto ? String(producto.precio) : '');
  const [enStock, setEnStock] = useState(producto?.enStock ?? true);
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '');

  // Estado del envío.
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const duplicado = existentes.some(
    (p) =>
      p.id !== producto?.id &&
      p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase() &&
      p.marca.trim().toLowerCase() === marca.trim().toLowerCase(),
  );
  const errores = v.limpiarErrores({
    nombre:
      v.largoMinimo(nombre, 2, 'Ingresá el nombre del producto (mínimo 2 caracteres).') ??
      (duplicado ? 'Ya existe un producto con ese nombre y esa marca.' : null),
    marca: v.requerido(marca, 'Ingresá la marca.'),
    precio: v.enteroEnRango(precio, 1, 50_000_000, 'el precio'),
    descripcion:
      descripcion.length > MAX_DESCRIPCION ? `La descripción no puede superar los ${MAX_DESCRIPCION} caracteres.` : null,
  });
  // Los errores se muestran recién después del primer intento de envío.
  const visibles = intentoEnvio ? errores : {};

  const handleSubmit = async (e, cerrar) => {
    e.preventDefault();
    if (enviando) return;
    setIntentoEnvio(true);
    if (Object.keys(errores).length > 0) {
      v.enfocarPrimerError('producto', errores);
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/productos${producto ? `/${producto.id}` : ''}`, {
        method: producto ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: nombre.trim(),
          marca: marca.trim(),
          categoria,
          precio: Number(precio),
          enStock,
          // "" borra la descripción en el backend; null significaría "no modificar".
          descripcion: descripcion.trim(),
        }),
      });
      const datos = await res.json().catch(() => null);

      if (res.status === 401) {
        salir();
        mostrarAviso('Tu sesión expiró. Volvé a ingresar para continuar.');
        return;
      }
      if (!res.ok) throw new Error(datos?.mensajes?.join(' ') || ERROR_INESPERADO);

      mostrarAviso(esNuevo ? `${datos.nombre} se cargó al catálogo` : `${datos.nombre} se actualizó`, {
        label: 'Ver ficha',
        to: `/producto/${datos.id}`,
      });
      onGuardado();
      cerrar();
    } catch (err) {
      setErrorGeneral(err instanceof TypeError ? ERROR_CONEXION : err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal tituloId="dlg-producto-titulo" onCerrar={onCerrar} bloqueado={enviando}>
      {(cerrar) => (
        <form noValidate aria-busy={enviando} onSubmit={(e) => handleSubmit(e, cerrar)}>
          <h2 id="dlg-producto-titulo">{esNuevo ? 'Nuevo producto' : 'Modificar producto'}</h2>
          {producto && <p className="dlg-text">Código {producto.sku}</p>}

          <Field id="producto-nombre" label="Nombre" error={visibles.nombre}>
            <input
              id="producto-nombre"
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              aria-invalid={visibles.nombre ? true : undefined}
              aria-describedby="producto-nombre-msg"
              required
            />
          </Field>
          <Field id="producto-marca" label="Marca" error={visibles.marca}>
            <input
              id="producto-marca"
              name="marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              aria-invalid={visibles.marca ? true : undefined}
              aria-describedby="producto-marca-msg"
              required
            />
          </Field>
          <Field
            id="producto-categoria"
            label="Categoría"
            ayuda={producto ? 'Si cambiás la categoría se regeneran los talles del producto.' : undefined}
          >
            <select
              id="producto-categoria"
              name="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              aria-describedby="producto-categoria-msg"
            >
              {LISTA_CATEGORIAS.map((c) => (
                <option key={c} value={c}>{CATEGORIAS[c].label}</option>
              ))}
            </select>
          </Field>
          <Field id="producto-precio" label="Precio de lista (ARS)" error={visibles.precio}>
            <input
              id="producto-precio"
              name="precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              aria-invalid={visibles.precio ? true : undefined}
              aria-describedby="producto-precio-msg"
              type="number"
              min={1}
              step={100}
              inputMode="numeric"
              required
            />
          </Field>

          <p className="check">
            <input
              id="producto-enStock"
              name="enStock"
              type="checkbox"
              checked={enStock}
              onChange={(e) => setEnStock(e.target.checked)}
            />
            <label htmlFor="producto-enStock">Stock disponible para entrega inmediata</label>
          </p>

          <Field
            id="producto-descripcion"
            label="Descripción"
            error={visibles.descripcion}
            ayuda={`${descripcion.length} / ${MAX_DESCRIPCION} caracteres`}
          >
            <textarea
              id="producto-descripcion"
              name="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              aria-invalid={visibles.descripcion ? true : undefined}
              aria-describedby="producto-descripcion-msg"
              rows={3}
            />
          </Field>

          <FormAlert cantidadErrores={Object.keys(visibles).length} errorGeneral={errorGeneral} />

          <menu className="dlg-actions">
            <li>
              <button type="button" className="btn ghost" onClick={cerrar} disabled={enviando}>Cancelar</button>
            </li>
            <li>
              <button type="submit" className="btn" disabled={enviando} aria-busy={enviando}>
                {enviando ? 'Guardando…' : esNuevo ? 'Cargar producto' : 'Guardar cambios'}
              </button>
            </li>
          </menu>
        </form>
      )}
    </Modal>
  );
}
