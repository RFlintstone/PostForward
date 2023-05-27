require('dotenv').config();

const bodyParser = require('body-parser');
const online_log = require("online-log");
const express = require('express');

const app = express();
const port = process.env.RECEIVER_PORT;

app.use(bodyParser.json());
online_log(app);
const { log } = online_log;

app.post('/api/v1/receive-data', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress                                       // Get (client) IP
    const {head} = req.body;                                                                                    // Extract the data from our body

    try {
        console.log(`Received data: ${JSON.stringify(req.body)}`);
        if (head.toCtry !== "UK") {
            log("INFO", `<br> ACTING AS NOOB - OK - Received data from ${ip} <br> ${JSON.stringify(head)}`);                     // Log our request, so we can see this on the log URL
        } else {
            log("INFO", `<br> OK - Received data from ${ip} <br> ${JSON.stringify(head)}`);                     // Log our request, so we can see this on the log URL
        }
        res.sendStatus(200);                                                                               // Send a signal to the client that everything was successful
    } catch (error) {
        console.error(error);
        log("ERROR", `<br> Dropped request from ${ip} <br> ${JSON.stringify(head)}`);                       // Log our request, so we can see this on the log URL
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
