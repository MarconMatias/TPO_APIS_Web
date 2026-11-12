import { DESCUENTO_REGISTRO_PCT } from '../constants/negocio';
import type { ProductoAdmin, ProductoAltaRequest, PromocionAdmin, PromocionRequest } from '../types/admin';
import type { ClienteLoginRequest, ClienteRegistroRequest } from '../types/cliente';
import type { Categoria, Producto, ProductoDetalle } from '../types/producto';
import type { Confirmacion, VentaCliente, VentaRequest } from '../types/venta';
import { storageSeguro } from '../util/storage';
import {
  ADMIN_MOCK,
  CUENTAS_INICIALES,
  productosIniciales,
  skuPara,
  stockInicial,
  VENTAS_INICIALES,
  type CuentaMock,
  type ProductoMock,
  type VentaMock,
} from './datos';

/**
 * Backend simulado: responde las mismas rutas que missl-api con datos hardcodeados.
 * El estado (productos, cuentas, ventas) se guarda en localStorage para que sobreviva a un F5.
 * Para volver a los datos iniciales: borrar la clave "missl_mock_db" del localStorage.
 */

/** Mismo formato que ApiError de missl-api; client.ts lo convierte en ApiError. */
export class ErrorMock {
  readonly status: number;
  readonly mensajes: string[];

  constructor(status: number, mensajes: string[]) {
    this.status = status;
    this.mensajes = mensajes;
  }
}

interface Db {
  productos: ProductoMock[];
  cuentas: CuentaMock[];
  ventas: VentaMock[];
  /** challengeId → email del admin que pasó el paso 1. */
  desafios: Record<string, string>;
}

const CLAVE = 'missl_mock_db';
const LATENCIA_MS = 350;
const HORA = 3_600_000;
const storage = storageSeguro('local');

function cargarDb(): Db {
  try {
    const guardado = storage.getItem(CLAVE);
    if (guardado) return JSON.parse(guardado) as Db;
  } catch {
    // datos corruptos: se regenera
  }
  return {
    productos: productosIniciales(Date.now()),
    cuentas: structuredClone(CUENTAS_INICIALES),
    ventas: structuredClone(VENTAS_INICIALES),
    desafios: {},
  };
}

const db = cargarDb();
const guardar = () => storage.setItem(CLAVE, JSON.stringify(db));

// ---------- helpers ----------

const error = (status: number, mensaje: string) => new ErrorMock(status, [mensaje]);

function restanteMs(p: ProductoMock): number | null {
  if (p.promoFin === null || p.promoPct <= 0) return null;
  const resto = p.promoFin - Date.now();
  return resto > 0 ? resto : null;
}

function aResumen(p: ProductoMock): Producto {
  const restante = restanteMs(p);
  const promoActiva = restante !== null;
  return {
    id: p.id,
    sku: p.sku,
    nombre: p.nombre,
    marca: p.marca,
    categoria: p.categoria,
    precio: p.precio,
    precioFinal: promoActiva ? Math.round(p.precio * (1 - p.promoPct / 100)) : p.precio,
    promoActiva,
    promoPct: promoActiva ? p.promoPct : 0,
    promoRestanteMs: restante,
    enStock: p.enStock,
    esTendencia: p.esTendencia,
    imagenUrl: null,
    deliveryLabel: p.enStock ? 'Entrega inmediata · 24 a 48 h' : 'Por encargo · llega en 3 semanas',
  };
}

function aAdmin(p: ProductoMock): ProductoAdmin {
  const { id, sku, nombre, marca, categoria, precio, enStock, esTendencia, descripcion } = p;
  return { id, sku, nombre, marca, categoria, precio, enStock, esTendencia, descripcion };
}

function aPromocion(p: ProductoMock): PromocionAdmin {
  return {
    id: p.id,
    nombre: p.nombre,
    marca: p.marca,
    esTendencia: p.esTendencia,
    descuentoPct: p.promoPct,
    descuentoHoras: p.promoHoras,
    restanteMs: restanteMs(p),
  };
}

const activos = () => db.productos.filter((p) => p.activo);

function buscarProducto(id: number): ProductoMock {
  const p = db.productos.find((x) => x.id === id && x.activo);
  if (!p) throw error(404, `No existe un producto con id ${id}.`);
  return p;
}

const tokenCliente = (email: string) => `mock-cliente.${btoa(email)}`;
const tokenAdmin = (email: string) => `mock-admin.${btoa(email)}`;

function clienteDe(token: string | null): CuentaMock {
  const email = token?.startsWith('mock-cliente.') ? atob(token.slice('mock-cliente.'.length)) : null;
  const cuenta = db.cuentas.find((c) => c.email === email);
  if (!cuenta) throw error(401, 'Tenés que iniciar sesión para continuar.');
  return cuenta;
}

function exigirAdmin(token: string | null) {
  if (!token?.startsWith('mock-admin.')) throw error(401, 'Sesión de administrador inválida.');
}

const sinPassword = ({ nombre, email, descuentoDisponible }: CuentaMock) => ({ nombre, email, descuentoDisponible });

