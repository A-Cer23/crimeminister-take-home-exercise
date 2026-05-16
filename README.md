npm i
npx wrangler login


DB SETUP
npx wrangler d1 create ingestion-db --update-config=false
copy output and update the d1_databases key in wrangler.jsonc