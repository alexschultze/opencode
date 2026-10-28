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
    const apply = config.entries().pipe(Effect.map((entries) => WebProxyHttpClient.set(Config.latest(entries, "webproxy"))))
    yield* ConfigEntryObserver.observe(config, ctx.event, apply)
    yield* apply
  }),
})
