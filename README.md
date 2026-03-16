# vue-auth-href

> Breaking changes: `2.0.0` and later are not compatible with the previous `1.8.0` Vue 2 release. If you still need Vue 2 support, use version `1.8.0`.

Vue 3 directive and composable for downloading protected resources with authentication headers.

`vue-auth-href` intercepts an anchor click, performs an authenticated `GET`, converts the response to a blob, and triggers the browser download flow. In `2.0.0`, the library is rewritten for Vue 3, TypeScript, Vite+, and Vitest.

## Install

```bash
pnpm add vue-auth-href vue
```

## Plugin Usage

Register the plugin once and keep the token resolver in plugin options.

```ts
import { createApp } from "vue";
import App from "./App.vue";
import VueAuthHref from "vue-auth-href";

const app = createApp(App);

app.use(VueAuthHref, {
  token: () => localStorage.getItem("access_token"),
  headers: {
    "x-client": "dashboard",
  },
  loading: {
    text: "Downloading",
  },
});

app.mount("#app");
```

Then use the directive on any anchor:

```vue
<template>
  <a v-auth-href href="/api/reports/monthly.csv">Download report</a>
</template>
```

Inline directive options still override the plugin defaults:

```vue
<template>
  <a
    v-auth-href="{
      loading: {
        text: 'Preparing file',
        animateDots: false,
      },
    }"
    href="/api/reports/monthly.csv"
  >
    Download report
  </a>
</template>
```

## Composable Usage

Use the composable when you want full control over the trigger element or UI state.

```vue
<script setup lang="ts">
import { useAuthDownload } from "vue-auth-href";

const { download, error, isDownloading, status } = useAuthDownload({
  token: () => localStorage.getItem("access_token"),
});

async function downloadReport() {
  await download({
    url: "/api/reports/monthly.csv",
    fileName: "monthly.csv",
  });
}
</script>

<template>
  <button :disabled="isDownloading" type="button" @click="downloadReport">
    {{ isDownloading ? "Downloading..." : "Download report" }}
  </button>

  <p v-if="status === 'error' && error">Download failed: {{ error.message }}</p>
</template>
```

## API

### `AuthDownloadOptions`

Shared options used by the composable and directive:

| Option             | Type                                                                                | Default            | Description                                                                   |
| ------------------ | ----------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| `token`            | `string \| Ref<string \| null \| undefined> \| (() => string \| null \| undefined)` | -                  | Required unless provided by plugin or composable defaults.                    |
| `authHeader`       | `string`                                                                            | `"Authorization"`  | Header name used for the auth token.                                          |
| `authScheme`       | `string`                                                                            | `"Bearer"`         | Prepended to the token as `<scheme> <token>`. Use `""` to send the raw token. |
| `headers`          | `Record<string, string>`                                                            | `{}`               | Extra request headers.                                                        |
| `request`          | `Omit<RequestInit, "headers" \| "method">`                                          | `undefined`        | Extra fetch options such as `credentials`.                                    |
| `fetcher`          | `fetch`-compatible function                                                         | `globalThis.fetch` | Override for testing or custom transports.                                    |
| `fileName`         | `string \| ((response, url) => string \| undefined)`                                | `undefined`        | Preferred file name before falling back to response headers or the URL.       |
| `cleanupDelay`     | `number`                                                                            | `-1`               | Delay before removing the generated blob link.                                |
| `onBeforeDownload` | `() => void \| Promise<void>`                                                       | `undefined`        | Invoked before the request starts.                                            |
| `onSuccess`        | `(result) => void`                                                                  | `undefined`        | Invoked after a successful download.                                          |
| `onError`          | `(error) => void`                                                                   | `undefined`        | Invoked with an `AuthDownloadError`.                                          |
| `onSettled`        | `(outcome) => void`                                                                 | `undefined`        | Invoked after success or failure.                                             |

### `AuthHrefDirectiveOptions`

Directive options extend `AuthDownloadOptions` with a `loading` object:

| Option                   | Type               | Default         | Description                                             |
| ------------------------ | ------------------ | --------------- | ------------------------------------------------------- |
| `loading.mode`           | `"text" \| "html"` | `"text"`        | Controls whether loading content uses text or raw HTML. |
| `loading.text`           | `string`           | `"Downloading"` | Text shown while the request is in flight.              |
| `loading.html`           | `string`           | `""`            | HTML shown while the request is in flight.              |
| `loading.animateDots`    | `boolean`          | `true`          | Adds the dot animation when `loading.mode` is `"text"`. |
| `loading.replaceContent` | `boolean`          | `true`          | Replaces the anchor content while downloading.          |

### `useAuthDownload()`

The composable returns:

- `status`: `idle | pending | success | error`
- `isDownloading`: readonly boolean ref
- `error`: readonly `AuthDownloadError | null` ref
- `download(request, overrides?)`
- `reset()`

### Exports

```ts
import VueAuthHref, {
  AuthDownloadError,
  createAuthHrefDirective,
  createAuthHrefPlugin,
  useAuthDownload,
  vAuthHref,
} from "vue-auth-href";
```

## Development

```bash
pnpm install
pnpm run check
pnpm run test:run
pnpm run build
```

The project uses:

- `Vite+` for build, format, and toolchain orchestration
- `Vitest` and `@vue/test-utils` for unit tests
- `TypeScript` for the library source and public types

## Migration

`2.0.0` is a breaking release. See [MIGRATION.md](./MIGRATION.md) for the upgrade notes from the Vue 2 line.

## License

[MIT](./LICENSE)
