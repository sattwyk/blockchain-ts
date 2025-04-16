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
}); 