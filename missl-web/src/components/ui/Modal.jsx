import { useEffect, useState } from 'react';

/**
 * Diálogo modal sobre <dialog> nativo: showModal() aporta el foco atrapado, Esc para cerrar
 * y la devolución del foco al control que lo abrió. Se monta abierto; el padre lo desmonta en onCerrar.
 * - `onCerrar`: se llama cuando el diálogo terminó de cerrarse (Esc, Cancelar, clic afuera o cierre programático).
 * - `bloqueado`: mientras es true, Esc y el clic afuera no cierran el diálogo (ej.: guardando).
 * - `children`: función que recibe `cerrar` y devuelve el contenido.
 */
export function Modal({ tituloId, onCerrar, bloqueado = false, children }) {
  // Callback ref guardado en estado: el elemento se usa en efectos y handlers sin leer refs durante el render.
  const [dialogo, setDialogo] = useState(null);

  useEffect(() => {
    if (dialogo && !dialogo.open) dialogo.showModal();
  }, [dialogo]);

  const cerrar = () => dialogo?.close();

  return (
    <dialog
      ref={setDialogo}
      className="dlg"
      aria-labelledby={tituloId}
      onClose={onCerrar}
      onCancel={(e) => bloqueado && e.preventDefault()}
      onClick={(e) => {
        // Clic en el fondo (el propio <dialog>, fuera del formulario) cierra.
        if (e.target === e.currentTarget && !bloqueado) cerrar();
      }}
    >
      {children(cerrar)}
    </dialog>
  );
}
