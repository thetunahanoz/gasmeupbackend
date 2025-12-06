import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromBase64 } from '@mysten/sui/utils';
import { CONFIG } from './config.js';
export class SuiService {
    client;
    keypair;
    constructor() {
        const rpcUrl = getFullnodeUrl(CONFIG.SUI_NETWORK);
        this.client = new SuiClient({ url: rpcUrl });
        if (!CONFIG.BACKEND_PRIVATE_KEY || CONFIG.BACKEND_PRIVATE_KEY.startsWith('suiprivkey1...')) {
            console.warn('Backend Private Key not set. Transactions will fail.');
            // Generate a dummy keypair to prevent crash on startup, but execution will fail
            this.keypair = new Ed25519Keypair();
        }
        else {
            try {
                this.keypair = Ed25519Keypair.fromSecretKey(CONFIG.BACKEND_PRIVATE_KEY);
            }
            catch (e) {
                console.error("Failed to load private key", e);
                throw new Error("Invalid Private Key configuration");
            }
        }
    }
    getAddress() {
        return this.keypair.getPublicKey().toSuiAddress();
    }
    /**
     * Sponsors a transaction by signing it as the gas payer and executing it.
     * Assumes the transaction was constructed with the Backend Address as the Gas Payer.
     *
     * @param txBytesBase64 Transaction bytes encoded in Base64
     * @param userSignatureBase64 User's signature encoded in Base64
     */
    async sponsorAndExecuteTransaction(txBytesBase64, userSignatureBase64) {
        try {
            const txBytes = fromBase64(txBytesBase64);
            // 1. Reconstruct Transaction to verify or debug (Optional, but good for logging)
            const tx = Transaction.from(txBytes);
            // Check if GasPayer is set to us? 
            // The transaction block data should have the gasConfig.payer set to this.getAddress()
            // However, we can't easily inspect the 'sender' vs 'payer' deeply without parsing the block data structure manually 
            // or trusting the flow.
            // 2. Sign the transaction bytes as the Gas Payer (and potentially Sender if we were sending, but we are just paying)
            // SUI SDK allows signing the bytes directly.
            const { signature: backendSignature } = await this.keypair.signTransaction(txBytes);
            // 3. Execute the transaction block
            // We need to provide both signatures.
            // The order usually doesn't matter for the execution endpoint, but usually it is [sender, payer] or just a list.
            const response = await this.client.executeTransactionBlock({
                transactionBlock: txBytes,
                signature: [userSignatureBase64, backendSignature],
                options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                }
            });
            return {
                digest: response.digest,
                status: response.effects?.status.status,
                details: response
            };
        }
        catch (error) {
            console.error("Transaction execution failed:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=service.js.map