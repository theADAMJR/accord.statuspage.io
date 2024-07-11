const https = require('https');
const mysql = require('mysql2');

// Configuration
const apiKey = process.env.API_KEY;
const pageId = process.env.PAGE_ID;
const metricId = process.env.MYSQL_METRIC_ID;
const apiBase = 'https://api.statuspage.io/v1';

const url = `${apiBase}/pages/${pageId}/metrics/${metricId}/data.json`;
const authHeader = { 'Authorization': `OAuth ${apiKey}` };
const options = { method: 'POST', headers: authHeader };

// MySQL connection configuration
const connectionConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,  // Replace with your database name
};

// Function to measure MySQL server response time
function measureResponseTime(callback) {
    const start = new Date();
    const connection = mysql.createConnection(connectionConfig);

    connection.connect((err) => {
        if (err) {
            console.error('Connection to MySQL database failed');
            callback(err);
            return;
        }

        connection.query('SELECT 1', (error) => {
            connection.end();

            if (error) {
                callback(error);
                return;
            }

            const end = new Date();
            callback(null, end - start);
        });
    });
}

// Function to submit data point to Statuspage.io
function submitDataPoint(responseTime) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const data = {
        timestamp: currentTimestamp,
        value: responseTime
    };

    const request = https.request(url, options, (res) => {
        if (res.statusCode === 401) {
            console.error('Error: Unauthorized. Please ensure that your API key and page/metric IDs are correct.');
            process.exit(1);
        }

        res.on('data', () => {
            console.log(`[DB] Data point submitted successfully: ${responseTime}ms.`);
        });

        res.on('end', () => {
            setTimeout(getAndSubmitResponseTime, 5 * 60000); // Submit data every 5 minutes
        });

        res.on('error', (error) => {
            setTimeout(getAndSubmitResponseTime, 5 * 60000); // Submit data every 5 minutes
            console.error(`Error caught: ${error.message}`);
        });
    });

    request.end(JSON.stringify({ data }));
}

// Function to retrieve response time and submit data point
function getAndSubmitResponseTime() {
    measureResponseTime((error, responseTime) => {
        if (error) {
            console.error(`Error measuring response time: ${error.message}`);
        } else {
            submitDataPoint(responseTime);
        }
    });
}

// Initial call to start the process
getAndSubmitResponseTime();
console.log("Starting MySQL ping logs");
