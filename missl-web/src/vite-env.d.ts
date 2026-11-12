/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de missl-api, ej.: http://localhost:8080/api */
  readonly VITE_API_URL?: string;
  /** "false" para usar missl-api; cualquier otro valor (o sin definir) usa los datos simulados. */
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
