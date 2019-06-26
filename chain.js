const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction {
  constructor(fromAddress, toAddress, amount){
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  getHashValue(){
    return SHA256(
      this.fromAddress + 
      this.toAddress + 
      this.amount
    ).toString();
  }

  signTransaction(key){
    if(key.getPublic("hex") !== this.fromAddress){
      throw new Error("Invalid signature");
    }
    this.signature = key.sign(this.getHashValue(), "base64").toDER("hex");
  }

  isTransactionValid(){
    if(this.fromAddress === null) return true;
    if(!this.signature ||  this.signature.length === 0){
      throw new Error("No signature was found.");
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
    return publicKey.verify(this.getHashValue(), this.signature);
  }
}

class Block {
  constructor(transactions, timestamp, previousHash = ""){
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.hash = this.getHashValue();
    this.nonce = 0;
  }

  getHashValue() {
    return SHA256(
      this.previousHash + 
      this.timestamp + 
      JSON.stringify(this.transactions) +
      this.nonce
    ).toString();
  }

  mineNewBlock(difficulty){
    while(this.hash.substr(0, difficulty) !== Array(difficulty + 1).join("0")){
      this.nonce++;
      this.hash = this.getHashValue();
    }
  }

  hasValidTransactions(){
    for(const t of this.transactions){
      if(!t.isTransactionValid){
        return false;
      }
    }
    return true;
  }
}

class USDevBlockchain {
  constructor(){
    // Chain is an array of blocks
    this.chain = [this.getFirstBlock()];
    this.difficulty = 3;
    this.pendingTransactions = [];
    this.rewardForMiners = 100;
  }

  // We have to create the first block manually
  getFirstBlock() {
    return new Block([], new Date(), "0");
  }

  // Returns the latest block in the array
  getLastBlock(){
    return this.chain[this.chain.length - 1];
  }

  mineBlockForPendingTransactions(minerAddress){
    let newBlock = new Block(this.pendingTransactions, new Date(), this.getLastBlock().hash);
    newBlock.mineNewBlock(this.difficulty);
    this.chain.push(newBlock);

    // When new block is mined, rewared the miner
    // But the reward will be available with the next block
    this.pendingTransactions = [
      new Transaction(null, minerAddress, this.rewardForMiners)
    ];
  }

  addTransactionToList(transaction){
    if(!transaction.fromAddress || !transaction.toAddress){
      throw new Error("No address found.");
    }
    if(!transaction.isTransactionValid){
      throw new Error("Invalid transaction.");
    }
    this.pendingTransactions.push(transaction);
  }

  getWalletBalance(address){
    let bal = 0;
    for(let block of this.chain){
      for(let t of block.transactions){
        if(t.fromAddress === address){
          bal -= t.amount;
        }
        if(t.toAddress === address){
          bal += t.amount;
        }
      }
    }
    return bal;
  }

  // It checks if the blocks are chained properly and valid
  isChainValid(){
    for(let i = 1; i < this.chain.length; i++){
      let prevBlock = this.chain[i-1];
      let currBlock = this.chain[i]

      // Check all the transactions
      if(!currBlock.hasValidTransactions){
        return false;
      }

      // Check if each block's hash value was not modified
      if(currBlock.hash !== currBlock.getHashValue()){
        return false;
      }

      // Check if the blocks are chained correctly
      if(currBlock.previousHash !== prevBlock.hash){
        return false;
      }
    }
    return true;
  }
}

module.exports.Transaction = Transaction;
module.exports.Block = Block;
module.exports.USDevBlockchain = USDevBlockchain;