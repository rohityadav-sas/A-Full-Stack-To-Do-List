require('dotenv').config();
const mongoose = require('mongoose');
const toDo = require('./todo');
const jwt = require('jsonwebtoken');
const asyncWrap = require('../asyncWrap');
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    todo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'todo'
    }],
    tokens: [{
        token: {
            _id: false,
            type: String,
            required: true
        }
    }]
});

userSchema.post('findOneAndDelete', async (data) => {
    console.log(data.todo);
    if (data.todo.length) {
        await toDo.deleteMany({ _id: { $in: data.todo } })
    }
})

userSchema.methods.generateToken = async function () {
    try {
        let token = await jwt.sign({ _id: this._id.toString() }, process.env.PRIVATE_KEY);
        this.tokens.push({ token: token });
        await this.save();
        return token;
    }
    catch (err) {
        throw new Error(err);
    }
};

module.exports = mongoose.model('User', userSchema);