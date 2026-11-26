/** Resumen de errores del formulario, anunciado por lectores de pantalla (role="alert"). */
export function FormAlert({ cantidadErrores, errorGeneral }) {
  const mensaje =
    errorGeneral ??
    (cantidadErrores > 0
      ? cantidadErrores === 1
        ? 'Revisá el campo marcado para continuar.'
        : `Revisá los ${cantidadErrores} campos marcados para continuar.`
      : null);

  if (!mensaje) return null;
  return (
    <p className="form-error" role="alert">
      {mensaje}
    </p>
  );
}
