const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    userId : {
        type: String,
        required: true
    },
    paymentValue: {
        type: Number,
        required: true
    },
    paymentStates: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    pDate: {
        type: Date,
        required: true
    }
},{timestamps: true});

module.exports = mongoose.model('Payment', paymentSchema);