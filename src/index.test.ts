import { unstable_dev } from "wrangler"
import type { UnstableDevWorker } from "wrangler"
import { describe, expect, it, beforeAll, afterAll } from "vitest"

describe("Worker", () => {
  let worker: UnstableDevWorker

  beforeAll(async () => {
    worker = await unstable_dev("src/index.ts", {
      experimental: { disableExperimentalWarning: true },
    })
  })

  afterAll(async () => {
    await worker.stop()
  })

  it("should 404 at root", async () => {
    const resp = await worker.fetch("/", { redirect: "manual" })
    const text = await resp.text()
    expect(resp.status).toMatchInlineSnapshot("404")
    expect(text).toMatchInlineSnapshot('"Not Found"')
  })

  it("should 404 for unexpected variant", async () => {
    const resp = await worker.fetch("/v2.0a3/z/decorator-missing-field", {
      redirect: "manual",
    })
    const text = await resp.text()
    expect(resp.status).toMatchInlineSnapshot("404")
    expect(text).toMatchInlineSnapshot('"Not Found"')
  })

  it("should redirect to usage docs", async () => {
    const resp = await worker.fetch("/v2.0a3/u/decorator-missing-field", {
      redirect: "manual",
    })
    const redirectUrl = resp.headers.get("Location")

    expect(resp.status).toMatchInlineSnapshot("307")
    expect(redirectUrl).toMatchInlineSnapshot(
      '"https://docs.pydantic.dev/usage/errors/#decorator-missing-field"'
    )
  })

  it("should redirect to validation docs", async () => {
    const resp = await worker.fetch("/v2.0a3/v/decorator-missing-field", {
      redirect: "manual",
    })
    const redirectUrl = resp.headers.get("Location")

    expect(resp.status).toMatchInlineSnapshot("307")
    expect(redirectUrl).toMatchInlineSnapshot(
      '"https://docs.pydantic.dev/usage/validation_errors/#decorator-missing-field"'
    )
  })
})
