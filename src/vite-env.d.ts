/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_PAGE: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
