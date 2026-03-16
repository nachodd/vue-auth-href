import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: ["coverage/**", "dist/**"],
    semi: true,
    singleQuote: true,
    experimentalSortPackageJson: true,
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.ts"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/test/**", "src/index.ts", "src/plugin.ts"],
    },
  },
  pack: {
    entry: "./src/index.ts",
    dts: true,
    format: ["esm"],
    sourcemap: true,
    clean: true,
    fixedExtension: true,
    outDir: "dist",
    deps: {
      neverBundle: ["vue"],
    },
  },
});
