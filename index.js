const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const { USDevBlockchain, Transaction } = require("./chain");

const key = ec.keyFromPrivate("9c5ec56adbd8870aa81782046bc47376e27181e7bcbfd38b05f236ba18c6eea8");
const walletAddress = key.getPublic("hex");

const USDevCoin = new USDevBlockchain();
const t1 = new Transaction(walletAddress, "someone else's wallet address", 2);
t1.signTransaction(key);
USDevCoin.addTransactionToList(t1);

USDevCoin.mineBlockForPendingTransactions(walletAddress);

const t2 = new Transaction(walletAddress, "someone else's wallet address", 2);
t2.signTransaction(key);
USDevCoin.addTransactionToList(t2);

USDevCoin.mineBlockForPendingTransactions(walletAddress);

const t3 = new Transaction(walletAddress, "someone else's wallet address", 2);
t3.signTransaction(key);
USDevCoin.addTransactionToList(t3);

USDevCoin.mineBlockForPendingTransactions(walletAddress);

console.log("My balance: " + USDevCoin.getWalletBalance(walletAddress));