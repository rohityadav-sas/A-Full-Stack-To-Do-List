const express = require('express');
const router = express.Router();
const User = require('../models/user');
const toDo = require('../models/todo');
const customError = require('../customError');
const asyncWrap = require('../asyncWrap');
const { validateSchema, validateSchema1 } = require('../validationSchema');
const tokenVerification = require('../tokenVerification');
const jwt = require('jsonwebtoken');
const handleDels = require('../handleDels');

router.route('/')
    .get((req, res) => {
        res.redirect('/home');
    })

router.route('/home')
    .get(handleDels, (req, res) => {
        const data = res.locals.returnedValues;
        console.log(data);
        res.render('home', { data });
    })

router.route('/login')
    .get(handleDels, (req, res) => {
        let data = res.locals.returnedValues;
        res.render('form', { exists: true, data: data });
    })
    .post(asyncWrap(async (req, res, next) => {
        let { username, password } = req.body;
        let user = await User.findOne({ username: username, password: password });
        if (!user) {
            throw new customError(404, "Account not found!");
        }
        let token = await user.generateToken();
        res.cookie("jwt", token, {
            httpOnly: true
        });
        res.redirect('/yourtodos');
    }))

router.route('/signup')
    .get(handleDels, (req, res) => {
        let data = res.locals.returnedValues;
        res.render('form', { exists: false, data: data });
    })
    .post(validateSchema, asyncWrap(async (req, res, next) => {
        let { username, password } = req.body;
        let user = new User({
            username: username,
            password: password
        });
        await user.save();
        let token = await user.generateToken();
        res.cookie("jwt", token, {
            httpOnly: true
        });
        res.redirect('/yourtodos');
    }))

router.route('/yourtodos')
    .get(tokenVerification, handleDels, async (req, res) => {
        let data = res.locals.returnedValues;
        let cookieToken = req.cookies.jwt;
        let verifyUser = await jwt.verify(cookieToken, process.env.PRIVATE_KEY);
        let user = await User.findOne({ _id: verifyUser._id });
        let datalist = [];
        let todolist = user.todo;
        todolist = todolist.map(e => e.toString());
        if (todolist.length) { datalist = await fetchData(todolist, datalist); }
        res.render('todo', { datalist, data: data });
    })
    .post(validateSchema1, asyncWrap(async (req, res, next) => {
        let { newtodo } = req.body;
        let data = new toDo({
            todo: newtodo
        });
        let savedData = await data.save();
        let cookieToken = req.cookies.jwt;
        let verifyUser = await jwt.verify(cookieToken, process.env.PRIVATE_KEY);
        let user = await User.findOne({ _id: verifyUser._id });
        user.todo.push(savedData);
        await user.save();
        res.redirect('/yourtodos');

    }))

router.route('/logout')
    .get(tokenVerification, asyncWrap(async (req, res, next) => {
        let cookieToken = req.cookies.jwt;
        let verifyUser = jwt.verify(cookieToken, process.env.PRIVATE_KEY);
        let user = await User.findOne({ _id: verifyUser._id });
        user.tokens = user.tokens.filter(e => cookieToken !== e.token);
        await user.save();
        res.clearCookie("jwt");
        res.redirect('/home');
    }))

router.route('/logoutothers')
    .get(tokenVerification, asyncWrap(async (req, res, next) => {
        let cookieToken = req.cookies.jwt;
        let verifyUser = jwt.verify(cookieToken, process.env.PRIVATE_KEY);
        let user = await User.findOne({ _id: verifyUser._id });
        user.tokens = user.tokens.filter(e => e.token === cookieToken);
        await user.save();
        res.send("logout from other devices successfully");
    }))
let fetchData = (todolist, datalist) => {
    return new Promise(async (resolve, reject) => {
        for (let i = 0; i < todolist.length; i++) {
            let todos = await toDo.findOne({ _id: todolist[i] });
            datalist.push(todos.todo);
            if (i === todolist.length - 1) { resolve(datalist) }
        }
    })
}

module.exports = router;
