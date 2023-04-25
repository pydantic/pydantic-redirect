export default {
  async fetch(
    request: Request
    // env: Env,
    // ctx: ExecutionContext
  ): Promise<Response> {
    // example URL https://errors.pydantic.dev/2.0/u/decorator-missing-field
    const { url } = request
    const { pathname } = new URL(url)
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
