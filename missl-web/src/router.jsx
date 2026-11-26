import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { About } from './pages/About';
import { Admin2fa } from './pages/admin/Admin2fa';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminPanel } from './pages/admin/AdminPanel';
import { Auth } from './pages/Auth';
import { Cart } from './pages/Cart';
import { Catalog } from './pages/Catalog';
import { Checkout } from './pages/Checkout';
import { Confirmation } from './pages/Confirmation';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { ProductDetail } from './pages/ProductDetail';
import { Terms } from './pages/Terms';
import { AdminProtectedRoute } from './routes/AdminProtectedRoute';
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
      // Sin checkout invitado: comprar exige sesión de cliente.
      { path: 'checkout', element: <RequireAuth><Checkout /></RequireAuth> },
      { path: 'confirmacion', element: <Confirmation /> },
      // Administración: contraseña → 2FA → panel protegido por JWT de rol ADMIN.
      { path: 'admin', element: <AdminLogin /> },
      { path: 'admin/2fa', element: <Admin2fa /> },
      { path: 'admin/panel', element: <AdminProtectedRoute><AdminPanel /></AdminProtectedRoute> },
      { path: 'nosotros', element: <About /> },
      { path: 'terminos', element: <Terms /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
