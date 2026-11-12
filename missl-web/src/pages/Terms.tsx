import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { DESCUENTO_REGISTRO_PCT } from '../constants/negocio';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './Terms.module.scss';

const ACTUALIZADO = '12 de noviembre de 2026';

interface Clausula {
  id: string;
  titulo: string;
  cuerpo: ReactNode;
}

const CLAUSULAS: Clausula[] = [
  {
    id: 't-alcance',
    titulo: 'Alcance',
    cuerpo: (
      <p>
        Estos términos regulan el uso del sitio de MISSL y las compras realizadas en él. Al registrarte o confirmar un
        pedido aceptás estas condiciones. Si no estás de acuerdo, te pedimos que no utilices el sitio.
      </p>
    ),
  },
  {
    id: 't-cuenta',
    titulo: 'Cuenta de cliente',
    cuerpo: (
      <>
        <p>
          Para comprar es necesario tener una cuenta. Sos responsable de que los datos que cargás sean correctos y de
          mantener la confidencialidad de tu contraseña.
        </p>
        <p>
          Quienes se registran obtienen un {DESCUENTO_REGISTRO_PCT}% de descuento en su primera compra. El beneficio es
          personal, se aplica una única vez por cliente y no es acumulable con otras promociones salvo que se indique lo
          contrario.
        </p>
      </>
    ),
  },
  {
    id: 't-productos',
    titulo: 'Productos y precios',
    cuerpo: (
      <>
        <p>
          Todos los productos son originales. Las fotos son ilustrativas y pueden presentar diferencias menores de color
          respecto del producto real.
        </p>
        <p>
          Los precios están expresados en pesos argentinos e incluyen IVA. El importe final de cada pedido es el que
          confirma el sistema al procesar el pago, con las promociones vigentes en ese momento.
        </p>
        <p>
          Las promociones tienen la duración indicada en el sitio y están sujetas a disponibilidad de stock.
        </p>
      </>
    ),
  },
  {
    id: 't-modalidades',
    titulo: 'Modalidades de compra y entrega',
    cuerpo: (
      <ul>
        <li>
          <strong>Por encargo:</strong> una vez acreditado el pago pedimos el producto al proveedor. El plazo de entrega
          estimado es de tres semanas.
        </li>
        <li>
          <strong>Entrega inmediata:</strong> productos con stock físico en Buenos Aires, que despachamos dentro de las 24
          a 72 horas hábiles de acreditado el pago.
        </li>
        <li>
          Los plazos son estimados. Si un pedido se demora por causas ajenas a MISSL, te avisamos por email y podés optar
          por esperar o cancelar con reintegro total.
        </li>
      </ul>
    ),
  },
  {
    id: 't-pagos',
    titulo: 'Medios de pago',
    cuerpo: (
      <p>
        Aceptamos Mercado Pago, tarjeta de débito y transferencia bancaria. No operamos con tarjetas de crédito ni
        cuotas. En el caso de transferencia, el pedido se confirma cuando se acredita el importe, lo que puede demorar
        hasta 24 horas.
      </p>
    ),
  },
  {
    id: 't-arrepentimiento',
    titulo: 'Derecho de arrepentimiento',
    cuerpo: (
      <p>
        Según el artículo 34 de la Ley 24.240 de Defensa del Consumidor, podés revocar la compra dentro de los 10 días
        corridos desde que recibís el producto, sin necesidad de dar explicaciones. El producto debe estar sin uso, con
        sus etiquetas y en su caja original. Para hacerlo escribinos a{' '}
        <a href="mailto:hola@missl.com.ar">hola@missl.com.ar</a>.
      </p>
    ),
  },
  {
    id: 't-cambios',
    titulo: 'Cambios y devoluciones',
    cuerpo: (
      <>
        <p>
          Podés pedir un cambio de talle dentro de los 30 días de recibido el producto, sujeto a disponibilidad. Los
          productos por encargo se cambian por otro talle del mismo modelo, que se vuelve a encargar al proveedor.
        </p>
        <p>
          Si el producto llega fallado o no corresponde con lo pedido, nos hacemos cargo del envío y del cambio o
          reintegro.
        </p>
      </>
    ),
  },
  {
    id: 't-datos',
    titulo: 'Datos personales',
    cuerpo: (
      <p>
        Tratamos tus datos según la Ley 25.326 de Protección de Datos Personales. Los usamos solo para gestionar tu
        cuenta y tus pedidos, y no los compartimos con terceros salvo con los proveedores de pago y logística necesarios
        para completar la compra. Podés pedir el acceso, la rectificación o la eliminación de tus datos en cualquier
        momento.
      </p>
    ),
  },
  {
    id: 't-cambios-terminos',
    titulo: 'Modificaciones',
    cuerpo: (
      <p>
        MISSL puede actualizar estos términos. Los cambios rigen desde su publicación en el sitio y no afectan a los
        pedidos ya confirmados.
      </p>
    ),
  },
];

export function Terms() {
  useDocumentTitle('Términos y condiciones');

  return (
    <>
      <PageHeader
        id="h-terminos"
        eyebrow="MISSL · Legal"
        titulo="Términos y condiciones"
        bajada={`Última actualización: ${ACTUALIZADO}.`}
      />

      <article className={`${styles.terms} band`} aria-labelledby="h-terminos">
        <nav className={styles.indice} aria-labelledby="h-indice">
          <h2 id="h-indice">Contenido</h2>
          <ol>
            {CLAUSULAS.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`}>{c.titulo}</a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className={styles.clausulas}>
          {CLAUSULAS.map((c) => (
            <li key={c.id}>
              <section aria-labelledby={c.id}>
                <h2 id={c.id} tabIndex={-1}>{c.titulo}</h2>
                {c.cuerpo}
              </section>
            </li>
          ))}
        </ol>

        <p className={styles.cierre}>
          ¿Dudas? Escribinos a <a href="mailto:hola@missl.com.ar">hola@missl.com.ar</a> o volvé al{' '}
          <Link to="/catalogo">catálogo</Link>.
        </p>
      </article>
    </>
  );
}
