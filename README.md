# Statuspage.io Metrics
Ping a URL every 5 minutes and post it to statuspage metrics. 

## Setup
1) `npm i`
2) Add `.env` file:
```
API_KEY=<api key>
PAGE_ID=<page id>
METRIC_ID=<metric id>
PING_URL=<url to ping>
MONGO_URI=mongodb://localhost:27017
DB_METRIC_ID=<database metric id>
```

`MONGO_URI` and `DB_METRIC_ID` are optional and add support for pinging your mongodb database.

Demo: https://accord.statuspage.io