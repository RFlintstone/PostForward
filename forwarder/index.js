require('dotenv').config();

const online_log = require("online-log");
const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

//Create our Express instance
const app = express();
const port = process.env.FORWARDER_PORT;

// Specify the paths to the existing SSL certificate and key files
const options = {
  key: fs.readFileSync('./cert/country_key.pem'),
  cert: fs.readFileSync('./cert/out.pem'),
  ca: [fs.readFileSync('./cert/noob-root.pem'), fs.readFileSync('./cert/noob-ca.pem')],
  requestCert: true,
  rejectUnauthorized: false
};

const axi = axios.create({
  httpsAgent: new https.Agent({...options})
});

// Parse incoming request bodies in a middleware before your handlers, available under the req.body property
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Create our log server instance
online_log(app);
const {log} = online_log;

// Define the routing table based on client name
const routingTable = {
    "noob-server":  "https://145.24.222.82:8443/api/balance",
    "exit":         "http://31.151.46.128:8081",
    "server-2":     "http://server2.com/api/v1/receive-data",
    "server-3":     "http://server3.com/api/v1/receive-data",
    "server-4":     "http://server4.com/api/v1/receive-data",
    "dev":          "http://127.0.0.1:8082/api/v1/receive-data"
};

app.post('/api/balance', async (req, res) => {
    console.log(req.body);
    res.send({"accNo":"1234"});
    //const data = req.body;
    //
    //try {
    //  const response = await axiosInstance.post('https://145.24.222.82:8443/api/balance', data)
    //  res.send(response.data);
    //} catch(error) {
    //  console.error(error);
    //  res.send('Ballance request not succesfull ' + error);
    //}
})

app.get('/register', async (req, res) => {
    try {
      const response = await axi.get('https://145.24.222.82:8443/api/register', { httpsAgent: agent });
      console.log(response.data);
      res.send(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving data');
    }
})

app.get('/peer-certificate', (req, res) => {
  const peerCertificate = req.socket.getPeerCertificate();
  if (peerCertificate) {
    res.json(peerCertificate);
  } else {
    res.status(404).send('Peer certificate not available');
  }
});

app.post('/api/v1/route-data', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress                                                                   // Get (client) IP
    const {head, body} = req.body;                                                                                                          // Extract head and body from JSON body
    let { toCtry, toBank } = head;                                                                                                          // Get data from our head
    let color = "\x1b[31m";                                                                                                                 // Set text colour to red

    // Check if we need international routing based on passed head
    if (toCtry !== "UK") {
        console.log(color + `Request to ${toBank} seems to be international (${toCtry}) - Setting route to noob server` + "\x1b[0m")        // Log that we need international routing
        log("INFO", `<br> Request to ${toBank} seems to be international (${toCtry}) - Setting route to noob server`);                      // Do the same on the log server
        toBank = "noob-server";                                                                                                             // Set the new target to the noob server
    }

    // Check if the specified name is in the routing table
    if (!routingTable[toBank]) {
        console.log(color + `Forbidden request from ${ip} requesting ${toBank}` + "\x1b[0m");                                               // Log error in terminal
        log("ERROR", `<br> Forbidden request from ${ip} requesting ${toBank} <br> ${JSON.stringify(head)}`);                                // Log an error, so we can see this on the log URL
        res.sendStatus(403);                                                                                                           // Client name is not allowed to access this resource
        return;
    }

    // Specified name is in the routing table, now lets pass the data we got accordingly
    try {
        const response = await axi.post(routingTable[toBank],req.body, {
          headers: {
            "Content-Type": "application/json"
          }
        })                                                 // Forward body using POST
        const data = JSON.stringify(req.body);
        console.log(data);

        console.log(response.data);

        if (response.data !== "OK") {                                                                                                       // Make sure the response we got back is OK
            res.sendStatus(500);                                                                                                        // Send 500 code if the request is not OK
            return;                                                                                                                         // And stop code
        }

        color = "\x1b[32m";                                                                                                                 // Colour our log green as the request was successful
        console.log(color + ip + " -> " + routingTable[toBank] + "\x1b[0m");                                                                // Log our request in the terminal
        log("INFO", `<br> OK for request ${toBank} from ${ip} <br> ${JSON.stringify(head)}`);                                               // Log our request, so we can see this on the log URL

        res.sendStatus(200);                                                                                                           // Give the client a signal that we finished and that eveything went well
    } catch (error) {
        console.error(error);                                                                                                               // Log our error's details
        console.log(color + `Dropped request from  ${ip}` + "\x1b[0m");                                                                     // Log our request in the terminal
        log("ERROR", `<br> Dropped request from ${ip} <br> ${JSON.stringify(head)}`);                                                       // Log our request, so we can see this on the log URL
        res.sendStatus(500);                                                                                                           // Give the client a signal that we finished and that we encountered an error
    }
});

// Test route so one can check what the body is
app.all('/api/v1/expected', async (req, res) => {
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

const server = https.createServer(options, app);

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
