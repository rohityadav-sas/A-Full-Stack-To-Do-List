require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const customError = require('./customError');
const router = require('./routes/index');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

mongoose.connect('mongodb://127.0.0.1:27017/todo').then(() => {
    console.log("Connected to DB");
})


app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


app.all('*', (req, res, next) => {
    next(new customError(404, 'Page Not Found!'));
})

app.use((err, req, res, next) => {
    if (err.code === 11000) {
        res.send("User Already Exists!")
    }
    else {
        let { status = 500, message = "Something went wrong!" } = err;
        res.status(status).send(message);
    }
})

app.listen(3000, () => {
    console.log(`Listening on port 3000`)
});