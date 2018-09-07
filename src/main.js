const SHA256 = require("crypto-js/sha256");

// class to implement trasactions in the chain
class Transaction {
  constructor(fromAddress, toAddress, amount, contract) {
      if(!contract){
        contract = buyerContract;
      }
      if(typeof contract === 'function') {
        if(contract(fromAddress, toAddress, amount)){
            this.fromAddress = fromAddress;
            this.toAddress = toAddress;
            this.amount = amount;
        } else {
            console.log('Contract details invalid!')
            return null
        }
      } else {
        console.log('Contract definition invalid!')
        return null
      }
    

  }
}

// class to implement blocks in the chain
class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("TRANSACTIONS: " + JSON.stringify(this.transactions));
    console.log("BLOCK MINED: " + this.hash);
  }
}

// class to implement the chain
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block(Date.parse("2017-01-01"), [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward, easyContract);
    this.pendingTransactions.push(rewardTx);

    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);
    // console.log(this.chain);
    // console.log(this.pendingTransactions)
    this.pendingTransactions = [];
  }

  createTransaction(transaction) {
    //  console.log(transaction);
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
          console.log(trans.amount)
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

// an example contract 
const buyerContract = function( fromAddress,toAddress, amount){
    if(!fromAddress || !toAddress || !amount){
        console.log('Contract invalid!')
        return false;
    }
    console.log('Contract valid!')
    return true
}

// another easy contract
const easyContract = function( fromAddress,toAddress, amount){
    if(!toAddress || !amount){
        console.log('Contract invalid!')
        return false;
    }
    console.log('Contract valid!')
    return true
}
// create an instance of our chain
let seewardCoin = new Blockchain();

// throw some trxs into the chain
seewardCoin.createTransaction(new Transaction('address1', 'seeward-address', 1008,buyerContract));
seewardCoin.createTransaction(new Transaction('address3', 'seeward-address', 130));
seewardCoin.createTransaction(new Transaction('address4', 'seeward-address', 77));
seewardCoin.createTransaction(new Transaction( null, 'seeward-address', 103, easyContract));


// see some actions
console.log('\n Starting the miner...');
seewardCoin.minePendingTransactions('seeward-address');

console.log('\nBalance of seeward is', seewardCoin.getBalanceOfAddress('seeward-address'));

console.log('\n Starting the miner again...');
seewardCoin.minePendingTransactions('seeward-address');

console.log('\nBalance of seeward is', seewardCoin.getBalanceOfAddress('seeward-address'));

console.log('\n Chain...' + seewardCoin.chain);