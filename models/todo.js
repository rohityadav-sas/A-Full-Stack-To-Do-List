const mongoose = require('mongoose');

const todoSchema = mongoose.Schema({
    todo: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('todo', todoSchema);