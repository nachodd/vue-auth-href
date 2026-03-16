import type { Directive } from "vue";

import type { AuthHrefDirectiveValue } from "./types";

declare module "vue" {
  interface ComponentCustomProperties {
    vAuthHref: Directive<HTMLAnchorElement, AuthHrefDirectiveValue>;
  }
}

export {};
