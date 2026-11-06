/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de missl-api, ej.: http://localhost:8080/api */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
