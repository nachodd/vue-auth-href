import type { Ref } from "vue";

export type MaybeGetter<T> = T | Ref<T> | (() => T);
export type DownloadTextMode = "text" | "html";
export type DownloadStatus = "idle" | "pending" | "success" | "error";
export type AuthHeaders = Record<string, string>;
export type AuthFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export type AuthTokenSource = MaybeGetter<string | null | undefined>;
export type AuthDownloadErrorCode =
  | "already_downloading"
  | "browser_only"
  | "http_error"
  | "invalid_element"
  | "missing_token"
  | "request_failed";

export interface AuthDownloadErrorOptions {
  code: AuthDownloadErrorCode;
  url?: string;
  status?: number;
  cause?: unknown;
}

export class AuthDownloadError extends Error {
  readonly code: AuthDownloadErrorCode;
  readonly url?: string;
  readonly status?: number;
  declare readonly cause?: unknown;

  constructor(message: string, { code, url, status, cause }: AuthDownloadErrorOptions) {
    super(message);
    this.name = "AuthDownloadError";
    this.code = code;
    this.url = url;
    this.status = status;
    this.cause = cause;
  }
}

export function isAuthDownloadError(value: unknown): value is AuthDownloadError {
  return value instanceof AuthDownloadError;
}

export interface AuthDownloadOptions {
  token?: AuthTokenSource;
  authHeader?: string;
  authScheme?: string;
  headers?: AuthHeaders;
  request?: Omit<RequestInit, "headers" | "method">;
  fetcher?: AuthFetch;
  fileName?: string | ((response: Response, url: string) => string | undefined);
  cleanupDelay?: number;
  onBeforeDownload?: () => void | Promise<void>;
  onSuccess?: (result: DownloadResult) => void;
  onError?: (error: AuthDownloadError) => void;
  onSettled?: (outcome: DownloadOutcome) => void;
}

export interface AuthHrefLoadingOptions {
  mode?: DownloadTextMode;
  text?: string;
  html?: string;
  animateDots?: boolean;
  replaceContent?: boolean;
}

export interface AuthHrefDirectiveOptions extends AuthDownloadOptions {
  loading?: AuthHrefLoadingOptions;
}

export interface NormalizedAuthDownloadOptions {
  token?: AuthTokenSource;
  authHeader: string;
  authScheme: string;
  headers: AuthHeaders;
  request?: Omit<RequestInit, "headers" | "method">;
  fetcher: AuthFetch;
  fileName?: string | ((response: Response, url: string) => string | undefined);
  cleanupDelay: number;
  onBeforeDownload?: () => void | Promise<void>;
  onSuccess?: (result: DownloadResult) => void;
  onError?: (error: AuthDownloadError) => void;
  onSettled?: (outcome: DownloadOutcome) => void;
}

export interface NormalizedAuthHrefLoadingOptions {
  mode: DownloadTextMode;
  text: string;
  html: string;
  animateDots: boolean;
  replaceContent: boolean;
}

export interface NormalizedAuthHrefDirectiveOptions extends NormalizedAuthDownloadOptions {
  loading: NormalizedAuthHrefLoadingOptions;
}

export type AuthHrefDirectiveValue = Partial<AuthHrefDirectiveOptions> | undefined;

export interface DownloadRequest {
  url: string;
  target?: string | null;
  fileName?: string | null;
}

export interface DownloadResult {
  url: string;
  fileName: string;
  blob: Blob;
  target: string | null;
}

export type DownloadOutcome =
  | {
      ok: true;
      result: DownloadResult;
    }
  | {
      ok: false;
      url: string;
      error: AuthDownloadError;
    };

export interface UseAuthDownloadReturn {
  status: Readonly<Ref<DownloadStatus>>;
  isDownloading: Readonly<Ref<boolean>>;
  error: Readonly<Ref<AuthDownloadError | null>>;
  download: (
    request: DownloadRequest,
    overrides?: Partial<AuthDownloadOptions>,
  ) => Promise<DownloadResult>;
  reset: () => void;
}
