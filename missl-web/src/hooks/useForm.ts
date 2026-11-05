import { useId, useState, type ChangeEvent, type FormEvent } from 'react';

type Valores = Record<string, string | boolean>;
type Campo<T> = keyof T & string;
export type Errores<T> = Partial<Record<Campo<T>, string>>;

interface Opciones<T> {
  inicial: T;
  /** Devuelve solo los campos inválidos, en el orden en que aparecen en el formulario. */
  validar: (valores: T) => Errores<T>;
}

/**
 * Estado + validación de formularios del lado del cliente.
 * - Los errores se muestran al salir de un campo con contenido o al intentar enviar.
 * - Al enviar con errores, el foco va al primer campo inválido (navegación por teclado / lectores).
 * - `enviando` y `errorGeneral` permiten comunicar los estados de espera y de error de la acción.
 */
export function useForm<T extends Valores>({ inicial, validar }: Opciones<T>) {
  const prefijo = useId();
  const [valores, setValores] = useState<T>(inicial);
  const [tocados, setTocados] = useState<Partial<Record<Campo<T>, boolean>>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const todos = validar(valores);
  const errores: Errores<T> = {};
  for (const campo of Object.keys(todos) as Campo<T>[]) {
    if (intentoEnvio || tocados[campo]) errores[campo] = todos[campo];
  }

  const id = (campo: Campo<T>) => `${prefijo}-${campo}`;

  const cambiar = <K extends Campo<T>>(campo: K, valor: T[K]) => {
    setValores((prev) => ({ ...prev, [campo]: valor }));
    setErrorGeneral(null);
  };

  /** Props para <input>, <select> o <textarea> de texto. */
  const registrar = (campo: Campo<T>) => ({
    id: id(campo),
    name: campo,
    value: String(valores[campo]),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      cambiar(campo, e.target.value as T[typeof campo]),
    onBlur: (e: { target: { value: string } }) => {
      if (e.target.value) setTocados((t) => ({ ...t, [campo]: true }));
    },
    'aria-invalid': errores[campo] ? true : undefined,
    'aria-describedby': `${id(campo)}-msg`,
  });

  const registrarCheckbox = (campo: Campo<T>) => ({
    id: id(campo),
    name: campo,
    checked: Boolean(valores[campo]),
    onChange: (e: ChangeEvent<HTMLInputElement>) => cambiar(campo, e.target.checked as T[typeof campo]),
  });

  const enviar = (accion: (valores: T) => Promise<void> | void) => async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enviando) return;
    setIntentoEnvio(true);
    const invalidos = Object.keys(validar(valores));
    if (invalidos.length > 0) {
      document.getElementById(id(invalidos[0] as Campo<T>))?.focus();
      return;
    }
    setEnviando(true);
    setErrorGeneral(null);
    try {
      await accion(valores);
    } catch (err) {
      setErrorGeneral(err instanceof Error ? err.message : 'Ocurrió un error inesperado. Probá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const reiniciarValidacion = () => {
    setIntentoEnvio(false);
    setTocados({});
    setErrorGeneral(null);
  };

  return {
    valores,
    errores,
    cantidadErrores: Object.keys(errores).length,
    enviando,
    errorGeneral,
    id,
    cambiar,
    registrar,
    registrarCheckbox,
    enviar,
    reiniciarValidacion,
  };
}
