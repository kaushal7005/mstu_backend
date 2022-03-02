const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dailyEntrySchema = new Schema({
    userId : {
        type: String,
        required: true
    },
    isPaymentDone: {
        type: String,
        required: true
    },
    isEntryDone: {
        type: String,
        default: false,
        required: true
    },
    eDate: {
        type: String,
        required: true
    },
    couponCode: {
        type: String,
        required: true,
        default: '',
    }

},{timestamps: true});

module.exports = mongoose.model('dailyEnrty', dailyEntrySchema);