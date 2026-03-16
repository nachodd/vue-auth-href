import type { Directive } from "vue";

import { downloadProtectedResource } from "../core/download";
import { mergeAuthHrefDirectiveOptions } from "../core/options";
import {
  AuthDownloadError,
  type AuthHrefDirectiveOptions,
  type AuthHrefDirectiveValue,
  type NormalizedAuthHrefDirectiveOptions,
} from "../types";

interface AnchorDirectiveState {
  options: AuthHrefDirectiveValue;
  handleClick: (event: MouseEvent) => void;
  isDownloading: boolean;
}

const DOWNLOADING_ATTRIBUTE = "data-auth-href-downloading";
const LEGACY_DOWNLOADING_ATTRIBUTE = "data-downloading";

export function createAuthHrefDirective(
  globalOptions: Partial<AuthHrefDirectiveOptions> = {},
): Directive<HTMLAnchorElement, AuthHrefDirectiveValue> {
  const elementState = new WeakMap<HTMLAnchorElement, AnchorDirectiveState>();

  return {
    mounted(element, binding) {
      assertAnchor(element);

      const state: AnchorDirectiveState = {
        options: binding.value,
        isDownloading: false,
        handleClick: (event) => {
          event.preventDefault();

          if (state.isDownloading || !element.href) {
            return;
          }

          const options = mergeAuthHrefDirectiveOptions(globalOptions, state.options);
          const restoreLoadingUi = setDownloadingUi(element, options);
          state.isDownloading = true;

          void downloadProtectedResource(
            {
              url: element.href,
              target: element.getAttribute("target"),
            },
            options,
          )
            .catch(() => undefined)
            .finally(() => {
              state.isDownloading = false;
              restoreLoadingUi();
            });
        },
      };

      elementState.set(element, state);
      element.addEventListener("click", state.handleClick);
    },
    updated(element, binding) {
      assertAnchor(element);
      const state = elementState.get(element);

      if (state) {
        state.options = binding.value;
      }
    },
    unmounted(element) {
      assertAnchor(element);
      const state = elementState.get(element);

      if (!state) {
        return;
      }

      element.removeEventListener("click", state.handleClick);
      elementState.delete(element);
    },
  };
}

export const vAuthHref = createAuthHrefDirective();

function assertAnchor(element: Element): asserts element is HTMLAnchorElement {
  if (!(element instanceof HTMLAnchorElement)) {
    throw new AuthDownloadError("vue-auth-href: v-auth-href can only be used on anchor elements.", {
      code: "invalid_element",
    });
  }
}

function setDownloadingUi(
  element: HTMLAnchorElement,
  options: NormalizedAuthHrefDirectiveOptions,
): () => void {
  element.setAttribute(DOWNLOADING_ATTRIBUTE, "true");
  element.setAttribute(LEGACY_DOWNLOADING_ATTRIBUTE, "true");
  element.setAttribute("aria-busy", "true");

  if (!options.loading.replaceContent) {
    return () => {
      clearDownloadingAttributes(element);
    };
  }

  const originalContent = element.innerHTML;
  element.innerHTML = options.loading.mode === "html" ? options.loading.html : options.loading.text;

  let intervalId: number | undefined;
  if (options.loading.mode === "text" && options.loading.animateDots) {
    intervalId = window.setInterval(() => {
      element.innerHTML += ".";
      if (element.innerHTML.length >= options.loading.text.length + 3) {
        element.innerHTML = options.loading.text;
      }
    }, 500);
  }

  return () => {
    if (intervalId !== undefined) {
      window.clearInterval(intervalId);
    }

    element.innerHTML = originalContent;
    clearDownloadingAttributes(element);
  };
}

function clearDownloadingAttributes(element: HTMLAnchorElement): void {
  element.removeAttribute(DOWNLOADING_ATTRIBUTE);
  element.removeAttribute(LEGACY_DOWNLOADING_ATTRIBUTE);
  element.removeAttribute("aria-busy");
}
