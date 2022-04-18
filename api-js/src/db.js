const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    user_id serial PRIMARY KEY, 
    username VARCHAR ( 255 ) UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    pubkey TEXT UNIQUE NOT NULL,
    created_on NUMERIC NOT NULL,
    last_login NUMERIC,
    last_logout NUMERIC,
    online BOOLEAN
);`;


module.exports.createTable = function createTable() {
    pool.query(createTableQuery).catch(err => console.log(err));
}

module.exports.saveNewUser = async function saveNewUser(userData) {
    //Maybe i should use some bcrypt here to hash passwords but this im writing this in educational purposes 
    //Anyway accounts will be removed some time after user is dissconnected
    //Keys in app are stored in session storage so they will be removed after sesion end and app will require new reqistration

    const { username, password, pubKey } = userData;
    const saveNewUserQuery = `INSERT INTO users (username, password, pubkey, created_on, last_login, online) VALUES ('${username.toLowerCase()}', '${password}', '${pubKey}', '${createIsoDate()}', '${createIsoDate()}', 'true') RETURNING *;`;

    try {
        await pool.query(saveNewUserQuery);
        console.log("Saving user succesfull")
        return {status: true, username: username, pubKey: pubKey};
    } catch (error) {
        console.log(error)
        return {status: false};
    }
}

module.exports.getAllUsers = async function getAllUsers() {
    try {
        const data = await pool.query(`SELECT * FROM users`);
        return {status: true, rows: {...data.rows}};
    } catch (error) {
        return {status: false}
    }
}

module.exports.getOneUser = async function getOneUser(username) {
    try {
        const data = await pool.query(`SELECT * FROM users WHERE username = '${username.toLowerCase()}';`);
        return {status: true, ...data.rows};
    } catch (error) {
        return {status: false}
    }
}

module.exports.updateLogoutDate = async function updateLogoutDate(username) {
    try {
        const data = await pool.query(`UPDATE users SET last_logout = '${createIsoDate()}', online = 'false' WHERE username = '${username}';`);
        return {status: true, ...data.rows};
    } catch (error) {
        console.log(error);
        return {status: false};
    }
}

module.exports.updateLoginDate = async function updateLoginDate(username) {
    try {
        const data = await pool.query(`UPDATE users SET last_login = '${createIsoDate()}', online = 'true' WHERE username = '${username}';`);
        return {status: true, ...data.rows};
    } catch (error) {
        console.log(error);
        return {status: false};
    }
}

module.exports.deleteUserRow = async function deleteUserRow(username) {
    try {
        const data = await pool.query(`DELETE FROM users WHERE username = '${username}';`);
        return {status: true, ...data}
    } catch (error) {
        console.log(error);
        return {status: false};
    }
}

module.exports.deleteNotActiveUsers = async function deleteNotActiveUsers() {
    const timeStamp = createIsoDate();
    try { //86400000 = day //3600000 = 1 hour
        const data = await pool.query(`DELETE FROM users WHERE '${timeStamp}' - last_login > '3600000' AND '${timeStamp}' - last_logout > '3600000' AND NOT online;`);
    } catch (error) {
        console.log(error)
    }
    

}

function createTimestamp() {
    const date = new Date();
    const options = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "numeric",
        month: "2-digit",
        year: "numeric"
    };

    return date.toLocaleDateString("en", options);
}

function createIsoDate() {
    const date = new Date(); 
    return date.getTime();
}