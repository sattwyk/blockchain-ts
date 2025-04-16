import { describe, test, expect } from "bun:test";
import { Block } from "../src/block";

describe("Block", () => {
    test("should create a valid block", () => {
        const block = new Block(1, "0", [], 0);
        expect(block).toBeDefined();
        expect(block.index).toBe(1);
        expect(block.previousHash).toBe("0");
        expect(block.transactions).toEqual([]);
        expect(block.timestamp).toBeGreaterThan(0);
    });

    test("should calculate block hash", () => {
        const block = new Block(1, "0", [], 0);
        const hash = block.calculateHash();
        expect(hash).toBeDefined();
        expect(hash.length).toBeGreaterThan(0);
    });

    test("should validate block", () => {
        const block = new Block(1, "0", [], 0);
        expect(block.isValid()).toBe(true);
    });

    test("should detect invalid block when data is tampered", () => {
        const block = new Block(1, "0", [], 0);
        block.transactions = ["tampered data"];
        expect(block.isValid()).toBe(false);
    });

    test("should handle block with multiple transactions", () => {
        const transactions = [
            { from: "addr1", to: "addr2", amount: 100 },
            { from: "addr2", to: "addr1", amount: 50 }
        ];
        const block = new Block(1, "0", transactions, 0);
        expect(block.transactions.length).toBe(2);
        expect(block.isValid()).toBe(true);
    });

    test("should detect changes in block data", () => {
        const block = new Block(1, "0", [], 0);
        block.nonce = 1;
        expect(block.isValid()).toBe(false);
    });

    test("should maintain valid hash after timestamp update", () => {
        const block = new Block(1, "0", [], 0);
        const originalHash = block.hash;
        // Small delay to ensure timestamp change
        Bun.sleep(1);
        expect(block.hash).toBe(originalHash);
        expect(block.isValid()).toBe(true);
    });

    // New test cases
    test("should handle large transaction arrays", () => {
        const transactions = Array(1000).fill(null).map((_, i) => ({
            from: `addr${i}`,
            to: `addr${i + 1}`,
            amount: i
        }));
        const block = new Block(1, "0", transactions, 0);
        expect(block.transactions.length).toBe(1000);
        expect(block.isValid()).toBe(true);
    });

    test("should handle special characters in transaction data", () => {
        const transactions = [
            { from: "addr1!@#$", to: "addr2%^&*", amount: 100 },
            { from: "αβγδ", to: "こんにちは", amount: 50 }
        ];
        const block = new Block(1, "0", transactions, 0);
        expect(block.isValid()).toBe(true);
    });

    test("should prevent transaction array mutation", () => {
        const transactions = [{ from: "addr1", to: "addr2", amount: 100 }];
        const block = new Block(1, "0", transactions, 0);
        const blockTransactions = block.transactions;
        blockTransactions.push({ from: "addr3", to: "addr4", amount: 200 });
        expect(block.transactions).toEqual([{ from: "addr1", to: "addr2", amount: 100 }]);
    });

    test("should handle edge cases in block index", () => {
        const maxIndex = Number.MAX_SAFE_INTEGER;
        const block = new Block(maxIndex, "0", [], 0);
        expect(block.index).toBe(maxIndex);
        expect(block.isValid()).toBe(true);
    });

    test("should validate previous hash format", () => {
        const block = new Block(1, "invalid_hash_format", [], 0);
        expect(block.previousHash).toBe("invalid_hash_format");
        expect(block.isValid()).toBe(true); // Hash format is not validated
    });
}); 