require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const asyncWrap = require('./asyncWrap');

module.exports = asyncWrap(async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        res.locals.returnedValues = ['Logout', 'yourtodo'];
        next()
    }
    const verifyUser = jwt.verify(token, process.env.PRIVATE_KEY);
    const user = await User.findOne({ _id: verifyUser._id });
    if (user) {
        res.locals.returnedValues = ['Login', 'Signup']
    } else { res.locals.returnedValues = ['Logout'] }
    next();
})