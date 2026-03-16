import { describe, expect, it } from "vitest";

import { extractFileNameFromContentDisposition, fileNameFromUrl } from "./file-name";

describe("file-name helpers", () => {
  it("extracts an RFC5987 encoded filename", () => {
    expect(
      extractFileNameFromContentDisposition(
        "attachment; filename*=UTF-8''report%20march%202026.pdf",
      ),
    ).toBe("report march 2026.pdf");
  });

  it("extracts a quoted filename", () => {
    expect(extractFileNameFromContentDisposition('attachment; filename="archive.zip"')).toBe(
      "archive.zip",
    );
  });

  it("falls back to the final URL segment", () => {
    expect(fileNameFromUrl("https://example.com/files/report.csv?download=true")).toBe(
      "report.csv",
    );
  });
});
