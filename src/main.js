const SHA256 = require("crypto-js/sha256");

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

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
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);
    console.log(this.chain);
    console.log(this.pendingTransactions)
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

let seewardCoin = new Blockchain();


seewardCoin.createTransaction(new Transaction('address1', 'seeward-address', 1008));
seewardCoin.createTransaction(new Transaction('address3', 'seeward-address', 130));
seewardCoin.createTransaction(new Transaction('address4', 'seeward-address', 77));
seewardCoin.createTransaction(new Transaction('address11', 'seeward-address', 103));




console.log('\n Starting the miner...');
seewardCoin.minePendingTransactions('seeward-address');

console.log('\nBalance of seeward is', seewardCoin.getBalanceOfAddress('seeward-address'));

console.log('\n Starting the miner again...');
seewardCoin.minePendingTransactions('seeward-address');

console.log('\nBalance of seeward is', seewardCoin.getBalanceOfAddress('seeward-address'));
