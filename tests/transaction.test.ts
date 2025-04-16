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
}); 