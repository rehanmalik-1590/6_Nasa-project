
const mongoose = require('mongoose');

const launchSchema = new mongoose.Schema({
    flightNumber : {
        type : Number,
        required : true,
    },
    launchDate : {
        type : Date,
        required : true,
    },
    mission : {
        type : String,
        required : true,
    },
    rocket : {
        type : String,
        required : true,
    },
    target : {
        type : String,
    },
    customers : [ String ],
    upcoming : {
        type : Boolean,
        required : true,
    },
    success : {
        type : Boolean,
        required : true,
        default : true,
    },
});

// connect launchesSchema with the "launches" collection
module.exports = mongoose.model('Launch', launchSchema);