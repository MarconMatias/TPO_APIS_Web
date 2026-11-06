# MISSL · Frontend

Frontend de MISSL (e-commerce de zapatillas, indumentaria y carteras originales) en React. Es un repositorio independiente que consume **missl-api** (Spring Boot) por HTTP/REST.

Stack: React 19 + TypeScript + Vite, React Router, Zustand y SCSS Modules.

## Cómo correrlo

1. Levantar missl-api (puerto 8080). Su `missl.cors.allowed-origin` tiene que incluir `http://localhost:4200`.
2. Instalar y arrancar el front:

```bash
cp .env.example .env   # opcional: VITE_API_URL, por defecto http://localhost:8080/api
npm install
npm run dev            # http://localhost:4200
npm run build          # chequeo de tipos + build de producción
npm run lint
```

### Cuentas de prueba (cargadas por las migraciones de missl-api)

| Rol | Email | Contraseña | Notas |
| --- | --- | --- | --- |
| Cliente | `demo@missl.com.ar` | `missl2026` | Descuento de bienvenida sin usar (se consume con la primera compra) |
| Cliente | `camila.duarte@gmail.com` | `missl2026` | Descuento ya usado |
| Admin | `admin@missl.com.ar` | `missl2026` | 2FA: cargar el secreto TOTP `IWSTKBSLPAMCBUTFDQMNNS63VEBYIFSI` en Google Authenticator o Authy |

## Integración con missl-api

| Vista | Endpoint | Sesión |
| --- | --- | --- |
| Inicio, catálogo, carrito | `GET /productos?categoria=&stock=&orden=` | — |
| Ficha de producto | `GET /productos/{id}` (talles con stock y sugeridos) | — |
| Registro / ingreso | `POST /auth/registro`, `POST /auth/login` | — |
| Mi cuenta | `GET /auth/me` | Cliente |
| Checkout | `POST /ventas` | Cliente |
| Admin, paso 1 y paso 2 | `POST /admin/login`, `POST /admin/2fa` | — |
| Panel de administración | `GET/POST/PUT/DELETE /admin/productos`, `GET /admin/productos/promociones`, `PATCH /admin/productos/{id}/promocion` | Admin |

- **No hay compra como invitado:** para comprar hace falta una cuenta. El backend toma al cliente del JWT, no del body.
- **Tipos:** `src/types/` replica los DTO de missl-api con los mismos nombres de campos.
- **Errores:** todo pasa por `src/api/client.ts`. Las respuestas de error (`ApiError`: `status` + `mensajes`) se muestran en los formularios o en un estado de error con "Reintentar". Un 401 con token cierra la sesión vencida.
- **Lo que queda en el navegador:** el carrito (solo id, talle y cantidad; precios y descuentos los da la API) y los tokens. La sesión de cliente se guarda en `localStorage` y la de admin en `sessionStorage`.

## Estructura

```
src/
  api/         client.ts (fetch + JWT + errores) y un módulo por recurso: productosApi, authApi, ventasApi, adminApi
  types/       espejo de los DTO de missl-api
  store/       Zustand: sesión de cliente, sesión de admin (2FA), carrito, último pedido, avisos
  hooks/       useApi (carga/error/reintentar), useCarrito, useForm (validación accesible), useDocumentTitle
  routes/      RequireAuth (checkout) y AdminProtectedRoute (panel)
  pages/       una vista por ruta; pages/admin con login, 2FA y panel
  components/  layout, ui, product, cart, admin
  constants/   etiquetas de categorías y medios de pago, guía de talles (contenido fijo, no datos)
  styles/      tokens, reset y primitivas globales
```

## Accesibilidad y semántica

- Sin ningún `<div>`: React se monta directamente sobre `<body>`.
- Enlace para saltar al contenido, `aria-current` en la navegación y foco al contenido al cambiar de vista.
- Errores asociados a cada campo con `aria-describedby`, foco en el primer campo inválido y avisos en `role="status"`.
- Modales nativos con `<dialog>` y contraste AA.
