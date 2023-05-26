require('dotenv').config();

const online_log = require("online-log");
const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.FORWARDER_PORT;

// Parse incoming request bodies in a middleware before your handlers, available under the req.body property
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
online_log(app);
const {log} = online_log;

// Define the routing table based on client name
const routingTable = {
    "noob-server":  "http://central-server.com/api/v1/receive-data",
    "server-1":     "http://server1.com/api/v1/receive-data",
    "server-2":     "http://server2.com/api/v1/receive-data",
    "server-3":     "http://server3.com/api/v1/receive-data",
    "server-4":     "http://server4.com/api/v1/receive-data",
    "dev":          "http://127.0.0.1:8082/api/v1/receive-data"
};

app.post('/api/route-data', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress                                           // Get (client) IP
    let {toCtry, toBank} = req.body;                                                                                // Extract data from JSON body
    let color = "\x1b[31m";                                                                                         // Foreground red

    if (toCtry !== "UK") toBank = "noob-server";                                                                    // Check if we need international routing

    // Check if the specified name is in the routing table
    if (!routingTable[toBank]) {
        console.log(color + `Forbidden request from ${ip} requesting ${toBank}` + "\x1b[0m");                       // Log error in terminal
        log("ERROR", `<br> Forbidden request from ${ip} requesting ${toBank} <br> ${JSON.stringify(req.body)}`);    // Log an error, so we can see this on the log URL
        res.sendStatus(403);                                                                                   // Client name is not allowed to access this resource
        return;
    }

    // Specified name is in the routing table, now lets pass the data we got accordingly
    try {
        const response = await axios.post(routingTable[toBank], req.body);
        if (response.data === "OK") color = "\x1b[32m";                                                             // Make sure the response is OK
        console.log(color + ip + " -> " + routingTable[toBank] + "\x1b[0m");                                        // If OK log our request in the terminal
        log("INFO", `<br> OK for request ${toBank} from ${ip} <br> ${JSON.stringify(req.body)}`);                   // Log our request, so we can see this on the log URL
        res.sendStatus(200);                                                                                   // Give the client a signal that we finished and that eveything went well
    } catch (error) {
        console.error(error);                                                                                       // Log our error's details
        console.log(color + `Dropped request from  ${ip}` + "\x1b[0m");                                             // Log our request in the terminal
        log("ERROR", `<br> Dropped request from ${ip} <br> ${JSON.stringify(req.body)}`);                           // Log our request, so we can see this on the log URL
        res.sendStatus(500);                                                                                   // Give the client a signal that we finished and that we encountered an error
    }
});

app.all('/api/v1/test', async (req, res) => {
    const json = {
            "head": {
                "fromCtry": "value",
                "fromBank": "value",
                "toCtry": "value",
                "toBank": "value"
            },
            "body": {
                "pin": 1234
            }
    }

    res.status(200).json(json)
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});