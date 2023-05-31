import * as https from "https";
import fs from "fs";

import express from "express";

const app = express();



const opts = {
    key: fs.readFileSync("cert/country_key.pem"),
    cert: fs.readFileSync("cert/out.pem"),
    requestCert: true,
    rejectUnauthorized: false,
    ca: [fs.readFileSync("cert/noob-root.pem"),
        fs.readFileSync("cert/noob-ca.pem")]
}


const server = https.createServer(opts, app);

app.post('/balance', async (req, res) => {
	console.log(req.body);
});

app.get('/boe', async (_, res) => {
const req = https.request({
    cert: opts.cert,
    key: opts.key,
    ca: opts.ca,
    rejectUnauthorized: opts.rejectUnauthorized,
    method: "POST",
    path: "/api/balance",
    host: "145.24.222.82",
    headers: {
        "Content-Type": "application/json"
    },
    port: 8443
}, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        res.send(data);
    });
})

req.on('error', (error) => {
    console.error(error);
});


const json = {
	"head": {
		"fromCtry": "UK",
		"fromBank": "exit",
		"toCtry": "DE",
		"toBank": "GUGB" 
	},
	"body": {    
		"accNo": "String",
		"pin": 1234    
	}
};

req.write(JSON.stringify(json));

req.end();
});

app.get("/", (req,res) =>{
	res.send("test");
})

server.listen(8443, () => {
    console.log(`Server started on port ${8443}`);
});

// app.listen(8443, )