import { Block } from "./block";
import { Transaction } from "./transaction";

/**
 * Manages the blockchain and its operations
 * Handles block creation, mining, and transaction processing
 */
export class Blockchain {
    public chain: Block[];                 // The actual blockchain
    private difficulty: number;            // Mining difficulty (number of leading zeros)
    private pendingTransactions: Transaction[]; // Transactions waiting to be mined

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;               // Start with relatively easy mining
        this.pendingTransactions = [];
    }

    /**
     * Creates the first block in the chain
     * Genesis block has no previous hash and empty transactions
     */
    private createGenesisBlock(): Block {
        return new Block(0, "0", [], 0, "0");
    }

    /**
     * Gets the most recent block in the chain
     * @throws Error if chain is empty
     */
    private getLatestBlock(): Block {
        const latestBlock = this.chain[this.chain.length - 1];
        if (!latestBlock) {
            throw new Error("Chain is empty");
        }
        return latestBlock;
    }

    /**
     * Mines a block by finding a hash that meets the difficulty requirement
     * Uses Proof of Work by incrementing nonce until hash is valid
     */
    private mineBlock(block: Block): void {
        while (block.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0")) {
            block.nonce++;
            block.hash = block.calculateHash();
        }
    }

    /**
     * Adds a new transaction to the pending transactions pool
     * @returns The index of the block that will contain this transaction
     */
    public createTransaction(transaction: Transaction): number {
        if (!transaction.isValid()) {
            throw new Error("Invalid transaction");
        }
        this.pendingTransactions.push(transaction);
        return this.getLatestBlock().index + 1;
    }

    /**
     * Mines all pending transactions into a new block
     * Adds a mining reward transaction for the miner
     */
    public minePendingTransactions(miningRewardAddress: string): void {
        const rewardTx = new Transaction("", miningRewardAddress, 1);
        this.pendingTransactions.push(rewardTx);

        const block = new Block(
            this.getLatestBlock().index + 1,
            this.getLatestBlock().hash,
            this.pendingTransactions,
            0,
            ""
        );

        this.mineBlock(block);
        this.chain.push(block);
        this.pendingTransactions = []; // Clear pending transactions
    }

    /**
     * Calculates the balance for a given address
     * Sums all incoming and outgoing transactions
     */
    public getBalanceOfAddress(address: string): number {
        let balance = 0;

        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.fromAddress === address) {
                    balance -= transaction.amount;
                }
                if (transaction.toAddress === address) {
                    balance += transaction.amount;
                }
            }
        }

        return balance;
    }

    /**
     * Validates the entire blockchain
     * Checks each block's hash and links to previous block
     */
    public isChainValid(): boolean {
        if (this.chain.length === 0) return false;

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock || !previousBlock) return false;
            if (!currentBlock.isValid()) return false;
            if (currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }
} 