/// <reference types="vite/client" />

interface ImportMetaEnv {
  // App
  VITE_SITE_URL?: string;
  VITE_SITE_VERSION?: string;
  VITE_VERCEL_URL?: string;

  // Logger
  VITE_LOG_LEVEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
