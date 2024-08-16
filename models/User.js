const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        UserId: {
            type: String,
            required: true
        },        
        Topics : [String]
    }
);

// UTC thing make sure you do it...
const user = mongoose.model("user", userSchema);

module.exports = user;