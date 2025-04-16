export class Block {
    public index: number;
    public timestamp: number;
    public transactions: any[];
    public previousHash: string;
    public hash: string;
    public nonce: number;

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
        this.hash = hash || this.calculateHash();
    }

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

    public isValid(): boolean {
        return this.hash === this.calculateHash();
    }
} 