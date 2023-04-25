// This may also be helpful: https://github.com/kriasoft/cloudflare-starter-kit

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
}

export default {
  async fetch(
    request: Request
    // env: Env,
    // ctx: ExecutionContext
  ): Promise<Response> {
    const { url } = request;
    const { pathname } = new URL(url);
    // the first item in the following split will be the version; currently unused
    const [, variant, theRest] = pathname.slice(1).split("/", 3);

    if (!["u", "v"].includes(variant) || !theRest) {
      return new Response("Not Found", { status: 404 });
    }

    const redirectVariant = variant === "u" ? "usage" : "validation";
    const redirectUrl = `https://docs.pydantic.dev/${redirectVariant}/errors/${theRest}`;

    return Response.redirect(redirectUrl, 307);
  },
};
