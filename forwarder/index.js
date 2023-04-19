const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

// Parse incoming request bodies in a middleware before your handlers, available under the req.body property
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Define the routing table based on client name
const routingTable = {
    "central-server": "http://central-server.com/receive-data",
    "server-1": "http://server1.com/receive-data",
    "server-2": "http://server2.com/receive-data",
    "server-3": "http://server3.com/receive-data",
    "server-4": "http://server4.com/receive-data",
    "dev": "http://127.0.0.1:3001/receive-data"
};

app.post('/route-data', async (req, res) => {
    const {name, data} = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    // Check if the client name is in the routing table
    let color = "\x1b[31m";
    if (routingTable[name]) {
        try {
            const response = await axios.post(routingTable[name], {data});
            if (response.data === "OK") color = "\x1b[32m";
            console.log(color + ip + " -> " + routingTable[name] + "\x1b[0m");
            res.sendStatus(200);
        } catch (error) {
            console.error(error);
            console.log(color + "Dropped request from " + ip + "\x1b[0m");
            res.sendStatus(500);
        }
    } else {
        console.log(color + "Forbidden request from " + ip + "\x1b[0m");
        res.sendStatus(403); // Client name is not allowed to access this resource
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});