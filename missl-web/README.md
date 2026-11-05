# MISSL · Frontend

Frontend de MISSL (e-commerce de zapatillas, indumentaria y carteras originales) hecho en React a partir de `../missl-mockup.html`.

Stack: React 19 + TypeScript + Vite, React Router, Zustand y SCSS Modules. Usa datos simulados: en esta etapa no se conecta con missl-api.

## Cómo correrlo

```bash
npm install
npm run dev       # http://localhost:4200
npm run build     # chequeo de tipos + build de producción
npm run lint
```

Cuenta de prueba: `demo@missl.com.ar` / `missl2026`. También se puede crear una cuenta nueva desde **Ingresar**.

## Vistas

| Ruta | Vista |
| --- | --- |
| `/` | Inicio: hero, en tendencia, promoción con cuenta regresiva, entrega inmediata y categorías |
| `/catalogo`, `/catalogo/:categoria`, `/entrega-inmediata` | Catálogo con filtro por marca y orden (los dos quedan en la URL) |
| `/producto/:id` | Ficha: galería, elección de talle, guía de talles y productos relacionados |
| `/carrito` | Carrito con cantidades y resumen |
| `/cuenta` | Registro o ingreso; con sesión iniciada muestra los datos de la cuenta |
| `/checkout` | Envío y pago simulado (pide sesión iniciada) |
| `/confirmacion` | Comprobante del pedido |
| `/admin` | ABM de productos con búsqueda y diálogos modales |
| `/nosotros` | La compañía e integrantes |

## Estructura

```
src/
  components/  layout (Header, Footer, Toast), ui (Field, Modal, PageHeader…), product, cart, admin
  pages/       una vista por ruta, cada una con su .module.scss
  store/       estado global con Zustand (productos, carrito, sesión, pedido, avisos)
  hooks/       useForm (validación accesible), useCarrito, useDocumentTitle
  data/        catálogo de ejemplo y constantes del negocio
  util/        precios, orden, validaciones, latencia simulada
  styles/      tokens, reset y primitivas globales (botones, campos, badges)
```

## Decisiones

- **Sin `<div>`:** React se monta directamente sobre `<body>` y todo el marcado usa elementos semánticos (`header`, `nav`, `main`, `section`, `article`, `aside`, `figure`, `dl`, `menu`, `dialog`, `output`, `data`, `time`).
- **Accesibilidad:** enlace para saltar al contenido, `aria-current` en la navegación, foco al contenido al cambiar de vista, un solo `h1` por vista, errores asociados con `aria-describedby`, foco en el primer campo inválido, avisos en una región `role="status"`, modales nativos con `<dialog>` y contraste AA.
- **Estados:** los guardados simulan latencia para mostrar estados de espera ("Procesando pago…", "Guardando…"), de error (validación y credenciales incorrectas), de éxito (avisos) y de vacío (carrito, filtros, 404).
- **Persistencia:** carrito, sesión y productos se guardan en `localStorage` (con un respaldo en memoria si el navegador lo bloquea).
