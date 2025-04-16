import { describe, test, expect } from "bun:test";
import { Blockchain } from "../src/blockchain";
import { Transaction } from "../src/transaction";

describe("Blockchain", () => {
    test("should create a new blockchain with genesis block", () => {
        const blockchain = new Blockchain();
        expect(blockchain.chain.length).toBe(1);
        expect(blockchain.chain[0]!.index).toBe(0);
        expect(blockchain.chain[0]!.previousHash).toBe("0");
    });

    test("should create and process transactions", () => {
        const blockchain = new Blockchain();
        const transaction = new Transaction("address1", "address2", 100);
        const blockIndex = blockchain.createTransaction(transaction);
        expect(blockIndex).toBe(1);
    });

    test("should mine pending transactions", () => {
        const blockchain = new Blockchain();
        const transaction = new Transaction("address1", "address2", 100);
        blockchain.createTransaction(transaction);
        blockchain.minePendingTransactions("miner");
        expect(blockchain.chain.length).toBe(2);
        expect(blockchain.chain[1]!.transactions.length).toBe(2); // Includes mining reward
    });

    test("should calculate correct balance", () => {
        const blockchain = new Blockchain();
        const transaction1 = new Transaction("address1", "address2", 100);
        const transaction2 = new Transaction("address2", "address1", 50);

        blockchain.createTransaction(transaction1);
        blockchain.createTransaction(transaction2);
        blockchain.minePendingTransactions("miner");

        expect(blockchain.getBalanceOfAddress("address1")).toBe(-50);
        expect(blockchain.getBalanceOfAddress("address2")).toBe(50);
        expect(blockchain.getBalanceOfAddress("miner")).toBe(1);
    });

    test("should validate the chain", () => {
        const blockchain = new Blockchain();
        const transaction = new Transaction("address1", "address2", 100);
        blockchain.createTransaction(transaction);
        blockchain.minePendingTransactions("miner");
        expect(blockchain.isChainValid()).toBe(true);
    });

    test("should detect invalid chain", () => {
        const blockchain = new Blockchain();
        const transaction = new Transaction("address1", "address2", 100);
        blockchain.createTransaction(transaction);
        blockchain.minePendingTransactions("miner");
        blockchain.chain[1]!.transactions = [new Transaction("tampered", "data", 1000)];
        expect(blockchain.isChainValid()).toBe(false);
    });

    test("should handle multiple blocks correctly", () => {
        const blockchain = new Blockchain();

        // Add and mine first set of transactions
        blockchain.createTransaction(new Transaction("addr1", "addr2", 100));
        blockchain.minePendingTransactions("miner1");

        // Add and mine second set of transactions
        blockchain.createTransaction(new Transaction("addr2", "addr1", 50));
        blockchain.minePendingTransactions("miner2");

        expect(blockchain.chain.length).toBe(3);
        expect(blockchain.isChainValid()).toBe(true);
        expect(blockchain.getBalanceOfAddress("miner1")).toBe(1);
        expect(blockchain.getBalanceOfAddress("miner2")).toBe(1);
    });

    test("should reject invalid transactions", () => {
        const blockchain = new Blockchain();

        // Create a valid transaction
        const transaction = new Transaction("addr1", "addr2", 100);

        // Make it invalid using the testing method
        transaction.makeInvalid();

        // Now it should fail validation and be rejected
        expect(() => {
            blockchain.createTransaction(transaction);
        }).toThrow("Invalid transaction");
    });

    test("should handle mining difficulty changes", () => {
        const blockchain = new Blockchain();
        const originalDifficulty = blockchain["difficulty"];

        // Add a transaction and mine it
        blockchain.createTransaction(new Transaction("addr1", "addr2", 100));
        blockchain.minePendingTransactions("miner");

        // Verify the mined block's hash meets difficulty requirement
        const minedBlock = blockchain.chain[1]!;
        expect(minedBlock.hash.substring(0, originalDifficulty)).toBe("0".repeat(originalDifficulty));
    });

    test("should calculate balances correctly with multiple transactions", () => {
        const blockchain = new Blockchain();

        // Add multiple transactions
        blockchain.createTransaction(new Transaction("addr1", "addr2", 100));
        blockchain.createTransaction(new Transaction("addr2", "addr1", 50));
        blockchain.createTransaction(new Transaction("addr1", "addr2", 25));
        blockchain.minePendingTransactions("miner");

        expect(blockchain.getBalanceOfAddress("addr1")).toBe(-75); // -100 + 50 - 25
        expect(blockchain.getBalanceOfAddress("addr2")).toBe(75);  // +100 - 50 + 25
        expect(blockchain.getBalanceOfAddress("miner")).toBe(1);
    });

    // New test cases
    test("should handle large number of transactions in a block", () => {
        const blockchain = new Blockchain();
        const numTransactions = 100;

        for (let i = 0; i < numTransactions; i++) {
            blockchain.createTransaction(
                new Transaction(`addr${i}`, `addr${i + 1}`, i + 1)
            );
        }

        blockchain.minePendingTransactions("miner");
        expect(blockchain.chain[1]!.transactions.length).toBe(numTransactions + 1); // +1 for mining reward
        expect(blockchain.isChainValid()).toBe(true);
    });

    test("should handle circular transactions", () => {
        const blockchain = new Blockchain();
        const numAddresses = 5;

        // Create circular transactions between addresses
        for (let i = 0; i < numAddresses; i++) {
            const nextAddr = (i + 1) % numAddresses;
            blockchain.createTransaction(
                new Transaction(`addr${i}`, `addr${nextAddr}`, 100)
            );
        }

        blockchain.minePendingTransactions("miner");

        // All addresses except miner should have 0 balance
        for (let i = 0; i < numAddresses; i++) {
            expect(blockchain.getBalanceOfAddress(`addr${i}`)).toBe(0);
        }
        expect(blockchain.getBalanceOfAddress("miner")).toBe(1);
    });

    test("should handle multiple mining rewards", () => {
        const blockchain = new Blockchain();
        const numBlocks = 5;

        for (let i = 0; i < numBlocks; i++) {
            blockchain.createTransaction(new Transaction("addr1", "addr2", 10));
            blockchain.minePendingTransactions("miner");
        }

        expect(blockchain.getBalanceOfAddress("miner")).toBe(numBlocks);
    });

    test("should handle empty blocks", () => {
        const blockchain = new Blockchain();
        blockchain.minePendingTransactions("miner");
        blockchain.minePendingTransactions("miner");

        expect(blockchain.chain.length).toBe(3);
        expect(blockchain.chain[1]!.transactions.length).toBe(1); // Only mining reward
        expect(blockchain.chain[2]!.transactions.length).toBe(1); // Only mining reward
    });

    test("should maintain correct balances after complex transactions", () => {
        const blockchain = new Blockchain();

        // Complex series of transactions
        blockchain.createTransaction(new Transaction("A", "B", 100)); // A: -100, B: +100
        blockchain.minePendingTransactions("M1"); // M1: +1

        blockchain.createTransaction(new Transaction("B", "C", 75));  // B: +25, C: +75
        blockchain.createTransaction(new Transaction("C", "A", 50));  // C: +25, A: -50
        blockchain.minePendingTransactions("M2"); // M2: +1

        expect(blockchain.getBalanceOfAddress("A")).toBe(-50);  // -100 + 50
        expect(blockchain.getBalanceOfAddress("B")).toBe(25);   // +100 - 75
        expect(blockchain.getBalanceOfAddress("C")).toBe(25);   // +75 - 50
        expect(blockchain.getBalanceOfAddress("M1")).toBe(1);
        expect(blockchain.getBalanceOfAddress("M2")).toBe(1);
    });
}); 