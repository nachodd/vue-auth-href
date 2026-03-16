export { useAuthDownload } from "./composables/useAuthDownload";
export { createAuthHrefDirective, vAuthHref } from "./directives/authHref";
export { createAuthHrefPlugin } from "./plugin";
export { AuthDownloadError, isAuthDownloadError } from "./types";
export type {
  AuthDownloadErrorCode,
  AuthDownloadOptions,
  AuthFetch,
  AuthHeaders,
  AuthHrefDirectiveOptions,
  AuthHrefDirectiveValue,
  AuthHrefLoadingOptions,
  AuthTokenSource,
  DownloadOutcome,
  DownloadRequest,
  DownloadResult,
  DownloadStatus,
  DownloadTextMode,
  MaybeGetter,
  UseAuthDownloadReturn,
} from "./types";

export { default } from "./plugin";
