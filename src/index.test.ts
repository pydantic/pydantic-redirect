import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe('Worker', () => {
  let worker: UnstableDevWorker

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      ip: '127.0.0.1',
      experimental: { disableExperimentalWarning: true },
    })
  })

  afterAll(async () => {
    await worker.stop()
  })

  it('should 404 at root', async () => {
    const resp = await worker.fetch('/', { redirect: 'manual' })
    const text = await resp.text()
    expect(resp.status).toMatchInlineSnapshot('200')
    expect(text).toMatchInlineSnapshot(
      '"Pydantic Redirect & Proxy, see https://github.com/pydantic/pydantic-redirect for more info. Release SHA unknown."'
    )
  })

  it('should 404 for unexpected variant', async () => {
    const resp = await worker.fetch('/2.0a3/z/decorator-missing-field', {
      redirect: 'manual',
    })
    const text = await resp.text()
    expect(resp.status).toMatchInlineSnapshot('404')
    expect(text).toMatchInlineSnapshot('"Not Found"')
  })

  it('should redirect to usage docs with proper version', async () => {
    for (const version of ['2.0', '2.1', '2.2', '2.10', '2.12']) {
      const resp = await worker.fetch(`/${version}/u/decorator-missing-field`, {
        redirect: 'manual',
      })
      const redirectUrl = resp.headers.get('Location')

      expect(resp.status).toMatchInlineSnapshot('307')
      expect(redirectUrl).toMatchInlineSnapshot(
        `"https://docs.pydantic.dev/${version}/usage/errors/#decorator-missing-field"`
      )
    }
  })

  it("should redirect to usage docs for 'dev-v2' for unknown version", async () => {
    for (const version of ['3.0', 'unknown']) {
      const resp = await worker.fetch(`/${version}/u/decorator-missing-field`, {
        redirect: 'manual',
      })
      const redirectUrl = resp.headers.get('Location')

      expect(resp.status).toMatchInlineSnapshot('307')
      expect(redirectUrl).toMatchInlineSnapshot(
        `"https://docs.pydantic.dev/dev-v2/usage/errors/#decorator-missing-field"`
      )
    }
  })

  it('should redirect to validation docs', async () => {
    const resp = await worker.fetch('/2.0a3/v/decorator-missing-field', {
      redirect: 'manual',
    })
    const redirectUrl = resp.headers.get('Location')

    expect(resp.status).toMatchInlineSnapshot('307')
    expect(redirectUrl).toMatchInlineSnapshot(
      '"https://docs.pydantic.dev/dev-v2/usage/validation_errors/#decorator-missing-field"'
    )
  })

  it('should show message on /', async () => {
    const resp = await worker.fetch('/')
    const text = await resp.text()

    expect(resp.status).toMatchInlineSnapshot('200')
    expect(text).toMatchInlineSnapshot(
      '"Pydantic Redirect & Proxy, see https://github.com/pydantic/pydantic-redirect for more info. Release SHA unknown."'
    )
  })

  it('should redirect to migration guide with no anchor', async () => {
    for (const url of ['/2.2/migration', '/2.2/migration/']) {
      const resp = await worker.fetch(url, {
        redirect: 'manual',
      })
      const redirectUrl = resp.headers.get('Location')

      expect(resp.status).toMatchInlineSnapshot('307')
      expect(redirectUrl).toMatchInlineSnapshot('"https://docs.pydantic.dev/2.2/migration/"')
    }
  })

  it('should redirect to migration guide with a proper anchor', async () => {
    const resp = await worker.fetch('/2.2/migration/validator-and-root_validator-are-deprecated', {
      redirect: 'manual',
    })
    const redirectUrl = resp.headers.get('Location')

    expect(resp.status).toMatchInlineSnapshot('307')
    expect(redirectUrl).toMatchInlineSnapshot(
      '"https://docs.pydantic.dev/2.2/migration/#validator-and-root_validator-are-deprecated"'
    )
  })

  // it('should get download_count', async () => {
  //   const resp = await worker.fetch('/download-count.txt')
  //   expect(resp.status).toMatchInlineSnapshot('200')
  //
  //   const text = await resp.text()
  //   expect(text).includes('M')
  // })
})
