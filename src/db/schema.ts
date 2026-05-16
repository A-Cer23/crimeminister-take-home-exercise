import { sql } from "drizzle-orm";
import { integer, text, real, sqliteTable } from "drizzle-orm/sqlite-core";


export const dailyForecasts = sqliteTable("daily_forecasts", {
  id: integer().primaryKey({ autoIncrement: true }),
  forecast_date: text().unique().notNull(),
  max_temperature: real().notNull(),
  min_temperature: real().notNull(),
  precipitation_sum: real().notNull(),
  ingestion_run_id: text().notNull(),
  timestamp: text().notNull().default(sql`(datetime('now'))`),
});