/**
 * Represents a single transaction in the blockchain
 * Transactions move value from one address to another
 */
export class Transaction {
    private _amount: number;         // Amount being transferred
    private _nonce: string;          // Random value to ensure unique hashes
    private _originalHash: string;   // Store original hash for tampering detection

    // Transaction details
    public fromAddress: string;    // Sender's address
    public toAddress: string;      // Recipient's address
    public timestamp: number;      // When the transaction was created
    public hash: string;           // Transaction's unique identifier

    /**
     * Creates a new transaction
     * @param fromAddress - Sender's address
     * @param toAddress - Recipient's address
     * @param amount - Amount to transfer
     * @throws {Error} If amount is invalid or addresses are missing
     */
    constructor(fromAddress: string, toAddress: string, amount: number) {
        // Validate amount before assigning
        if (!this.isValidAmount(amount)) {
            throw new Error("Invalid transaction amount");
        }

        // Check for valid addresses
        // Empty fromAddress is only allowed for mining rewards in the blockchain class
        if (!fromAddress || !toAddress) {
            throw new Error("Both fromAddress and toAddress are required");
        }

        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this._amount = amount;
        this.timestamp = Date.now();
        this._nonce = Math.random().toString(36).substring(2); // Generate random nonce
        this.hash = this.calculateHash();
        this._originalHash = this.hash; // Store original hash
    }

    /**
     * Getter for amount
     */
    get amount(): number {
        return this._amount;
    }

    /**
     * Setter for amount
     * @throws {Error} If amount is invalid
     */
    set amount(value: number) {
        if (!this.isValidAmount(value)) {
            throw new Error("Invalid transaction amount");
        }
        this._amount = value;
        this.hash = this.calculateHash(); // Recalculate hash when amount changes
    }

    /**
     * Validates if an amount is acceptable for a transaction
     * @param amount - Amount to validate
     */
    private isValidAmount(amount: number): boolean {
        return (
            typeof amount === 'number' &&
            !isNaN(amount) &&
            isFinite(amount) &&
            amount > 0 &&
            amount <= Number.MAX_SAFE_INTEGER
        );
    }

    /**
     * Calculates the SHA-256 hash of the transaction
     * Hash includes all transaction data to ensure integrity
     */
    public calculateHash(): string {
        // Convert all values to strings and concatenate with a delimiter
        // to prevent hash collisions from similar values
        const data = [
            this.fromAddress,
            this.toAddress,
            this._amount.toString(),
            this.timestamp.toString(),
            this._nonce // Use stored nonce for consistent hashing
        ].join('|');

        const hash = new Bun.CryptoHasher("sha256");
        hash.update(data);
        return hash.digest("hex");
    }

    /**
     * Validates the transaction
     * Ensures the transaction has valid addresses and positive amount
     */
    public isValid(): boolean {
        if (!this.isValidAmount(this._amount)) return false;

        // Special case for mining rewards (empty fromAddress)
        if (this.fromAddress === "") {
            if (!this.toAddress) return false;
        } else if (!this.fromAddress || !this.toAddress) {
            return false;
        }

        return this.hash === this._originalHash; // Compare with original hash to detect tampering
    }

    /**
     * Makes this transaction invalid (for testing purposes)
     */
    public makeInvalid(): void {
        // Modify an internal property without updating the hash
        // This will make isValid() return false
        this._amount = -1; // Negative amount is invalid
    }
} 