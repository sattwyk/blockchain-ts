import { Blockchain } from "./blockchain";
import { Transaction } from "./transaction";

// Create a new blockchain
const blockchain = new Blockchain();

// Create some transactions
console.log("Creating transactions...");
const transaction1 = new Transaction("address1", "address2", 100);
const transaction2 = new Transaction("address2", "address1", 50);

// Add transactions to pending transactions
blockchain.createTransaction(transaction1);
blockchain.createTransaction(transaction2);

// Mine pending transactions
console.log("Mining pending transactions...");
blockchain.minePendingTransactions("miner");

// Check balances
console.log("Balances:");
console.log("Address1 balance:", blockchain.getBalanceOfAddress("address1"));
console.log("Address2 balance:", blockchain.getBalanceOfAddress("address2"));
console.log("Miner balance:", blockchain.getBalanceOfAddress("miner"));

// Check if chain is valid
console.log("Is chain valid?", blockchain.isChainValid());

// Print blockchain
console.log("\nBlockchain:");
console.log(JSON.stringify(blockchain.chain, null, 2)); 