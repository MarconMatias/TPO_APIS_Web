import type { ReactNode } from 'react';

interface FieldProps {
  /** Debe coincidir con el id del control (ver useForm#registrar). */
  id: string;
  label: string;
  error?: string;
  ayuda?: string;
  children: ReactNode;
}

/**
 * Campo con etiqueta asociada y un mensaje (ayuda o error) enlazado por aria-describedby
 * mediante el id `${id}-msg`.
 */
export function Field({ id, label, error, ayuda, children }: FieldProps) {
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
