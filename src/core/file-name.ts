export function extractFileNameFromContentDisposition(
  contentDisposition: string | null,
): string | null {
  if (!contentDisposition) {
    return null;
  }

  const encodedMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    return decodeFileName(encodedMatch[1]);
  }

  const plainMatch = contentDisposition.match(/filename\s*=\s*"?(?<filename>[^";]+)"?/i);
  const fileName = plainMatch?.groups?.filename;
  return fileName ? decodeFileName(fileName) : null;
}

export function fileNameFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url, "http://localhost");
    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    return segments.at(-1) ?? "download";
  } catch {
    const withoutQuery = url.split("?")[0] ?? url;
    const segments = withoutQuery.split("/").filter(Boolean);
    return segments.at(-1) ?? "download";
  }
}

function decodeFileName(fileName: string): string {
  return decodeURIComponent(fileName.replace(/\+/g, "%20"));
}
