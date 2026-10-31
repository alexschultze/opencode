export * as ConfigWebProxyPlugin from "./webproxy.js"

import { define } from "@opencode/plugin/effect/plugin"
import { Effect } from "effect"
import { Config } from "../../config.js"
import { WebProxyHttpClient } from "../../plugin/webproxy.js"
import { ConfigEntryObserver } from "./entry-observer.js"

export const Plugin = define({
  id: "opencode.config.webproxy",
  effect: Effect.fn(function* (ctx) {
    const config = yield* Config.Service
    const apply = config.entries().pipe(
      Effect.flatMap((entries) => {
        const webproxy = Config.latest(entries, "webproxy")
        WebProxyHttpClient.set(webproxy)
        return Effect.logInfo("webproxy configuration applied", { webproxy: WebProxyHttpClient.describe(webproxy) })
      }),
    )
    yield* ConfigEntryObserver.observe(config, ctx.event, apply)
    yield* apply
  }),
})
