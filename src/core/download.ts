import { extractFileNameFromContentDisposition, fileNameFromUrl } from "./file-name";
import { formatAuthHeaderValue, resolveToken } from "./options";
import { AuthDownloadError, isAuthDownloadError } from "../types";
import type {
  DownloadOutcome,
  DownloadRequest,
  DownloadResult,
  NormalizedAuthDownloadOptions,
} from "../types";

export async function downloadProtectedResource(
  request: DownloadRequest,
  options: NormalizedAuthDownloadOptions,
): Promise<DownloadResult> {
  let outcome: DownloadOutcome | undefined;

  try {
    await options.onBeforeDownload?.();

    const token = resolveToken(options.token);
    const response = await options.fetcher(request.url, {
      ...options.request,
      method: "GET",
      headers: {
        ...options.headers,
        [options.authHeader]: formatAuthHeaderValue(options.authScheme, token),
      },
    });

    if (!response.ok) {
      throw new AuthDownloadError(
        `vue-auth-href: request failed with ${response.status} ${response.statusText || "Unknown Error"}.`,
        {
          code: "http_error",
          status: response.status,
          url: request.url,
        },
      );
    }

    const blob = await response.blob();
    const fileName =
      request.fileName ??
      resolveConfiguredFileName(options.fileName, response, request.url) ??
      extractFileNameFromContentDisposition(response.headers.get("Content-Disposition")) ??
      fileNameFromUrl(request.url);

    triggerBrowserDownload({
      blob,
      fileName,
      cleanupDelay: options.cleanupDelay,
      target: request.target ?? null,
    });

    const result: DownloadResult = {
      url: request.url,
      fileName,
      blob,
      target: request.target ?? null,
    };

    options.onSuccess?.(result);

    outcome = {
      ok: true,
      result,
    };

    return result;
  } catch (error) {
    const authDownloadError = normalizeAuthDownloadError(error, request.url);

    options.onError?.(authDownloadError);

    outcome = {
      ok: false,
      url: request.url,
      error: authDownloadError,
    };

    throw authDownloadError;
  } finally {
    if (outcome) {
      options.onSettled?.(outcome);
    }
  }
}

interface BrowserDownloadOptions {
  blob: Blob;
  fileName: string;
  cleanupDelay: number;
  target: string | null;
}

function triggerBrowserDownload({
  blob,
  fileName,
  cleanupDelay,
  target,
}: BrowserDownloadOptions): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    throw new AuthDownloadError(
      "vue-auth-href: downloads can only be triggered in a browser environment.",
      {
        code: "browser_only",
      },
    );
  }

  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;

  if (target) {
    link.target = target;
  } else {
    link.download = fileName;
  }

  document.body.append(link);
  link.click();

  const cleanup = () => {
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  if (cleanupDelay >= 0) {
    window.setTimeout(cleanup, cleanupDelay);
    return;
  }

  cleanup();
}

function resolveConfiguredFileName(
  configuredFileName: NormalizedAuthDownloadOptions["fileName"],
  response: Response,
  url: string,
): string | undefined {
  return typeof configuredFileName === "function"
    ? configuredFileName(response, url)
    : configuredFileName;
}

function normalizeAuthDownloadError(error: unknown, url: string): AuthDownloadError {
  if (isAuthDownloadError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AuthDownloadError(error.message, {
      code: "request_failed",
      url,
      cause: error,
    });
  }

  return new AuthDownloadError("vue-auth-href: download failed.", {
    code: "request_failed",
    url,
    cause: error,
  });
}
