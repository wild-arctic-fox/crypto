const crypto = require("crypto");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

// Convert the keys to string format
const publicKeyString = publicKey.export({ format: "pem", type: "spki" });
const privateKeyString = privateKey.export({ format: "pem", type: "pkcs8" });

// Print the key strings
console.log("Public Key:\n", publicKeyString);
console.log("Private Key:\n", privateKeyString);
