import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Toast } from './components/layout/Toast';

/** Shell: header + vista ruteada + footer + aviso global. Se monta directo en <body>. */
export function App() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const rutaAnterior = useRef(pathname);

  // Al cambiar de vista: volver arriba y llevar el foco al contenido (patrón accesible para SPA).
  useEffect(() => {
    if (rutaAnterior.current === pathname) return;
    rutaAnterior.current = pathname;
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <Header />
      <main id="contenido" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </>
  );
}
