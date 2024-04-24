const versionRegex = /^2\.\d+$/

export interface Env {
  GITHUB_SHA: string
}

export default {
  async fetch(
    request: Request,
    env: Env
    // ctx: ExecutionContext
  ): Promise<Response> {
    // example URL https://errors.pydantic.dev/2.0/u/decorator-missing-field
    const { url } = request
    const { hostname, pathname, search } = new URL(url)

    switch (hostname) {
      case 'errors.pydantic.dev':
        return errors_pydantic_dev(pathname, env)
      case 'docs.pydantic.dev':
        return docs_pydantic_dev(pathname, search)
      default:
        return new Response(`Not Found - unexpected hostname '${hostname}', url='${url}'`, {
          status: 404,
        })
    }
  },
}

// for requests to errors.pydantic.dev
async function errors_pydantic_dev(pathname: string, env: Env): Promise<Response> {
  if (pathname === '/') {
    return new Response(
      `Pydantic Redirect & Proxy, see https://github.com/pydantic/pydantic-redirect for more info. Release SHA ${env.GITHUB_SHA}.`
    )
  } else if (pathname == '/download-count.txt') {
    const r = await fetch('https://static.pepy.tech/badge/pydantic/month')
    const text = await r.text()
    const m = text.match(/>(\d+[a-zA-Z])<\/text>/)
    if (m) {
      return new Response(m[1], {
        headers: {
          'content-type': 'text/plain',
          // "access-control-allow-origin": "https://docs.pydantic.dev",
          // allowing any domain allows local development and previews to work
          'access-control-allow-origin': '*',
        },
      })
    } else {
      return new Response('Unable to find download count', { status: 504 })
    }
  } else {
    // The first item in the following split will be the version; currently unused.
    // The last item is an optional anchor on the target page
    const [version, variant, theRest] = pathname.slice(1).split('/', 3)

    const versionSegment = versionRegex.test(version) ? version : 'dev-v2'

    let variantSegment: string
    switch (variant) {
      case 'migration':
        variantSegment = 'migration'
        break
      case 'u':
        variantSegment = 'usage/errors'
        break
      case 'v':
        variantSegment = 'usage/validation_errors'
        break
      default:
        return new Response('Not Found', { status: 404 })
    }

    const anchor = theRest ? `#${theRest}` : ''
    const redirectUrl = `https://docs.pydantic.dev/${versionSegment}/${variantSegment}/${anchor}`

    return Response.redirect(redirectUrl, 307)
  }
}

const PROXY_URLS: Record<string, string> = {
  fastui: 'https://scolvin.com',
}

// for requests to docs.pydantic.dev
async function docs_pydantic_dev(pathname: string, search: string): Promise<Response> {
  const [root_dir] = pathname.slice(1).split('/', 1)
  const proxy_url = PROXY_URLS[root_dir]
  if (proxy_url) {
    return fetch(proxy_url + pathname.substring(root_dir.length + 1) + search)
  } else {
    return new Response('Not Found', { status: 404 })
  }
}
