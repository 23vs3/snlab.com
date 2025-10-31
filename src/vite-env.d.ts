/// <reference types="vite/client" />

/**
 * Vite 环境变量类型定义
 */
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
  // 可以添加其他环境变量
  [key: string]: any;
}

/**
 * Vite 客户端模块类型定义
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    on(event: string, callback: () => void): void;
    off(event: string, callback: () => void): void;
    send(event: string, data?: any): void;
    dispose(callback: (data: any) => void): void;
    invalidate(): void;
    decline(): void;
    accept(callback?: (mod: any) => void): void;
  };
}

