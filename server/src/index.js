const express = require('express');
const consign = require('consign');

const db = require('./config/db');

const port = 3333;
const app = express();

consign()
    .include('./src/config/passport.js')
    .then('./src/config/middlewares.js')
    .then('./src/api')
    .then('./src/config/routes.js')
    .into(app);

app.db = db;

app.listen(port, () => {
    console.log(`Backend is running in http://localhost:${port}`);
});
