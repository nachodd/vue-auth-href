import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";

import { createDeferred } from "../test/deferred";
import { createAuthHrefDirective } from "./authHref";

describe("v-auth-href", () => {
  it("updates loading UI, prevents duplicate clicks, and restores content", async () => {
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

    const wrapper = mount(
      defineComponent({
        template:
          '<a v-auth-href="{ loading: { text: \'Fetching\' } }" href="https://example.com/report.pdf">Download</a>',
      }),
      {
        global: {
          directives: {
            "auth-href": createAuthHrefDirective({
              token: () => "secret",
              fetcher,
            }),
          },
        },
      },
    );

    const anchor = wrapper.get("a");
    await anchor.trigger("click");
    await nextTick();

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(anchor.text()).toBe("Fetching");
    expect(anchor.attributes("data-auth-href-downloading")).toBe("true");
    expect(anchor.attributes("data-downloading")).toBe("true");

    await anchor.trigger("click");
    expect(fetcher).toHaveBeenCalledTimes(1);

    responseDeferred.resolve(
      new Response(new Blob(["ok"], { type: "application/pdf" }), {
        status: 200,
        headers: {
          "Content-Disposition": 'attachment; filename="report.pdf"',
        },
      }),
    );

    await flushPromises();

    expect(anchor.text()).toBe("Download");
    expect(anchor.attributes("data-auth-href-downloading")).toBeUndefined();
    expect(anchor.attributes("data-downloading")).toBeUndefined();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it("updates directive options without re-registering the listener", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(new Blob(["ok"], { type: "text/plain" }), {
        status: 200,
      }),
    );
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: vi.fn(() => "blob:download"),
      configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", {
      value: vi.fn(),
      configurable: true,
    });

    const wrapper = mount(
      defineComponent({
        data() {
          return {
            options: {
              loading: {
                text: "Downloading",
              },
            },
          };
        },
        template: '<a v-auth-href="options" href="https://example.com/report.txt">Report</a>',
      }),
      {
        global: {
          directives: {
            "auth-href": createAuthHrefDirective({
              token: "secret",
              fetcher,
            }),
          },
        },
      },
    );

    const addEventListenerSpy = vi.spyOn(wrapper.get("a").element, "addEventListener");

    wrapper.vm.options = {
      loading: {
        text: "Working",
      },
    };
    await nextTick();

    expect(addEventListenerSpy).not.toHaveBeenCalled();

    await wrapper.get("a").trigger("click");
    await flushPromises();

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
