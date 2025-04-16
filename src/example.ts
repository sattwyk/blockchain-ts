import { Blockchain } from "./blockchain";
import { Transaction } from "./transaction";

// Initialize a new blockchain
const blockchain = new Blockchain();

// Create sample transactions between two addresses
console.log("Creating transactions...");
const transaction1 = new Transaction("address1", "address2", 100); // Send 100 from address1 to address2
const transaction2 = new Transaction("address2", "address1", 50);  // Send 50 back from address2 to address1

// Add transactions to the pending pool
blockchain.createTransaction(transaction1);
blockchain.createTransaction(transaction2);

// Mine the pending transactions into a new block
// The miner (address "miner") will receive a reward of 1
console.log("Mining pending transactions...");
blockchain.minePendingTransactions("miner");

// Check final balances after all transactions
console.log("Balances:");
console.log("Address1 balance:", blockchain.getBalanceOfAddress("address1")); // Should be -50 (sent 100, received 50)
console.log("Address2 balance:", blockchain.getBalanceOfAddress("address2")); // Should be 50 (received 100, sent 50)
console.log("Miner balance:", blockchain.getBalanceOfAddress("miner"));      // Should be 1 (mining reward)

// Verify the integrity of the blockchain
console.log("Is chain valid?", blockchain.isChainValid());

// Display the entire blockchain
console.log("\nBlockchain:");
console.log(JSON.stringify(blockchain.chain, null, 2)); 