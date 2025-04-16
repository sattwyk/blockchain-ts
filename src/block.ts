/**
 * Represents a single block in the blockchain
 * Each block contains a set of transactions and links to the previous block
 */
export class Block {
    // Block metadata
    public index: number;          // Position in the chain
    public timestamp: number;      // When the block was created
    public transactions: any[];    // List of transactions in this block
    public previousHash: string;   // Hash of the previous block (creates the chain)
    public hash: string;           // Current block's hash
    public nonce: number;          // Number used in mining to find valid hash

    /**
     * Creates a new block
     * @param index - Position in the chain
     * @param previousHash - Hash of the previous block
     * @param transactions - List of transactions to include
     * @param nonce - Mining nonce value
     * @param hash - Optional pre-calculated hash
     */
    constructor(
        index: number,
        previousHash: string,
        transactions: any[],
        nonce: number,
        hash?: string
    ) {
        this.index = index;
        this.timestamp = Date.now();
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = nonce;
        this.hash = hash || this.calculateHash(); // Use provided hash or calculate new one
    }

    /**
     * Calculates the SHA-256 hash of the block's contents
     * Hash includes all block data to ensure integrity
     */
    public calculateHash(): string {
        const data = this.index +
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce;

        const hash = new Bun.CryptoHasher("sha256");
        hash.update(data);
        return hash.digest("hex");
    }

    /**
     * Validates the block by checking if its hash matches its contents
     * This ensures the block hasn't been tampered with
     */
    public isValid(): boolean {
        return this.hash === this.calculateHash();
    }
} 