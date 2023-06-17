const { Schema, model } = require('mongoose');

const userSchema = new Schema({

    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        index:true
    },
    avatar: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    isActive: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Number,
        default: 0
    },
    times: {
        type: Number,
        default: 0
    },
    isBlocked: {
        type: Number,
        default: 0
    },
    isAdmin: {
        type: Number,
        default: 0
    },
    token: {
        type: String,
        default: ''
    }
}, { timestamps: true });


module.exports = model('User', userSchema);