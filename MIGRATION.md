# Migration to 2.0.0

## Breaking Changes

1. Vue 2 support is removed. `2.0.0` targets Vue 3 only.
2. The package is now ESM-only.
3. The runtime implementation uses `fetch` instead of `axios`.
4. `vue` is now a peer dependency instead of a bundled dependency.
5. The build and maintenance workflow moved from Vue CLI/Babel/ESLint/Prettier to Vite+, TypeScript, and Vitest.
6. The composable is now named `useAuthDownload()`.
7. Several legacy option names were replaced with a cleaner API.

## Plugin Registration

### Before

```js
import Vue from "vue";
import VueAuthHref from "vue-auth-href";

Vue.use(VueAuthHref, {
  token: () => store.getters["auth/token"],
});
```

### After

```ts
import { createApp } from "vue";
import App from "./App.vue";
import VueAuthHref from "vue-auth-href";

const app = createApp(App);

app.use(VueAuthHref, {
  token: () => store.getters["auth/token"],
});

app.mount("#app");
```

## New Composable

`2.0.0` adds `useAuthDownload()` for cases where a directive is too limiting.

```ts
import { useAuthDownload } from "vue-auth-href";

const { download, isDownloading, status } = useAuthDownload({
  token: () => store.getters["auth/token"],
});

await download({
  url: "/api/reports/monthly.csv",
});
```

## Renamed Options

| Before                   | After                    |
| ------------------------ | ------------------------ |
| `headerAuthKey`          | `authHeader`             |
| `headerAuthValuePrefix`  | `authScheme`             |
| `additionalHeaders`      | `headers`                |
| `requestInit`            | `request`                |
| `removeDelay`            | `cleanupDelay`           |
| `beforeDownloadCallback` | `onBeforeDownload`       |
| `onFinishCallback`       | `onSettled`              |
| `errorHandler`           | `onError`                |
| `downloadingText`        | `loading.text`           |
| `downloadingHtml`        | `loading.html`           |
| `textMode`               | `loading.mode`           |
| `dotsAnimation`          | `loading.animateDots`    |
| `overrideInnerHtml`      | `loading.replaceContent` |
| `suggestedFileName`      | `fileName`               |

## Notes

- The directive name remains `v-auth-href`.
- Raw HTML loading content still exists through `loading.html`, so only use it with trusted markup.
- Errors are now normalized as `AuthDownloadError` instances with stable codes such as `missing_token`, `http_error`, and `request_failed`.