function validarAlta(r: ProductoAltaRequest) {
  const mensajes: string[] = [];
  if (!r.nombre?.trim()) mensajes.push('El nombre es obligatorio.');
  if (!r.marca?.trim()) mensajes.push('La marca es obligatoria.');
  if (!(r.precio > 0)) mensajes.push('El precio tiene que ser mayor a 0.');
  if (mensajes.length) throw new ErrorMock(400, mensajes);
}

function fechaCorta(ms: number) {
  return new Date(ms).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
}

// ---------- rutas ----------

function listarProductos(params: URLSearchParams): Producto[] {
  const categoria = params.get('categoria') as Categoria | null;
  const marca = params.get('marca');
  const soloStock = params.get('stock') === 'true';
  const orden = params.get('orden') ?? 'destacados';

  const lista = activos()
    .filter((p) => !categoria || p.categoria === categoria)
    .filter((p) => !marca || p.marca.toLowerCase() === marca.toLowerCase())
    .filter((p) => !soloStock || p.enStock)
    .map(aResumen);

  const comparadores: Record<string, (a: Producto, b: Producto) => number> = {
    destacados: (a, b) => Number(b.esTendencia) - Number(a.esTendencia) || Number(b.promoActiva) - Number(a.promoActiva) || a.id - b.id,
    menor: (a, b) => a.precioFinal - b.precioFinal,
    mayor: (a, b) => b.precioFinal - a.precioFinal,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
    disponibilidad: (a, b) => Number(b.enStock) - Number(a.enStock) || a.id - b.id,
  };
  return lista.sort(comparadores[orden] ?? comparadores.destacados);
}

function detalleProducto(id: number): ProductoDetalle {
  const p = buscarProducto(id);
  return {
    producto: aResumen(p),
    descripcion: p.descripcion,
    talles: Object.entries(p.stock).map(([talle, stockUnidades]) => ({ talle, stockUnidades })),
    sugeridos: activos()
      .filter((x) => x.categoria === p.categoria && x.id !== p.id)
      .slice(0, 4)
      .map(aResumen),
  };
}

function registrar({ nombre, email, password }: ClienteRegistroRequest) {
  const normalizado = email.trim().toLowerCase();
  if (db.cuentas.some((c) => c.email === normalizado)) {
    throw error(409, 'Ya existe una cuenta con ese email. Probá ingresar con tu contraseña.');
  }
  const cuenta: CuentaMock = { nombre: nombre.trim(), email: normalizado, password, descuentoDisponible: true };
  db.cuentas.push(cuenta);
  guardar();
  return { ...sinPassword(cuenta), token: tokenCliente(cuenta.email) };
}

function ingresar({ email, password }: ClienteLoginRequest) {
  const cuenta = db.cuentas.find((c) => c.email === email.trim().toLowerCase() && c.password === password);
  if (!cuenta) throw error(401, 'El email o la contraseña no son correctos.');
  return { ...sinPassword(cuenta), token: tokenCliente(cuenta.email) };
}

function crearVenta(token: string | null, r: VentaRequest): Confirmacion {
  const cuenta = clienteDe(token);
  if (!r.items?.length) throw error(400, 'El carrito está vacío.');

  let subtotal = 0;
  let todoEnStock = true;
  for (const item of r.items) {
    const p = buscarProducto(item.productoId);
    if (!(item.talle in p.stock)) throw error(400, `El talle ${item.talle} no existe para ${p.nombre}.`);
    if (p.enStock && p.stock[item.talle] < item.cantidad) {
      throw error(409, `No hay stock suficiente de ${p.nombre} talle ${item.talle}.`);
    }
    if (!p.enStock) todoEnStock = false;
    subtotal += aResumen(p).precioFinal * item.cantidad;
  }
  for (const item of r.items) {
    const p = buscarProducto(item.productoId);
    if (p.enStock) p.stock[item.talle] -= item.cantidad;
  }

  const descuento = cuenta.descuentoDisponible ? Math.round((subtotal * DESCUENTO_REGISTRO_PCT) / 100) : 0;
  cuenta.descuentoDisponible = false;
  const venta: VentaMock = {
    codigo: `MS-${Math.floor(10000 + Math.random() * 90000)}`,
    email: cuenta.email,
    fecha: new Date().toISOString(),
    medioPago: r.medioPago,
    subtotal,
    descuento,
    total: subtotal - descuento,
    estado: 'PENDIENTE',
  };
  db.ventas.push(venta);
  guardar();

  const ahora = Date.now();
  return {
    codigo: venta.codigo,
    subtotal,
    descuento,
    total: venta.total,
    medioPago: r.medioPago,
    emailCliente: cuenta.email,
    emailAdminNotificado: ADMIN_MOCK.email,
    estado: 'PENDIENTE',
    entregaEstimada: todoEnStock
      ? `Entre el ${fechaCorta(ahora + 24 * HORA)} y el ${fechaCorta(ahora + 48 * HORA)}`
      : `Alrededor del ${fechaCorta(ahora + 21 * 24 * HORA)} (por encargo)`,
  };
}

