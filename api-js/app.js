const { WebSocketServer } = require('ws');
const user = require('./src/usr');
const db = require('./src/db');


const wss = new WebSocketServer({ port: '4321' });
const activeUsers = new Map();

//Websocket connection
wss.on("connection", (ws) => {
    db.deleteNotActiveUsers();

    ws.on("message", async data => {
        const message = JSON.parse(data);

        switch (message.msgType) {
            case 'register':
                const { status, username, pubKey } = await db.saveNewUser(message);
                if (status) {
                    ws.pubKey = pubKey;
                    ws.username = username;
                    activeUsers.set(username, ws);
                };
                ws.send(JSON.stringify({ msgType: "registrationResponse", registrationFulfilled: status }));
                break;

            case 'contactRequest':
                const { requestedUser } = message;
                const foundedUser = activeUsers.get(requestedUser);
                if (foundedUser) {
                    ws.send(JSON.stringify({msgType: "contactResponse", found: true, contactName: foundedUser.username, pubKey: foundedUser.pubKey}));
                } else { 
                    ws.send(JSON.stringify({msgType: "contactResponse", found: false}));
                };

                break;
            
            case 'encryptedMessage':
                const receiver = activeUsers.get(message.to);
                if (receiver) {
                    receiver.send(JSON.stringify(message));
                    console.log(receiver)
                } else {
                    ws.send(JSON.stringify({msgType: "contactResponse", found: false}));
                }


                break;

            case 'login': //Prepare for login func
                const dbRows = await db.getOneUser(message.username);
                const user = dbRows[0];
               if ( user && message.password == user.password ) {
                    ws.pubKey = user.pubkey;
                    ws.username = message.username;
                    activeUsers.set(message.username, ws);
                    ws.send(JSON.stringify({ msgType: "registrationResponse", registrationFulfilled: true }));
                    db.updateLoginDate(message.username);
                } else {
                    ws.send(JSON.stringify({ msgType: "registrationResponse", registrationFulfilled: false }));
                }

                break;

            default:
                break;
        }
    });
    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        console.log("Client disconnected");
        db.updateLogoutDate(ws.username);
    });
    // handling client connection error
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});

db.createTable();
console.log("Chat server is running on port 4321");