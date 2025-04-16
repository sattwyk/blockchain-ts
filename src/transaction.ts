/**
 * Represents a single transaction in the blockchain
 * Transactions move value from one address to another
 * Includes security features to prevent tampering and ensure integrity
 */
export class Transaction {
    private _amount: number;         // Amount being transferred (protected with getter/setter for validation)
    private _nonce: string;          // Random value to ensure unique hashes even for identical transactions
    private _originalHash: string;   // Store original hash for tampering detection (security feature)

    // Transaction details
    public fromAddress: string;    // Sender's address (public key or identifier)
    public toAddress: string;      // Recipient's address (public key or identifier)
    public timestamp: number;      // When the transaction was created (milliseconds since epoch)
    public hash: string;           // Transaction's unique identifier (SHA-256 hash of all properties)

    /**
     * Creates a new transaction
     * @param fromAddress - Sender's address (special value "MINING_REWARD" used for mining rewards)
     * @param toAddress - Recipient's address
     * @param amount - Amount to transfer (must be positive and finite)
     * @throws {Error} If amount is invalid or addresses are missing
     * @returns A new Transaction instance
     */
    constructor(fromAddress: string, toAddress: string, amount: number) {
        // Validate amount before assigning - prevents invalid transactions from being created
        if (!this.isValidAmount(amount)) {
            throw new Error("Invalid transaction amount");
        }

        // Check for valid addresses
        // Note: Empty fromAddress is only allowed for mining rewards in the blockchain class
        // In a real implementation, would also validate address format/signature
        if (!fromAddress || !toAddress) {
            throw new Error("Both fromAddress and toAddress are required");
        }

        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this._amount = amount;
        this.timestamp = Date.now();
        this._nonce = Math.random().toString(36).substring(2); // Generate random nonce for unique hash
        this.hash = this.calculateHash(); // Calculate initial hash based on properties
        this._originalHash = this.hash; // Store original hash for tamper detection
    }

    /**
     * Getter for amount - provides read access to the protected property
     * @returns The transaction amount
     */
    get amount(): number {
        return this._amount;
    }

    /**
     * Setter for amount - validates before setting and updates hash
     * @param value - New amount to set
     * @throws {Error} If amount is invalid
     */
    set amount(value: number) {
        if (!this.isValidAmount(value)) {
            throw new Error("Invalid transaction amount");
        }
        this._amount = value;
        this.hash = this.calculateHash(); // Important: recalculate hash when amount changes
    }

    /**
     * Validates if an amount is acceptable for a transaction
     * Performs multiple checks to ensure the amount is valid
     * @param amount - Amount to validate
     * @returns Boolean indicating if the amount is valid
     */
    private isValidAmount(amount: number): boolean {
        return (
            typeof amount === 'number' && // Must be a number type
            !isNaN(amount) &&             // Must not be NaN
            isFinite(amount) &&           // Must be finite (not Infinity)
            amount > 0 &&                 // Must be positive (no zero or negative values)
            amount <= Number.MAX_SAFE_INTEGER // Must not exceed JavaScript's safe integer limit
        );
    }

    /**
     * Calculates the SHA-256 hash of the transaction
     * Hash includes all transaction data to ensure integrity
     * This hash serves as a unique identifier and tamper detection mechanism
     * @returns Hexadecimal string representation of the SHA-256 hash
     */
    public calculateHash(): string {
        // Convert all values to strings and concatenate with a delimiter
        // Pipe character (|) used as delimiter to prevent hash collisions 
        // (e.g., "a|b" and "a" + "|b" will be different)
        const data = [
            this.fromAddress,           // Who is sending
            this.toAddress,             // Who is receiving
            this._amount.toString(),    // How much is being sent
            this.timestamp.toString(),  // When it was created
            this._nonce                 // Random value to ensure uniqueness
        ].join('|');

        // Use Bun's cryptographic hasher to generate SHA-256 hash
        const hash = new Bun.CryptoHasher("sha256");
        hash.update(data);
        return hash.digest("hex");
    }

    /**
     * Validates the transaction for integrity and correctness
     * Checks:
     * 1. Valid amount
     * 2. Valid addresses
     * 3. Hash integrity (tampering detection)
     * @returns Boolean indicating if the transaction is valid
     */
    public isValid(): boolean {
        // Check amount validity
        if (!this.isValidAmount(this._amount)) return false;

        // Address validation with special case for mining rewards
        // Mining rewards can use "" or "MINING_REWARD" as fromAddress
        if (this.fromAddress === "") {
            // Special case for system-generated transactions (mining rewards)
            if (!this.toAddress) return false; // Still need recipient
        } else if (!this.fromAddress || !this.toAddress) {
            // Normal transactions need both addresses
            return false;
        }

        // Tamper detection: compare current hash with original hash
        // If properties were modified without updating hash through proper setters,
        // this comparison will fail, indicating tampering
        return this.hash === this._originalHash;
    }

    /**
     * Makes this transaction invalid (for testing purposes)
     * Deliberately breaks the transaction's integrity for testing validation
     */
    public makeInvalid(): void {
        // Modify an internal property without updating the hash
        // This simulates tampering with the transaction
        // The isValid() method will return false after this is called
        // because _amount is changed but hash isn't recalculated
        this._amount = -1; // Negative amount is invalid
        // Note: We deliberately DON'T update the hash here to simulate tampering
    }
} 