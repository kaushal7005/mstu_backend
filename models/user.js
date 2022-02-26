const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bankSchema = new Schema({
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    ifsccode: {
        type: String,
        required: true
    },
    accountHolderName: {
        type: String,
        required: true
    }
});

const userSchema = new Schema({
    userId : {
        type: String,
        required: true,
        unique: true,
    },
    pass : {
        type: String,
        required: true
    },
    email  : {
        type: String,
        required: false
    },
    phoneNo : {
        type: String,
        
    },
    isFirst  : {
        type: String,
        required: true,
        default: true
    },
    nCaptcha: {
        type: Number,
        required: true,
        default: 0
    },
    planName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    nomineeName: {
        type: String,
        required: true
    },
    bank: {
        type : Object,
        default: [bankSchema]
    }

},{timestamps: true});

module.exports = mongoose.model('User', userSchema);