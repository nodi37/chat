import * as openpgp from 'openpgp';

export async function generateKeys(data) {
    const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
        type: 'ecc', // Type of the key, defaults to ECC
        curve: 'curve25519', // ECC curve name, defaults to curve25519
        userIDs: [{ username: data.username }], // you can pass multiple user IDs
        passphrase: data.secret, // protects the private key
        format: 'armored' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
    });
    sessionStorage.setItem('pubKey', publicKey);
    sessionStorage.setItem('privateKey', privateKey);
}

export async function encryptMessage(msg, key) {
    const publicKeyArmored = key;
    const privateKeyArmored = sessionStorage.getItem('privateKey');
    const passphrase = sessionStorage.getItem('secret');
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
        passphrase
    });

    const encryptedMessage = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: msg }), // input as Message object
        encryptionKeys: publicKey,
        signingKeys: privateKey 
    });

    return encryptedMessage;
}

export async function decryptMessage(msg, pubKey) {
    const publicKeyArmored = pubKey;
    const privateKeyArmored = sessionStorage.getItem('privateKey');
    const passphrase = sessionStorage.getItem('secret');

    const message = await openpgp.readMessage({ armoredMessage: msg });

    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
        passphrase
    });

    const decrypted = await openpgp.decrypt({
        message,
        verificationKeys: publicKey, // optional
        decryptionKeys: privateKey
    });

    const decryptedAndVerified = verifySignature(decrypted)
    .then(()=>{return {data: decrypted.data, isVerified: true}})
    .catch(()=>{return {data: decrypted.data, isVerified: false}});

    return decryptedAndVerified;
}

async function verifySignature(decrypted) {
    try {
        await decrypted.signatures[0].verified;
        return true;
    } catch (e) {
        return false;
    }
}