export * as WebProxyHttpClient from "./webproxy.js"

import { Effect, Option } from "effect"
import { FetchHttpClient, HttpClient } from "effect/http"

// Web-only (webfetch + websearch). Process-wide because webfetch and every websearch provider share one HttpClient;
// the config plugin keeps it current.
let current: string | undefined

export const set = (url: string | undefined) => {
  current = url
}

/** The proxy URL with any credentials removed, safe to log. */
export const describe = (url: string | undefined) => {
  if (!url) return "none"
  if (!URL.canParse(url)) return "invalid"
  const parsed = new URL(url)
  parsed.username = ""
  parsed.password = ""
  return parsed.origin
}

/** Routes requests through the configured `webproxy` URL; without one the runtime's HTTP_PROXY/HTTPS_PROXY handling applies. */
export const wrap = (http: HttpClient.HttpClient) =>
  HttpClient.transform(http, (effect, request) =>
    Effect.suspend(() => {
      const proxy = current
      if (!proxy)
        return Effect.logDebug("web request without webproxy", { url: request.url }).pipe(Effect.andThen(effect))
      return Effect.logDebug("web request via webproxy", { url: request.url, webproxy: describe(proxy) }).pipe(
        Effect.andThen(Effect.serviceOption(FetchHttpClient.RequestInit)),
        Effect.flatMap((init) =>
          Effect.provideService(effect, FetchHttpClient.RequestInit, {
            ...Option.getOrUndefined(init),
            proxy,
          } as BunFetchRequestInit),
        ),
      )
    }),
  )
