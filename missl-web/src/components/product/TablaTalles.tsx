import { CATEGORIAS, TABLAS_TALLES } from '../../data/catalogo';
import type { Categoria } from '../../types';

/** Guía de talles como tabla real (nunca imagen), con encabezados de columna y de fila. */
export function TablaTalles({ categoria }: { categoria: Categoria }) {
  const tabla = TABLAS_TALLES[categoria];
  return (
    <figure className="table-scroll">
      <table className="num">
        <caption className="sr-only">Guía de talles de {CATEGORIAS[categoria].label.toLowerCase()}</caption>
        <thead>
          <tr>
            {tabla.head.map((h) => (
              <th key={h} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.rows.map(([primera, ...resto]) => (
            <tr key={primera}>
              <th scope="row">{primera}</th>
              {resto.map((celda, i) => (
                <td key={i}>{celda}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
