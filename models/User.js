// User Model
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, },
    firstname: { type: String, required: true, },
    lastname: { type: String, required: true, },
    password: { type: String, required: true },
    creaton: { type: Date, default: Date.now },
});

// Export so I can use my schema in other files too
module.exports = mongoose.model('User', UserSchema);
