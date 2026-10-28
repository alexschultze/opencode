import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http"
import { WebProxyHttpClient } from "@opencode/core/plugin/webproxy"

describe("WebProxyHttpClient", () => {
  const seen = async () => {
    let init: RequestInit | undefined
    const fetch = (async (_input: RequestInfo | URL, next?: RequestInit) => {
      init = next
      return new Response("ok")
    }) as typeof globalThis.fetch
    await Effect.runPromise(
      HttpClient.HttpClient.pipe(
        Effect.flatMap((http) => WebProxyHttpClient.wrap(http).execute(HttpClientRequest.get("http://example.test"))),
        Effect.scoped,
        Effect.provide(FetchHttpClient.layer),
        Effect.provideService(FetchHttpClient.Fetch, fetch),
      ),
    )
    return init
  }

  test("passes the configured proxy to fetch", async () => {
    WebProxyHttpClient.set("http://proxy.test:8080")
    expect((await seen() as { proxy?: string }).proxy).toBe("http://proxy.test:8080")
  })

  test("leaves requests untouched without a proxy", async () => {
    WebProxyHttpClient.set(undefined)
    expect((await seen() as { proxy?: string }).proxy).toBeUndefined()
  })
})
