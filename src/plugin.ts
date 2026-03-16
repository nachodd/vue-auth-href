import type { App, Plugin } from "vue";

import { createAuthHrefDirective } from "./directives/authHref";
import type { AuthHrefDirectiveOptions } from "./types";

export function createAuthHrefPlugin(options: Partial<AuthHrefDirectiveOptions> = {}): Plugin {
  return {
    install(app: App) {
      app.directive("auth-href", createAuthHrefDirective(options));
    },
  };
}

const VueAuthHref = {
  install(app: App, options: Partial<AuthHrefDirectiveOptions> = {}) {
    app.directive("auth-href", createAuthHrefDirective(options));
  },
} satisfies Plugin;

export default VueAuthHref;
