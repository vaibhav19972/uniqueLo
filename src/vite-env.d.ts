/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Strapi API origin (e.g. http://localhost:1337). Unset → bundled seed JSON. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}