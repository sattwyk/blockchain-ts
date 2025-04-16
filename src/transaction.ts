export class Transaction {
    public fromAddress: string;
    public toAddress: string;
    public amount: number;
    public timestamp: number;
    public hash: string;

    constructor(fromAddress: string, toAddress: string, amount: number) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
        this.hash = this.calculateHash();
    }

    public calculateHash(): string {
        const data = this.fromAddress +
            this.toAddress +
            this.amount +
            this.timestamp;

        const hash = new Bun.CryptoHasher("sha256");
        hash.update(data);
        return hash.digest("hex");
    }

    public isValid(): boolean {
        if (this.amount <= 0) return false;
        if (!this.fromAddress || !this.toAddress) return false;
        return this.hash === this.calculateHash();
    }
} 