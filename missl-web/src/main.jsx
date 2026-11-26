// Primero los estilos globales: así los CSS Modules de cada vista se inyectan después y pueden especializarlos.
import './styles/global.scss';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

// Se monta sobre <body>: el árbol queda header / main / footer sin envoltorios genéricos.
createRoot(document.body).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
