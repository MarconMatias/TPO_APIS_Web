import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { About } from './pages/About';
import { Admin } from './pages/Admin';
import { Auth } from './pages/Auth';
import { Cart } from './pages/Cart';
import { Catalog } from './pages/Catalog';
import { Checkout } from './pages/Checkout';
import { Confirmation } from './pages/Confirmation';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { ProductDetail } from './pages/ProductDetail';
import { RequireAuth } from './routes/RequireAuth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'catalogo', element: <Catalog /> },
      { path: 'catalogo/:categoria', element: <Catalog /> },
      { path: 'entrega-inmediata', element: <Catalog soloStock /> },
      { path: 'producto/:id', element: <ProductDetail /> },
      { path: 'carrito', element: <Cart /> },
      { path: 'cuenta', element: <Auth /> },
      {
        path: 'checkout',
        element: (
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        ),
      },
      { path: 'confirmacion', element: <Confirmation /> },
      { path: 'admin', element: <Admin /> },
      { path: 'nosotros', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
