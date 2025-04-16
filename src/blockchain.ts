import { Block } from "./block";
import { Transaction } from "./transaction";

/**
 * Manages the blockchain and its operations
 * Handles block creation, mining, transaction processing, and chain validation
 * Implements core blockchain functionality including consensus mechanism and ledger operations
 */
export class Blockchain {
    public chain: Block[];                 // The actual blockchain (array of linked blocks)
    private difficulty: number;            // Mining difficulty (number of leading zeros required in hash - higher means exponentially harder mining)
    private pendingTransactions: Transaction[]; // Transactions waiting to be mined into the next block
    private readonly miningReward: number = 1;  // Fixed reward for mining a block (cryptocurrency units awarded to miners)

    /**
     * Initializes a new blockchain with genesis block
     * Sets default mining difficulty and empty transaction pool
     */
    constructor() {
        this.chain = [this.createGenesisBlock()];  // Initialize chain with genesis block
        this.difficulty = 2;               // Start with relatively easy mining (2 leading zeros)
        // Note: Each additional level increases difficulty by 16x
        this.pendingTransactions = [];     // Start with empty pending transaction pool
    }

    /**
     * Creates the first block in the chain (genesis block)
     * Genesis block has special properties: index 0, no previous hash, and empty transactions
     * @returns The genesis block that starts the blockchain
     */
    private createGenesisBlock(): Block {
        const block = new Block(0, "0", [], 0);  // Create block with index 0, previous hash "0", no transactions, and nonce 0
        block.hash = block.calculateHash(); // Set initial hash based on genesis block properties
        return block;
    }

    /**
     * Gets the most recent block in the chain for building the next block
     * @throws Error if chain is empty (should never happen due to genesis block)
     * @returns The latest block in the chain
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
     * Uses Proof of Work algorithm by incrementing nonce until a valid hash is found
     * Difficulty determines how many leading zeros are required in the hash
     * Higher difficulty means exponentially more computational work
     * @param block - The block to mine
     */
    private mineBlock(block: Block): void {
        const target = "0".repeat(this.difficulty);  // Create target string with required leading zeros

        // Keep incrementing nonce and recalculating hash until we find a hash with the required leading zeros
        // This is the "work" in Proof of Work - computationally intensive but easy to verify
        while (block.hash.substring(0, this.difficulty) !== target) {
            block.nonce++;  // Increment nonce to try different hash values
            block.hash = block.calculateHash();  // Recalculate hash with new nonce
        }
        // Once loop exits, we have found a valid hash that meets difficulty requirements
    }

    /**
     * Adds a new transaction to the pending transactions pool
     * Performs validation checks before accepting transaction
     * @param transaction - The transaction to add to the pool
     * @returns The index of the block that will contain this transaction when mined
     * @throws Error if transaction is invalid or null
     */
    public createTransaction(transaction: Transaction): number {
        // Validate the transaction existence
        if (!transaction) {
            throw new Error("Invalid transaction");
        }

        // Check validity of the transaction
        // Special handling for mining rewards which use a reserved sender address
        if (!transaction.isValid()) {
            // Special case: Allow mining reward transactions to pass validation
            // Mining rewards come from a special address "MINING_REWARD" indicating they're system-generated
            if (transaction.fromAddress === "MINING_REWARD") {
                // Mining rewards are allowed without standard validation
            } else {
                // Reject invalid transactions from normal addresses
                throw new Error("Invalid transaction");
            }
        }

        // Add valid transaction to pending pool
        this.pendingTransactions.push(transaction);

        // Return the index of the next block (where this transaction will eventually be mined)
        return this.getLatestBlock().index + 1;
    }

    /**
     * Mines all pending transactions into a new block
     * Also adds a mining reward transaction for the miner in the SAME block
     * This is a simplified implementation - real blockchains typically include mining rewards in the next block
     * @param miningRewardAddress Address to receive mining reward
     * @throws Error if mining reward address is missing
     */
    public minePendingTransactions(miningRewardAddress: string): void {
        // Validate mining reward recipient
        if (!miningRewardAddress) {
            throw new Error("Mining reward address is required");
        }

        // Create a copy of pending transactions to mine
        // This prevents modification during the mining process
        const transactionsToMine = [...this.pendingTransactions];

        // Create a mining reward transaction 
        // Using special "MINING_REWARD" address as sender indicates this is system-generated
        const rewardTx = new Transaction("MINING_REWARD", miningRewardAddress, this.miningReward);
        transactionsToMine.push(rewardTx);  // Add reward to the same block being mined

        // Create and mine new block with all transactions
        const latestBlock = this.getLatestBlock();
        const newBlock = new Block(
            latestBlock.index + 1,  // Increment index
            latestBlock.hash,       // Link to previous block
            transactionsToMine,     // Include all pending transactions + mining reward
            0                       // Start with nonce 0
        );

        // Perform the mining operation (Proof of Work)
        this.mineBlock(newBlock);

        // Add mined block to the chain
        this.chain.push(newBlock);

        // Clear pending transactions since they've been processed
        this.pendingTransactions = [];
    }

    /**
     * Calculates the balance for a given address by scanning the entire blockchain
     * Sums all incoming transactions (credits) and subtracts all outgoing transactions (debits)
     * Note: This approach requires scanning the entire chain for each balance check - not scalable for large chains
     * @param address Address to calculate balance for
     * @returns The current balance of the address (can be negative)
     */
    public getBalanceOfAddress(address: string): number {
        if (!address) return 0;  // Empty address has zero balance

        let balance = 0;
        // Iterate through all blocks in the chain
        for (const block of this.chain) {
            // Examine each transaction in the block
            for (const transaction of block.transactions) {
                // Debit: If this address is sending money, subtract from balance
                if (transaction.fromAddress === address) {
                    balance -= transaction.amount;
                }
                // Credit: If this address is receiving money, add to balance
                if (transaction.toAddress === address) {
                    balance += transaction.amount;
                }
            }
        }
        return balance;
    }

    /**
     * Validates the entire blockchain for integrity
     * Performs multiple checks:
     * 1. Genesis block validity
     * 2. Each block's hash validity
     * 3. Proper linking between blocks
     * 4. Transaction validity within blocks
     * @returns Boolean indicating if the entire chain is valid
     */
    public isChainValid(): boolean {
        // Check if chain exists
        if (this.chain.length === 0) return false;

        // Check genesis block validity (special first block)
        const genesisBlock = this.chain[0];
        if (!genesisBlock ||
            genesisBlock.index !== 0 ||            // Must be at index 0
            genesisBlock.previousHash !== "0" ||   // Must have special previous hash "0"
            genesisBlock.transactions.length !== 0 || // Should have no transactions
            !genesisBlock.isValid()) {             // Should pass general validity checks
            return false;
        }

        // Check remaining blocks (start from index 1, after genesis)
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Skip if blocks are undefined (shouldn't happen due to length check)
            if (!currentBlock || !previousBlock) return false;

            // Validate block integrity (hash matches contents)
            if (!currentBlock.isValid()) return false;

            // Validate block linking (hash chain is intact)
            if (currentBlock.previousHash !== previousBlock.hash) return false;

            // Validate sequential indexing
            if (currentBlock.index !== previousBlock.index + 1) return false;

            // Validate all transactions in block
            for (const transaction of currentBlock.transactions) {
                // Skip validation for mining reward transactions (they use a special sender)
                if (transaction.fromAddress === "MINING_REWARD") continue;

                // Ensure each regular transaction is valid
                if (!transaction.isValid()) return false;
            }
        }
        // If all checks pass, the chain is valid
        return true;
    }
} 