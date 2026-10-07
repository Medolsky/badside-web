Config = {}

-- URL of the dashboard ingest endpoint
Config.Endpoint = 'http://127.0.0.1:3001/api/fivem/ingest'

-- Must match FIVEM_API_SECRET in the dashboard .env
Config.ApiKey = 'badside_soc_secret_token_99x'

-- Seconds between heartbeat batches (5–10 recommended)
Config.HeartbeatInterval = 5

-- Seconds between client area/vehicle reports
Config.ClientReportInterval = 10

Config.Debug = false
