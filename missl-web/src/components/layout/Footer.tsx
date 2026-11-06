import { Link } from 'react-router-dom';
import { CATEGORIAS, LISTA_CATEGORIAS } from '../../constants/negocio';
import styles from './Footer.module.scss';

const PREGUNTAS = [
  {
    pregunta: '¿Cómo funciona el encargo?',
    respuesta: 'Confirmás el pago, pedimos el par al proveedor y lo recibís en 3 semanas.',
  },
  {
    pregunta: '¿Cómo mido mi pie?',
    respuesta: 'Apoyá el talón contra la pared sobre una hoja, marcá la punta y medí en cm. Buscá esa medida en la guía de talles.',
  },
  {
    pregunta: '¿Qué medios de pago aceptan?',
    respuesta: 'Mercado Pago, débito y transferencia. No trabajamos con crédito ni cuotas.',
  },
];

export function Footer() {
  return (
    <footer className={`${styles.footer} band`}>
      <section aria-label="Sobre MISSL">
        <p>
          <img src="/assets/missl-logo.png" alt="MISSL" width={78} height={30} className={styles.logo} />
        </p>
        <p className={styles.about}>Zapatillas, indumentaria y carteras originales por encargo. Buenos Aires, Argentina.</p>
      </section>

      <nav aria-labelledby="ft-tienda">
        <h2 id="ft-tienda">Tienda</h2>
        <ul>
          {LISTA_CATEGORIAS.map((cat) => (
            <li key={cat}>
              <Link to={`/catalogo/${CATEGORIAS[cat].slug}`}>{CATEGORIAS[cat].label}</Link>
            </li>
          ))}
          <li>
            <Link to="/entrega-inmediata">Entrega inmediata</Link>
          </li>
          <li>
            <Link to="/nosotros">Nosotros</Link>
          </li>
          <li>
            <Link to="/admin">Administración</Link>
          </li>
        </ul>
      </nav>

      <section aria-labelledby="ft-ayuda">
        <h2 id="ft-ayuda">Preguntas frecuentes</h2>
        {PREGUNTAS.map((faq) => (
          <details key={faq.pregunta}>
            <summary>{faq.pregunta}</summary>
            <p>{faq.respuesta}</p>
          </details>
        ))}
      </section>

      <section aria-labelledby="ft-contacto">
        <h2 id="ft-contacto">Contacto</h2>
        <address>
          <a href="mailto:hola@missl.com.ar">hola@missl.com.ar</a>
          <a href="https://instagram.com/missl.store" target="_blank" rel="noopener noreferrer">
            @missl.store <span className="sr-only">(Instagram, abre en otra pestaña)</span>
          </a>
          <span>Buenos Aires, Argentina</span>
        </address>
      </section>

      <p className={styles.legal}>
        <small>© 2026 MISSL</small>
        <small>Datos de ejemplo · Aplicaciones Interactivas</small>
      </p>
    </footer>
  );
}