function ventasMias(token: string | null): VentaCliente[] {
  const { email } = clienteDe(token);
  return db.ventas
    .filter((v) => v.email === email)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map(({ email: _email, ...v }) => v);
}

function adminLogin({ email, password }: { email: string; password: string }) {
  if (email.trim().toLowerCase() !== ADMIN_MOCK.email || password !== ADMIN_MOCK.password) {
    throw error(401, 'El email o la contraseña no son correctos.');
  }
  const challengeId = crypto.randomUUID();
  db.desafios[challengeId] = ADMIN_MOCK.email;
  return { challengeId };
}

/** En modo simulado se acepta cualquier código de 6 dígitos. */
function admin2fa({ challengeId, codigo }: { challengeId: string; codigo: string }) {
  const email = db.desafios[challengeId];
  if (!email) throw error(401, 'El desafío venció. Volvé a iniciar sesion.');
  if (!/^\d{6}$/.test(codigo)) throw error(400, 'El código tiene exactamente 6 dígitos.');
  delete db.desafios[challengeId];
  return { token: tokenAdmin(email), email };
}

function crearProducto(r: ProductoAltaRequest): ProductoAdmin {
  validarAlta(r);
  const id = Math.max(0, ...db.productos.map((p) => p.id)) + 1;
  const p: ProductoMock = {
    id,
    sku: skuPara(r.categoria, id),
    nombre: r.nombre.trim(),
    marca: r.marca.trim(),
    categoria: r.categoria,
    precio: r.precio,
    enStock: r.enStock,
    esTendencia: false,
    descripcion: r.descripcion || null,
    stock: stockInicial(r.categoria, id),
    promoPct: 0,
    promoHoras: 24,
    promoFin: null,
    activo: true,
  };
  db.productos.push(p);
  guardar();
  return aAdmin(p);
}

function editarProducto(id: number, r: ProductoAltaRequest): ProductoAdmin {
  validarAlta(r);
  const p = buscarProducto(id);
  if (r.categoria !== p.categoria) p.stock = stockInicial(r.categoria, id);
  Object.assign(p, { nombre: r.nombre.trim(), marca: r.marca.trim(), categoria: r.categoria, precio: r.precio, enStock: r.enStock });
  if (r.descripcion !== null) p.descripcion = r.descripcion || null;
  guardar();
  return aAdmin(p);
}

function actualizarPromocion(id: number, r: PromocionRequest): PromocionAdmin {
  const p = buscarProducto(id);
  p.esTendencia = r.esTendencia;
  p.promoPct = r.descuentoPct;
  p.promoHoras = r.horas;
  p.promoFin = r.descuentoPct > 0 ? Date.now() + r.horas * HORA : null;
  guardar();
  return aPromocion(p);
}

// ---------- router ----------

export async function mockRequest(method: string, path: string, body: unknown, token: string | null): Promise<unknown> {
  await new Promise((r) => setTimeout(r, LATENCIA_MS));
  const url = new URL(path, 'http://mock');
  const ruta = url.pathname;
  const idDe = (re: RegExp) => Number(ruta.match(re)?.[1]);
  const b = body as never;

  if (method === 'GET' && ruta === '/productos') return listarProductos(url.searchParams);
  if (method === 'GET' && /^\/productos\/[^/]+$/.test(ruta)) {
    const id = idDe(/^\/productos\/([^/]+)$/);
    if (!Number.isInteger(id)) throw error(400, 'El id de producto no es válido.');
    return detalleProducto(id);
  }

  if (method === 'POST' && ruta === '/auth/registro') return registrar(b);
  if (method === 'POST' && ruta === '/auth/login') return ingresar(b);
  if (method === 'GET' && ruta === '/auth/me') return sinPassword(clienteDe(token));

  if (method === 'POST' && ruta === '/ventas') return crearVenta(token, b);
  if (method === 'GET' && ruta === '/ventas/mias') return ventasMias(token);

  if (method === 'POST' && ruta === '/admin/login') return adminLogin(b);
  if (method === 'POST' && ruta === '/admin/2fa') return admin2fa(b);

  if (ruta.startsWith('/admin/')) {
    exigirAdmin(token);
    if (method === 'GET' && ruta === '/admin/productos') return activos().map(aAdmin);
    if (method === 'POST' && ruta === '/admin/productos') return crearProducto(b);
    if (method === 'GET' && ruta === '/admin/productos/promociones') return activos().map(aPromocion);
    if (method === 'PATCH' && /^\/admin\/productos\/\d+\/promocion$/.test(ruta)) {
      return actualizarPromocion(idDe(/^\/admin\/productos\/(\d+)\//), b);
    }
    if (method === 'PUT' && /^\/admin\/productos\/\d+$/.test(ruta)) return editarProducto(idDe(/(\d+)$/), b);
    if (method === 'DELETE' && /^\/admin\/productos\/\d+$/.test(ruta)) {
      buscarProducto(idDe(/(\d+)$/)).activo = false;
      guardar();
      return undefined;
    }
  }

  throw error(404, `Ruta simulada no implementada: ${method} ${ruta}`);
}
