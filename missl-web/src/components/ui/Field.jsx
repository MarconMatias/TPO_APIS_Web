/**
 * Campo con etiqueta asociada y un mensaje (ayuda o error) enlazado por aria-describedby
 * mediante el id `${id}-msg`. `id` debe coincidir con el id del control que va en children.
 */
export function Field({ id, label, error, ayuda, children }) {
  return (
    <p className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      <small id={`${id}-msg`} className={error ? 'field-msg error' : 'field-msg'}>
        {error ?? ayuda}
      </small>
    </p>
  );
}
