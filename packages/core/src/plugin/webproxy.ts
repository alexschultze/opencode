export * as WebProxyHttpClient from "./webproxy.js"

import { Effect, Option } from "effect"
import { FetchHttpClient, HttpClient } from "effect/http"

// Web-only (webfetch + websearch). Process-wide because webfetch and every websearch provider share one HttpClient; the config plugin keeps it current.
let current: string | undefined

export const set = (url: string | undefined) => {
  current = url
}

/** Routes requests through the configured `webproxy` URL; without one the runtime's HTTP_PROXY/HTTPS_PROXY handling applies. */
export const wrap = (http: HttpClient.HttpClient) =>
  HttpClient.transformResponse(http, (effect) =>
    Effect.suspend(() => {
      const proxy = current
      if (!proxy) return effect
      return Effect.serviceOption(FetchHttpClient.RequestInit).pipe(
        Effect.flatMap((init) =>
          Effect.provideService(effect, FetchHttpClient.RequestInit, {
            ...Option.getOrUndefined(init),
            proxy,
          } as BunFetchRequestInit),
        ),
      )
    }),
  )
