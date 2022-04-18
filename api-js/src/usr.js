const db = require('./db');

module.exports.registerUser = async function registerUser(userData) {
    db.saveNewUser(userData);
}


