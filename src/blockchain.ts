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
    private readonly miningReward: number = 1;  // Fixed reward for mining a block

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
        const block = new Block(0, "0", [], 0);
        block.hash = block.calculateHash(); // Set initial hash
        return block;
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
        const target = "0".repeat(this.difficulty);
        while (block.hash.substring(0, this.difficulty) !== target) {
            block.nonce++;
            block.hash = block.calculateHash();
        }
    }

    /**
     * Adds a new transaction to the pending transactions pool
     * @returns The index of the block that will contain this transaction
     * @throws Error if transaction is invalid
     */
    public createTransaction(transaction: Transaction): number {
        // Validate the transaction
        if (!transaction) {
            throw new Error("Invalid transaction");
        }

        // Check validity of the transaction
        // Handles special cases for mining rewards and regular transactions
        if (!transaction.isValid()) {
            // Check if this is a special mining reward transaction
            if (transaction.fromAddress === "MINING_REWARD") {
                // Allow mining rewards to pass
            } else {
                throw new Error("Invalid transaction");
            }
        }

        // If we get here, the transaction is valid or is a mining reward
        this.pendingTransactions.push(transaction);
        return this.getLatestBlock().index + 1;
    }

    /**
     * Mines all pending transactions into a new block
     * Adds a mining reward transaction for the miner
     * @param miningRewardAddress Address to receive mining reward
     */
    public minePendingTransactions(miningRewardAddress: string): void {
        if (!miningRewardAddress) {
            throw new Error("Mining reward address is required");
        }

        // Create a copy of pending transactions to mine
        const transactionsToMine = [...this.pendingTransactions];

        // Create a normal reward transaction without validation
        const rewardTx = new Transaction("MINING_REWARD", miningRewardAddress, this.miningReward);
        transactionsToMine.push(rewardTx);

        // Create and mine new block
        const latestBlock = this.getLatestBlock();
        const newBlock = new Block(
            latestBlock.index + 1,
            latestBlock.hash,
            transactionsToMine,
            0
        );

        this.mineBlock(newBlock);
        this.chain.push(newBlock);
        this.pendingTransactions = []; // Clear pending transactions after mining
    }

    /**
     * Calculates the balance for a given address
     * Sums all incoming and outgoing transactions
     * @param address Address to calculate balance for
     */
    public getBalanceOfAddress(address: string): number {
        if (!address) return 0;

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
        // Check genesis block
        if (this.chain.length === 0) return false;
        const genesisBlock = this.chain[0];
        if (!genesisBlock ||
            genesisBlock.index !== 0 ||
            genesisBlock.previousHash !== "0" ||
            genesisBlock.transactions.length !== 0 ||
            !genesisBlock.isValid()) {
            return false;
        }

        // Check remaining blocks
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Skip if blocks are undefined (shouldn't happen due to length check)
            if (!currentBlock || !previousBlock) return false;

            // Validate block integrity
            if (!currentBlock.isValid()) return false;

            // Validate block links
            if (currentBlock.previousHash !== previousBlock.hash) return false;
            if (currentBlock.index !== previousBlock.index + 1) return false;

            // Validate all transactions in block
            for (const transaction of currentBlock.transactions) {
                // Skip mining reward transactions
                if (transaction.fromAddress === "MINING_REWARD") continue;

                if (!transaction.isValid()) return false;
            }
        }
        return true;
    }
} 