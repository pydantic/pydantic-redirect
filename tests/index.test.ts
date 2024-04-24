import { describe, expect, it, beforeAll, afterEach } from 'vitest'

import { fetchMock } from 'cloudflare:test'
import worker from '../src/index'

async function worker_request(path: string): Promise<Response> {
  const url = path.match(/^https?:\/\//) ? path : 'https://errors.pydantic.dev' + path
  const request = new Request(url, { redirect: 'manual' })
  return await worker.fetch(request, { GITHUB_SHA: 'unknown' })
}

describe('Worker', () => {
  beforeAll(() => {
    fetchMock.activate()
    fetchMock.disableNetConnect()
  })
  afterEach(() => fetchMock.assertNoPendingInterceptors())

  it('should 200 at root', async () => {
    const resp = await worker_request('/')
    const text = await resp.text()
    expect(resp.status).toMatchInlineSnapshot('200')
    expect(text).toMatchInlineSnapshot(
      '"Pydantic Redirect & Proxy, see https://github.com/pydantic/pydantic-redirect for more info. Release SHA unknown."'
    )
  })

  it('should 404 for unexpected variant', async () => {
    const resp = await worker_request('/2.0a3/z/decorator-missing-field')
    const text = await resp.text()
    expect(resp.status).toMatchInlineSnapshot('404')
    expect(text).toMatchInlineSnapshot('"Not Found"')
  })

  it('should redirect to usage docs with proper version', async () => {
    for (const version of ['2.0', '2.1', '2.2', '2.10', '2.12']) {
      const resp = await worker_request(`/${version}/u/decorator-missing-field`)
      const redirectUrl = resp.headers.get('Location')

      expect(resp.status).toMatchInlineSnapshot('307')
      expect(redirectUrl).toMatchInlineSnapshot(
        `"https://docs.pydantic.dev/${version}/usage/errors/#decorator-missing-field"`
      )
    }
  })

  it("should redirect to usage docs for 'dev' for unknown version", async () => {
    for (const version of ['3.0', 'unknown']) {
      const resp = await worker_request(`/${version}/u/decorator-missing-field`)
      const redirectUrl = resp.headers.get('Location')

      expect(resp.status).toMatchInlineSnapshot('307')
      expect(redirectUrl).toMatchInlineSnapshot(`"https://docs.pydantic.dev/dev/usage/errors/#decorator-missing-field"`)
    }
  })

  it('should redirect to validation docs', async () => {
    const resp = await worker_request('/2.0a3/v/decorator-missing-field')
    const redirectUrl = resp.headers.get('Location')

    expect(resp.status).toMatchInlineSnapshot('307')
    expect(redirectUrl).toMatchInlineSnapshot(
      '"https://docs.pydantic.dev/dev/usage/validation_errors/#decorator-missing-field"'
    )
  })

  it('should redirect to migration guide with no anchor', async () => {
    for (const url of ['/2.2/migration', '/2.2/migration/']) {
      const resp = await worker_request(url)
      const redirectUrl = resp.headers.get('Location')

      expect(resp.status).toMatchInlineSnapshot('307')
      expect(redirectUrl).toMatchInlineSnapshot('"https://docs.pydantic.dev/2.2/migration/"')
    }
  })

  it('should redirect to migration guide with a proper anchor', async () => {
    const resp = await worker_request('/2.2/migration/validator-and-root_validator-are-deprecated')
    const redirectUrl = resp.headers.get('Location')

    expect(resp.status).toMatchInlineSnapshot('307')
    expect(redirectUrl).toMatchInlineSnapshot(
      '"https://docs.pydantic.dev/2.2/migration/#validator-and-root_validator-are-deprecated"'
    )
  })

  it('should get download_count', async () => {
    fetchMock
      .get('https://static.pepy.tech')
      .intercept({ path: '/badge/pydantic/month' })
      .reply(200, '<text>123M</text>')
    const resp = await worker_request('/download-count.txt')
    expect(resp.status).toMatchInlineSnapshot('200')

    const text = await resp.text()
    expect(text).toMatchInlineSnapshot('"123M"')
  })

  it('should proxy /fastui/', async () => {
    fetchMock.get('https://fastui.pages.dev').intercept({ path: '/' }).reply(200, '<h1>testing</h1>')
    const resp = await worker_request('https://docs.pydantic.dev/fastui/')
    expect(resp.status).toMatchInlineSnapshot('200')

    const text = await resp.text()
    expect(text).toMatchInlineSnapshot('"<h1>testing</h1>"')
  })

  it('should proxy /fastui', async () => {
    fetchMock.get('https://fastui.pages.dev').intercept({ path: '/' }).reply(200, '<h1>testing</h1>')
    const resp = await worker_request('https://docs.pydantic.dev/fastui')
    expect(resp.status).toMatchInlineSnapshot('200')

    const text = await resp.text()
    expect(text).toMatchInlineSnapshot('"<h1>testing</h1>"')
  })

  it('should proxy /fastui/foo/', async () => {
    fetchMock.get('https://fastui.pages.dev').intercept({ path: '/foo/' }).reply(200, '<h1>foo</h1>')
    const resp = await worker_request('https://docs.pydantic.dev/fastui/foo/')
    expect(resp.status).toMatchInlineSnapshot('200')

    const text = await resp.text()
    expect(text).toMatchInlineSnapshot('"<h1>foo</h1>"')
  })
})
