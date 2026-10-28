export * as ConfigProxyPlugin from "./proxy.js"

import { define } from "@opencode/plugin/effect/plugin"
import { Effect } from "effect"
import { Config } from "../../config.js"
import { ProxyHttpClient } from "../../plugin/proxy.js"
import { ConfigEntryObserver } from "./entry-observer.js"

export const Plugin = define({
  id: "opencode.config.proxy",
  effect: Effect.fn(function* (ctx) {
    const config = yield* Config.Service
    const apply = config.entries().pipe(Effect.map((entries) => ProxyHttpClient.set(Config.latest(entries, "proxy"))))
    yield* ConfigEntryObserver.observe(config, ctx.event, apply)
    yield* apply
  }),
})
