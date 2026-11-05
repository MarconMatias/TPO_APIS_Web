import { Link, NavLink } from 'react-router-dom';
import { CATEGORIAS, LISTA_CATEGORIAS } from '../../data/catalogo';
import { useAuthStore } from '../../store/authStore';
import { selectCantidadTotal, useCartStore } from '../../store/cartStore';
import styles from './Header.module.scss';

/** Barra de aviso + header fijo con navegación de categorías y de cuenta. NavLink marca aria-current="page". */
export function Header() {
  const cantidad = useCartStore(selectCantidadTotal);
  const usuario = useAuthStore((s) => s.usuario);

  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <p className={`${styles.announce} band`}>Modelos por encargo · Entrega en 3 semanas · Envíos a todo el país</p>

      <header className={`${styles.header} band`}>
        <Link to="/" className={styles.logo}>
          <img src="/assets/missl-logo.png" alt="MISSL, ir al inicio" width={67} height={26} />
        </Link>

        <nav className={styles.mainNav} aria-label="Categorías">
          <ul>
            {LISTA_CATEGORIAS.map((cat) => (
              <li key={cat}>
                <NavLink to={`/catalogo/${cat}`}>{CATEGORIAS[cat].label}</NavLink>
              </li>
            ))}
            <li>
              <NavLink to="/entrega-inmediata">Entrega inmediata</NavLink>
            </li>
            <li>
              <NavLink to="/nosotros">Nosotros</NavLink>
            </li>
          </ul>
        </nav>

        <nav className={styles.accountNav} aria-label="Cuenta y carrito">
          <ul>
            <li>
              <NavLink to="/admin">Admin</NavLink>
            </li>
            <li>
              <NavLink to="/cuenta">{usuario ? usuario.nombre.split(' ')[0] : 'Ingresar'}</NavLink>
            </li>
            <li>
              <NavLink to="/carrito" className={styles.cart}>
                Carrito
                <span className={`${styles.count} num`} aria-hidden="true">{cantidad}</span>
                <span className="sr-only">, {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
