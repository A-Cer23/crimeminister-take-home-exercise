CREATE TABLE `daily_forecasts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`forecast_date` text NOT NULL,
	`max_temperature` real NOT NULL,
	`min_temperature` real NOT NULL,
	`precipitation_sum` real NOT NULL,
	`ingestion_run_id` text NOT NULL,
	`timestamp` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_forecasts_forecast_date_unique` ON `daily_forecasts` (`forecast_date`);