import { isRef } from "vue";

import { AuthDownloadError } from "../types";
import type {
  AuthFetch,
  AuthDownloadOptions,
  AuthHrefDirectiveValue,
  AuthHrefDirectiveOptions,
  MaybeGetter,
  NormalizedAuthDownloadOptions,
  NormalizedAuthHrefDirectiveOptions,
  NormalizedAuthHrefLoadingOptions,
} from "../types";

const DEFAULT_FETCHER: AuthFetch = (input, init) => {
  if (typeof globalThis.fetch !== "function") {
    throw new AuthDownloadError(
      "vue-auth-href: global fetch is not available in this environment.",
      {
        code: "request_failed",
      },
    );
  }

  return globalThis.fetch(input, init);
};

export const DEFAULT_AUTH_DOWNLOAD_OPTIONS: NormalizedAuthDownloadOptions = {
  token: undefined,
  authHeader: "Authorization",
  authScheme: "Bearer",
  headers: {},
  request: undefined,
  fetcher: DEFAULT_FETCHER,
  fileName: undefined,
  cleanupDelay: -1,
  onBeforeDownload: undefined,
  onSuccess: undefined,
  onError: undefined,
  onSettled: undefined,
};

export const DEFAULT_AUTH_HREF_LOADING_OPTIONS: NormalizedAuthHrefLoadingOptions = {
  mode: "text",
  text: "Downloading",
  html: "",
  animateDots: true,
  replaceContent: true,
};

export function mergeAuthDownloadOptions(
  globalOptions: Partial<AuthDownloadOptions> = {},
  localOptions: Partial<AuthDownloadOptions> = {},
): NormalizedAuthDownloadOptions {
  return {
    ...DEFAULT_AUTH_DOWNLOAD_OPTIONS,
    ...globalOptions,
    ...localOptions,
    headers: {
      ...DEFAULT_AUTH_DOWNLOAD_OPTIONS.headers,
      ...globalOptions.headers,
      ...localOptions.headers,
    },
    request: mergeRequestOptions(globalOptions.request, localOptions.request),
    fetcher: localOptions.fetcher ?? globalOptions.fetcher ?? DEFAULT_FETCHER,
  };
}

export function mergeAuthHrefDirectiveOptions(
  globalOptions: Partial<AuthHrefDirectiveOptions> = {},
  localOptions: AuthHrefDirectiveValue = undefined,
): NormalizedAuthHrefDirectiveOptions {
  return {
    ...mergeAuthDownloadOptions(globalOptions, localOptions),
    loading: {
      ...DEFAULT_AUTH_HREF_LOADING_OPTIONS,
      ...globalOptions.loading,
      ...localOptions?.loading,
    },
  };
}

export function resolveMaybeGetter<T>(source: MaybeGetter<T> | undefined): T | undefined {
  if (typeof source === "function") {
    return (source as () => T)();
  }

  if (isRef(source)) {
    return source.value as T;
  }

  return source;
}

export function resolveToken(tokenSource: NormalizedAuthDownloadOptions["token"]): string {
  const value = resolveMaybeGetter(tokenSource);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AuthDownloadError(
      "vue-auth-href: you must provide a token via plugin options, directive options, or composable options.",
      {
        code: "missing_token",
      },
    );
  }

  return value;
}

export function formatAuthHeaderValue(authScheme: string, token: string): string {
  const normalizedScheme = authScheme.trim();
  return normalizedScheme.length > 0 ? `${normalizedScheme} ${token}` : token;
}

function mergeRequestOptions(
  globalRequest: AuthDownloadOptions["request"],
  localRequest: AuthDownloadOptions["request"],
): AuthDownloadOptions["request"] {
  if (!globalRequest && !localRequest) {
    return undefined;
  }

  return {
    ...globalRequest,
    ...localRequest,
  };
}
