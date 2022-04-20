# End to end encrypted chat
## Description
This is simple live chat with end to end encryption based on websocket. It uses Vue3 + Node.js, [openPGP.js package](https://www.npmjs.com/package/openpgp) to encrypt and decrypt messages, PostgreSQL to save users data.  Many features are missing but I just wanted to try Vue and it was first attempt. I can't see any practical uses for this app so i will not do anything more with it but I'm sure I will use the acquired knowledge in the future. 

## Info
I did this as a temporary chat. It means that two users must be registered and online to chat. If user is not online message will be not delivered. All information are stored in sessionStorage so closing webbrowser will remove all user data and user will need to register one more time. Unactive users are deleted after 2 hours of inactivity so usernames will be avaiable back in 2 hours. Messages are not stored on the server so they will be not delivered when user will be back online(in case of no internet connection etc). Messages are encrypted by PGP on sender device and decrypted on receiver device. So message going thru the server has format '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'. Server is only a relay and contacts source.  

## Instructions
Open [chat page](chat.nbtb.eu) in two web browsers, register two users, for example someone and someone1. Click blue "Add contact" button on the bottom. Type contact name, for example "someone", click on this newly added contact. Write and send message. Contact and message will appear in other window. 

## On the end
I'm sharing this just because it works and this is next project to portfolio.


