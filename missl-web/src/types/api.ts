/** ApiError de missl-api: formato común de todas las respuestas de error (400, 401, 403, 404, 409, 500). */
export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  mensajes: string[];
}
