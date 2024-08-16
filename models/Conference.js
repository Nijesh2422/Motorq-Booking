const mongoose = require('mongoose');

const conferenceSchema = new mongoose.Schema(
    {
        Name: { type: String, required: true },
        Location: { type: String, required: true },
        Topics : [String],
        availableSlots: { // Check if available slots are greater that 0;
            type: Number,
            required: true
        },
        startTime: {
            type: Date,
            required: true
        },
        endTime: { // Validate if start time is less than end time and if Duration is less than 12
            type: Date,
            required: true
        },
        waitList : [String]
    }
);

// UTC thing make sure you do it...
const conference = mongoose.model("Conference", conferenceSchema);

module.exports = conference;