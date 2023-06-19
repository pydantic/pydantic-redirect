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
    const { pathname } = new URL(url)

    if (pathname === "/") {
      return new Response(
        `Pydantic Errors Redirect, see https://github.com/pydantic/pydantic-errors-redirect for more info. Release SHA ${env.GITHUB_SHA}.`
      )
    }

    // The first item in the following split will be the version; currently unused.
    // The last item is an optional anchor on the target page
    const [, variant, theRest] = pathname.slice(1).split("/", 3)

    let segment: string
    switch (variant) {
      case "migration":
        segment = "migration"
        break
      case "u":
        segment = "usage/errors"
        break
      case "v":
        segment = "usage/validation_errors"
        break
      default:
        return new Response("Not Found", { status: 404 })
    }

    const anchor = theRest ? `#${theRest}` : ""
    const redirectUrl = `https://docs.pydantic.dev/dev-v2/${segment}/${anchor}`

    return Response.redirect(redirectUrl, 307)
  },
}
