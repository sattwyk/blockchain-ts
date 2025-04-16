import { describe, test, expect } from "bun:test";
import { Transaction } from "../src/transaction";

describe("Transaction", () => {
    test("should create a valid transaction", () => {
        const transaction = new Transaction("from", "to", 100);
        expect(transaction).toBeDefined();
        expect(transaction.fromAddress).toBe("from");
        expect(transaction.toAddress).toBe("to");
        expect(transaction.amount).toBe(100);
        expect(transaction.timestamp).toBeGreaterThan(0);
    });

    test("should calculate transaction hash", () => {
        const transaction = new Transaction("from", "to", 100);
        const hash = transaction.calculateHash();
        expect(hash).toBeDefined();
        expect(hash.length).toBeGreaterThan(0);
    });

    test("should validate transaction", () => {
        const transaction = new Transaction("from", "to", 100);
        expect(transaction.isValid()).toBe(true);
    });

    test("should reject invalid transaction amount", () => {
        expect(() => {
            new Transaction("from", "to", 0);
        }).toThrow("Invalid transaction amount");
    });

    test("should reject negative transaction amount", () => {
        expect(() => {
            new Transaction("from", "to", -100);
        }).toThrow("Invalid transaction amount");
    });

    test("should reject transaction with empty addresses", () => {
        expect(() => {
            new Transaction("", "to", 100);
        }).toThrow("Both fromAddress and toAddress are required");

        expect(() => {
            new Transaction("from", "", 100);
        }).toThrow("Both fromAddress and toAddress are required");
    });

    test("should detect tampered transaction", () => {
        const transaction = new Transaction("from", "to", 100);
        transaction.amount = 200;
        expect(transaction.isValid()).toBe(false);
    });

    test("should maintain valid hash after timestamp update", () => {
        const transaction = new Transaction("from", "to", 100);
        const originalHash = transaction.hash;
        // Small delay to ensure timestamp change
        Bun.sleep(1);
        expect(transaction.hash).toBe(originalHash);
        expect(transaction.isValid()).toBe(true);
    });

    // New test cases
    test("should handle maximum safe integer amount", () => {
        const transaction = new Transaction("from", "to", Number.MAX_SAFE_INTEGER);
        expect(transaction.amount).toBe(Number.MAX_SAFE_INTEGER);
        expect(transaction.isValid()).toBe(true);
    });

    test("should handle special characters in addresses", () => {
        const transaction = new Transaction("addr1!@#$", "addr2%^&*", 100);
        expect(transaction.isValid()).toBe(true);
    });

    test("should handle unicode characters in addresses", () => {
        const transaction = new Transaction("αβγδ", "こんにちは", 100);
        expect(transaction.isValid()).toBe(true);
    });

    test("should handle floating point amounts", () => {
        const transaction = new Transaction("from", "to", 100.123);
        expect(transaction.amount).toBe(100.123);
        expect(transaction.isValid()).toBe(true);
    });

    test("should handle very small amounts", () => {
        const transaction = new Transaction("from", "to", 0.000001);
        expect(transaction.isValid()).toBe(true);
    });

    test("should reject NaN amount", () => {
        expect(() => {
            new Transaction("from", "to", NaN);
        }).toThrow("Invalid transaction amount");
    });

    test("should reject Infinity amount", () => {
        expect(() => {
            new Transaction("from", "to", Infinity);
        }).toThrow("Invalid transaction amount");
    });

    test("should generate unique hashes for similar transactions", () => {
        const tx1 = new Transaction("from", "to", 100);
        const tx2 = new Transaction("from", "to", 100);
        expect(tx1.hash).not.toBe(tx2.hash); // Should be different due to timestamps
    });
}); 