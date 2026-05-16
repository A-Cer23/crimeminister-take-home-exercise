import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
import type { WorkflowEvent } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { dailyForecasts } from "./db/schema";


type WeatherResponse = { daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
}}

export class IngestionWorkflow extends WorkflowEntrypoint<Env> {
    async run(event: WorkflowEvent<any>, step: WorkflowStep) {

        const weatherApi = "https://api.open-meteo.com/v1/forecast?latitude=43.6532&longitude=-79.3832&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America/Toronto"
        const data = await step.do("fetch data", async () => {
            const response = await fetch(weatherApi);
            if (!response.ok) {
                throw new Error(`Weather API returned ${response.status}: ${await response.text()}`);
            }
            return await response.json<WeatherResponse>();
        });

        await step.do("store to d1", async () => {
            const db = drizzle(this.env.ingestion_db);
            const rows = data.daily.time.map((date, idx) => ({
                forecast_date: date,
                max_temperature: data.daily.temperature_2m_max[idx],
                min_temperature: data.daily.temperature_2m_min[idx],
                precipitation_sum: data.daily.precipitation_sum[idx],
                ingestion_run_id: event.instanceId,
            }));
            await db.insert(dailyForecasts).values(rows).onConflictDoNothing();
        });
    }
}