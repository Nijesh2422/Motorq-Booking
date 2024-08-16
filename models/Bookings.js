const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        Name: { type: String, required: true },
        UserId : {type : String, required : true}, 
        status : {type : String, required: true}
    }
);
const booking = mongoose.model("Booking", bookingSchema);

module.exports = booking;