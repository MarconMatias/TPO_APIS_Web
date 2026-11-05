import { Fragment } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Seccion } from '../components/ui/Seccion';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './About.module.scss';

const DATOS: [string, string][] = [
  ['Categorías', 'Zapatillas, indumentaria y carteras'],
  ['Por encargo', 'Entrega en 3 semanas'],
  ['Con stock', 'Entrega en 24 a 72 h'],
  ['Medios de pago', 'Mercado Pago, débito y transferencia'],
  ['Base', 'Buenos Aires, Argentina'],
];

const INTEGRANTES = ['Matias Marcon', 'Lucas Mendoza', 'Nahuel Frechero', 'Lisandro Ramos'];

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .map((parte) => parte[0])
    .join('');

export function About() {
  useDocumentTitle('Nosotros');

  return (
    <>
      <PageHeader
        id="h-nosotros"
        eyebrow="MISSL · Nosotros"
        titulo="Quiénes somos"
        bajada="Zapatillas, indumentaria y carteras originales, traídas por encargo o listas para entrega inmediata."
      />

      <Seccion id="h-compania" titulo="La compañía">
        <article className={styles.grid}>
          <section className={styles.texto} aria-label="Descripción">
            <p>
              MISSL es un e-commerce argentino de zapatillas, indumentaria y carteras originales. Trabajamos con modelos
              por encargo: elegís el producto y el talle, confirmás el pago y lo recibís en tres semanas.
            </p>
            <p>
              Además mantenemos una selección con stock físico en Buenos Aires para entrega inmediata, que despachamos
              dentro de las 24 a 72 horas de acreditado el pago.
            </p>
            <p>
              Vendemos con Mercado Pago, débito y transferencia bancaria, sin tarjetas de crédito ni cuotas. Quienes se
              registran obtienen un 5% de descuento en su primera compra.
            </p>
          </section>
          <dl className={styles.datos}>
            {DATOS.map(([dt, dd]) => (
              <Fragment key={dt}>
                <dt>{dt}</dt>
                <dd>{dd}</dd>
              </Fragment>
            ))}
          </dl>
        </article>
      </Seccion>

      <Seccion id="h-equipo" titulo="Integrantes del grupo">
        <p className={styles.intro}>Este sitio fue diseñado y desarrollado por:</p>
        <ul className={styles.equipo}>
          {INTEGRANTES.map((nombre) => (
            <li key={nombre}>
              <article className={styles.miembro}>
                <p className={styles.avatar} aria-hidden="true">{iniciales(nombre)}</p>
                <h3>{nombre}</h3>
                <p>Integrante del equipo</p>
              </article>
            </li>
          ))}
        </ul>
      </Seccion>
    </>
  );
}
