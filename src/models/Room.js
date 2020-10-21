const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    users: [String],
    messages: [
        {
            content: String,
            date: {
                type: Date,
                default: Date.now
            },
            sentBy: String
        }
    ]
}, {timestamps: mongoose.timestamps})

module.exports = mongoose.model('Room', RoomSchema)
