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
}); 