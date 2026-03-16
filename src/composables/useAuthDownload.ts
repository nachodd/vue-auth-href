import { readonly, ref } from "vue";

import { downloadProtectedResource } from "../core/download";
import { mergeAuthDownloadOptions } from "../core/options";
import { AuthDownloadError } from "../types";
import type {
  AuthDownloadOptions,
  DownloadRequest,
  DownloadResult,
  DownloadStatus,
  UseAuthDownloadReturn,
} from "../types";

export function useAuthDownload(
  defaultOptions: Partial<AuthDownloadOptions> = {},
): UseAuthDownloadReturn {
  const status = ref<DownloadStatus>("idle");
  const isDownloading = ref(false);
  const error = ref<AuthDownloadError | null>(null);

  async function download(
    request: DownloadRequest,
    overrides: Partial<AuthDownloadOptions> = {},
  ): Promise<DownloadResult> {
    if (isDownloading.value) {
      throw new AuthDownloadError(
        "vue-auth-href: a download is already in progress for this composable instance.",
        {
          code: "already_downloading",
          url: request.url,
        },
      );
    }

    isDownloading.value = true;
    status.value = "pending";
    error.value = null;

    try {
      const result = await downloadProtectedResource(
        request,
        mergeAuthDownloadOptions(defaultOptions, overrides),
      );
      status.value = "success";
      return result;
    } catch (caughtError) {
      error.value = caughtError as AuthDownloadError;
      status.value = "error";
      throw caughtError;
    } finally {
      isDownloading.value = false;
    }
  }

  function reset(): void {
    if (isDownloading.value) {
      return;
    }

    error.value = null;
    status.value = "idle";
  }

  return {
    status: readonly(status),
    isDownloading: readonly(isDownloading),
    error: readonly(error),
    download,
    reset,
  };
}
