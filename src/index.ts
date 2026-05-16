export { IngestionWorkflow } from "./workflow";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/ingest") {
      return new Response("Not Found", { status: 404 });
    }

    const instance = await env.INGESTION_WORKFLOW.create();
    return Response.json({ instanceId: instance.id });
  },
} satisfies ExportedHandler<Env>;