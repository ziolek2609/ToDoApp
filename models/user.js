const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 30
    },
    tasks: {
        type: Array,
        "deafult": []
    }
})


module.exports = mongoose.model('User', userSchema);
