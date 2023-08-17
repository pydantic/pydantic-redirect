export interface Env {
  GITHUB_SHA: string
  DOCS_VERSIONS: string
}

export default {
  async fetch(
    request: Request,
    env: Env
    // ctx: ExecutionContext
  ): Promise<Response> {
    // example URL https://errors.pydantic.dev/2.0/u/decorator-missing-field
    const { url } = request
    const { pathname } = new URL(url)
    const docsVersions = env.DOCS_VERSIONS.split(",").map((v) => v.trim())

    if (pathname === "/") {
      return new Response(
        `Pydantic Errors Redirect, see https://github.com/pydantic/pydantic-errors-redirect for more info. Release SHA ${env.GITHUB_SHA}.`
      )
    } else if (pathname == "/download-count.txt") {
      return await download_count()
    }

    // The first item in the following split will be the version; currently unused.
    // The last item is an optional anchor on the target page
    const [version, variant, theRest] = pathname.slice(1).split("/", 3)

    const versionSegment = docsVersions.includes(version) ? version : "dev-v2"

    let variantSegment: string
    switch (variant) {
      case "migration":
        variantSegment = "migration"
        break
      case "u":
        variantSegment = "usage/errors"
        break
      case "v":
        variantSegment = "usage/validation_errors"
        break
      default:
        return new Response("Not Found", { status: 404 })
    }

    const anchor = theRest ? `#${theRest}` : ""
    const redirectUrl = `https://docs.pydantic.dev/${versionSegment}/${variantSegment}/${anchor}`

    return Response.redirect(redirectUrl, 307)
  },
}

async function download_count(): Promise<Response> {
  const r = await fetch("https://static.pepy.tech/badge/pydantic/month")
  const text = await r.text()
  const m = text.match(/>(\d+[a-zA-Z])<\/text>/)
  if (m) {
    return new Response(m[1], {
      headers: {
        "content-type": "text/plain",
        // "access-control-allow-origin": "https://docs.pydantic.dev",
        // allowing any domain allows local development and previews to work
        "access-control-allow-origin": "*",
      },
    })
  } else {
    return new Response("Unable to find download count", { status: 504 })
  }
}
