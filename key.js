const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const keyPair = ec.genKeyPair();
const publicKey = keyPair.getPublic("hex");
const privateKey = keyPair.getPrivate("hex");

console.log("Public: " + publicKey);
console.log("Private: " + privateKey);