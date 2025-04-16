/**
 * Represents a single transaction in the blockchain
 * Transactions move value from one address to another
 */
export class Transaction {
    // Transaction details
    public fromAddress: string;    // Sender's address
    public toAddress: string;      // Recipient's address
    public amount: number;         // Amount being transferred
    public timestamp: number;      // When the transaction was created
    public hash: string;           // Transaction's unique identifier

    /**
     * Creates a new transaction
     * @param fromAddress - Sender's address
     * @param toAddress - Recipient's address
     * @param amount - Amount to transfer
     */
    constructor(fromAddress: string, toAddress: string, amount: number) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
        this.hash = this.calculateHash();
    }

    /**
     * Calculates the SHA-256 hash of the transaction
     * Hash includes all transaction data to ensure integrity
     */
    public calculateHash(): string {
        const data = this.fromAddress +
            this.toAddress +
            this.amount +
            this.timestamp;

        const hash = new Bun.CryptoHasher("sha256");
        hash.update(data);
        return hash.digest("hex");
    }

    /**
     * Validates the transaction
     * Ensures the transaction has valid addresses and positive amount
     */
    public isValid(): boolean {
        if (this.amount <= 0) return false;
        if (!this.fromAddress || !this.toAddress) return false;
        return this.hash === this.calculateHash();
    }
} 