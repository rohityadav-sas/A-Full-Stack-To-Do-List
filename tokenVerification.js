const jwt = require('jsonwebtoken');
const asyncWrap = require('./asyncWrap');
const User = require('./models/user');
const customError = require('./customError');

const tokenVerification = asyncWrap(async (req, res, next) => {
    let cookieToken = req.cookies.jwt;
    let verifyUser = jwt.verify(cookieToken, process.env.PRIVATE_KEY);
    let user = await User.findOne({ _id: verifyUser._id });
    if (!user) {
        throw new customError(404, "User doesn't exist")
    }
    let foundToken = user.tokens.filter(e => e.token === cookieToken);
    if (!foundToken.length) {
        throw new customError(401, "Unauthorized");
    }
    next();
})

module.exports = tokenVerification;