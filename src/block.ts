/**
 * Represents a single block in the blockchain
 * Each block contains a set of transactions and links to the previous block
 */
export class Block {
    private _transactions: any[];    // List of transactions in this block
    private _nonce: number;          // Number used in mining to find valid hash

    // Block metadata
    public index: number;            // Position in the chain
    public timestamp: number;        // When the block was created
    public previousHash: string;     // Hash of the previous block (creates the chain)
    public hash: string;             // Current block's hash

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
        this._transactions = [...transactions];
        this.previousHash = previousHash;
        this._nonce = nonce;
        this.hash = hash || this.calculateHash();
    }

    /**
     * Getter for transactions
     */
    get transactions(): any[] {
        return [...this._transactions];
    }

    /**
     * Setter for transactions
     */
    set transactions(value: any[]) {
        this._transactions = [...value];
    }

    /**
     * Getter for nonce
     */
    get nonce(): number {
        return this._nonce;
    }

    /**
     * Setter for nonce
     */
    set nonce(value: number) {
        this._nonce = value;
    }

    /**
     * Calculates the SHA-256 hash of the block's contents
     * Hash includes all block data to ensure integrity
     */
    public calculateHash(): string {
        const data = this.index +
            this.previousHash +
            this.timestamp +
            JSON.stringify(this._transactions) +
            this._nonce;

        const hash = new Bun.CryptoHasher("sha256");
        hash.update(data);
        return hash.digest("hex");
    }

    /**
     * Validates the block by checking if its hash matches its contents
     * This ensures the block hasn't been tampered with
     */
    public isValid(): boolean {
        // Check if the stored hash matches the calculated hash
        if (this.hash !== this.calculateHash()) {
            return false;
        }

        // Validate all transactions in the block if they have isValid method
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