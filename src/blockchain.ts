import { Block } from "./block";
import { Transaction } from "./transaction";

export class Blockchain {
    public chain: Block[];
    private difficulty: number;
    private pendingTransactions: Transaction[];

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
    }

    private createGenesisBlock(): Block {
        return new Block(0, "0", [], 0, "0");
    }

    private getLatestBlock(): Block {
        const latestBlock = this.chain[this.chain.length - 1];
        if (!latestBlock) {
            throw new Error("Chain is empty");
        }
        return latestBlock;
    }

    private mineBlock(block: Block): void {
        while (block.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0")) {
            block.nonce++;
            block.hash = block.calculateHash();
        }
    }

    public createTransaction(transaction: Transaction): number {
        if (!transaction.isValid()) {
            throw new Error("Invalid transaction");
        }
        this.pendingTransactions.push(transaction);
        return this.getLatestBlock().index + 1;
    }

    public minePendingTransactions(miningRewardAddress: string): void {
        const rewardTx = new Transaction("", miningRewardAddress, 1);
        this.pendingTransactions.push(rewardTx);

        const block = new Block(
            this.getLatestBlock().index + 1,
            this.getLatestBlock().hash,
            this.pendingTransactions,
            0,
            ""
        );

        this.mineBlock(block);
        this.chain.push(block);
        this.pendingTransactions = [];
    }

    public getBalanceOfAddress(address: string): number {
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

    public isChainValid(): boolean {
        if (this.chain.length === 0) return false;

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock || !previousBlock) return false;
            if (!currentBlock.isValid()) return false;
            if (currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }
} 