export { IngestionWorkflow } from "./workflow";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const instanceId = url.searchParams.get("instanceId");

    if (instanceId) {
      const instance = await env.INGESTION_WORKFLOW.get(instanceId);
      return Response.json(await instance.status());
    }

    const instance = await env.INGESTION_WORKFLOW.create();
    return Response.json({ instanceId: instance.id });
  },
} satisfies ExportedHandler<Env>;