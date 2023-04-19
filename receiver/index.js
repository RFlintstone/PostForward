const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/receive-data', (req, res) => {
    const { data } = req.body;
    console.log(`Received data: ${JSON.stringify(data)}`);
    res.sendStatus(200);
});

app.listen(3001, () => {
    console.log('Server listening on port 3001');
});
