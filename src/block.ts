/**
 * Represents a single block in the blockchain
 * Each block contains a set of transactions and links to the previous block via hash
 * Implements cryptographic security through SHA-256 hashing and proof-of-work
 */
export class Block {
    private _transactions: any[];    // List of transactions in this block (uses any[] for flexibility with different transaction types)
    private _nonce: number;          // Number used in mining to find valid hash (incremented during proof-of-work)

    // Block metadata
    public index: number;            // Position in the chain (genesis block is 0)
    public timestamp: number;        // When the block was created (milliseconds since epoch)
    public previousHash: string;     // Hash of the previous block (creates the chain linking mechanism)
    public hash: string;             // Current block's hash (derived from all other properties for tamper detection)

    /**
     * Creates a new block
     * @param index - Position in the chain (sequential, starts from 0)
     * @param previousHash - Hash of the previous block to maintain chain integrity
     * @param transactions - List of transactions to include in this block
     * @param nonce - Mining nonce value (starts at 0, incremented during mining)
     * @param hash - Optional pre-calculated hash (if null, will be calculated)
     * @returns A new Block instance
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
        this._transactions = [...transactions];  // Create a copy to prevent external modification
        this.previousHash = previousHash;
        this._nonce = nonce;
        this.hash = hash || this.calculateHash();  // Calculate hash if not provided
    }

    /**
     * Getter for transactions - returns a copy to maintain immutability
     * @returns A deep copy of the transactions array
     */
    get transactions(): any[] {
        return [...this._transactions];  // Return copy to prevent external modification
    }

    /**
     * Setter for transactions - accepts and stores a copy of the provided array
     * @param value - The new transactions array
     */
    set transactions(value: any[]) {
        this._transactions = [...value];  // Store a copy to prevent external references
    }

    /**
     * Getter for nonce - used during mining process
     * @returns The current nonce value
     */
    get nonce(): number {
        return this._nonce;
    }

    /**
     * Setter for nonce - used during mining process
     * @param value - The new nonce value
     */
    set nonce(value: number) {
        this._nonce = value;
    }

    /**
     * Calculates the SHA-256 hash of the block's contents
     * Hash includes all block data to ensure integrity and detect tampering
     * Any change to block data will result in a completely different hash
     * @returns Hexadecimal string representation of the SHA-256 hash
     */
    public calculateHash(): string {
        // Concatenate all block data for hashing
        // Order matters for consistent hashing
        const data = this.index +             // Include index to ensure position in chain
            this.previousHash +               // Include previous hash to maintain chain integrity
            this.timestamp +                  // Include timestamp to make each block unique even with identical transactions
            JSON.stringify(this._transactions) + // Include all transaction data
            this._nonce;                      // Include nonce to allow mining different hashes with same data

        // Use Bun's cryptographic hasher for SHA-256
        const hash = new Bun.CryptoHasher("sha256");
        hash.update(data);
        return hash.digest("hex");
    }

    /**
     * Validates the block by checking:
     * 1. If its hash matches its contents (tamper detection)
     * 2. If all contained transactions are valid (recursive validation)
     * This ensures the block hasn't been tampered with and contains valid transactions
     * @returns Boolean indicating if the block is valid
     */
    public isValid(): boolean {
        // Check if the stored hash matches the calculated hash
        // This detects any tampering with block properties
        if (this.hash !== this.calculateHash()) {
            return false;
        }

        // Validate all transactions in the block if they have isValid method
        // This provides recursive validation down to the transaction level
        for (const transaction of this._transactions) {
            if (transaction && typeof transaction.isValid === 'function') {
                if (!transaction.isValid()) {
                    return false;
                }
            }
        }

        return true;
    }
} 