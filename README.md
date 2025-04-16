# Simple Blockchain Implementation in TypeScript

A simple blockchain implementation written in TypeScript using Bun's standard library. This implementation includes basic blockchain features like:

- Block creation and validation
- Transaction processing
- Proof of Work (PoW) mining
- Balance tracking
- Chain validation

## Features

- **Blocks**: Each block contains transactions, a timestamp, and a hash of the previous block
- **Transactions**: Simple transaction system with sender, receiver, and amount
- **Mining**: Proof of Work implementation with configurable difficulty
- **Validation**: Chain validation to ensure integrity
- **Balance Tracking**: Track balances for all addresses

## Project Structure

```
.
├── src/
│   ├── block.ts         # Block class implementation
│   ├── blockchain.ts    # Blockchain class implementation
│   ├── transaction.ts   # Transaction class implementation
│   └── example.ts       # Example usage
├── tests/
│   ├── block.test.ts    # Block tests
│   ├── blockchain.test.ts # Blockchain tests
│   └── transaction.test.ts # Transaction tests
└── README.md
```

## Getting Started

1. Make sure you have [Bun](https://bun.sh) installed
2. Clone this repository
3. Run the tests:
   ```bash
   bun test
   ```
4. Run the example:
   ```bash
   bun run src/example.ts
   ```

## Example Usage

```typescript
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
```

## Testing

The project includes a comprehensive test suite using Bun's test runner. Run the tests with:

```bash
bun test
```

## License

MIT
