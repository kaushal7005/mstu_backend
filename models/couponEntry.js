const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponEntrySchema = new Schema({
    couponName: {
        type: Number,
        required: true
    },
    sDate: {
        type: String,
        required: true
    },
    eDate: {
        type: String,
        required: true
    }

},{timestamps: true});

module.exports = mongoose.model('couponEntry', couponEntrySchema);