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

    // the first item in the following split will be the version; currently unused
    const [, variant, theRest] = pathname.slice(1).split("/", 3)

    if (!["u", "v"].includes(variant) || !theRest) {
      return new Response("Not Found", { status: 404 })
    }

    const errorVariant = variant === "u" ? "errors" : "validation_errors"
    const redirectUrl = `https://docs.pydantic.dev/usage/${errorVariant}/#${theRest}`

    return Response.redirect(redirectUrl, 307)
  },
}
