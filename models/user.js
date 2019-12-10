const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    }
})


module.exports = mongoose.model('User', userSchema);