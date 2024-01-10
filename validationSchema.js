const Joi = require('joi');
const customError = require('./customError');

const joiSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).required()
})

const joiSchema1 = Joi.object({
    newtodo: Joi.string().required()
})

const validateSchema1 = (req, res, next) => {
    const { error } = joiSchema1.validate(req.body);
    if (error) {
        throw new customError(400, error.message);
    }
    else {
        next();
    }
}
const validateSchema = (req, res, next) => {
    const { error } = joiSchema.validate(req.body);
    if (error) {
        throw new customError(400, error.message);
    }
    else {
        next();
    }
}

module.exports = { joiSchema: joiSchema, validateSchema: validateSchema, joiSchema1: joiSchema1, validateSchema1: validateSchema1 };