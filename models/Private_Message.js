// User Model
const mongoose = require('mongoose');

const PrivateMessageSchema = new mongoose.Schema({
    from_user: { type: String, required: true, },
    to_user: { type: String, required: true, },
    message: { type: String, required: true, },
    date_sent: { type: Date, default: Date.now },
});

// Export so I can use my schema in other files too
module.exports = mongoose.model('PrivateMessage', PrivateMessageSchema);
