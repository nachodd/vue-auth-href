import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";

import { createDeferred } from "../test/deferred";
import { useAuthDownload } from "./useAuthDownload";

describe("useAuthDownload", () => {
  it("downloads a protected resource and exposes loading status", async () => {
    const responseDeferred = createDeferred<Response>();
    const fetcher = vi.fn(() => responseDeferred.promise);
    const createObjectURL = vi.fn(() => "blob:download");
    const revokeObjectURL = vi.fn();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", {
      value: revokeObjectURL,
      configurable: true,
    });

    const { download, error, isDownloading, status } = useAuthDownload({
      token: ref("top-secret"),
      fetcher,
    });

    const downloadPromise = download({ url: "https://example.com/files/private.txt" });
    await Promise.resolve();

    expect(status.value).toBe("pending");
    expect(isDownloading.value).toBe(true);
    expect(fetcher).toHaveBeenCalledWith("https://example.com/files/private.txt", {
      method: "GET",
      headers: {
        Authorization: "Bearer top-secret",
      },
    });

    responseDeferred.resolve(
      new Response(new Blob(["secret"], { type: "text/plain" }), {
        status: 200,
        headers: {
          "Content-Disposition": 'attachment; filename="private.txt"',
        },
      }),
    );

    const result = await downloadPromise;

    expect(result.fileName).toBe("private.txt");
    expect(result.target).toBeNull();
    expect(status.value).toBe("success");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(isDownloading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it("stores the last error, exposes an error status, and can reset", async () => {
    const expectedError = new Error("network");
    const { download, error, reset, status } = useAuthDownload({
      token: "token",
      fetcher: vi.fn().mockRejectedValue(expectedError),
    });

    await expect(download({ url: "https://example.com/files/private.txt" })).rejects.toMatchObject({
      code: "request_failed",
      message: "network",
    });

    expect(status.value).toBe("error");
    expect(error.value?.code).toBe("request_failed");
    expect(error.value?.url).toBe("https://example.com/files/private.txt");

    reset();

    expect(status.value).toBe("idle");
    expect(error.value).toBeNull();
  });
});
