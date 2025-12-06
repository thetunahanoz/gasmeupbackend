export declare class SuiService {
    private client;
    private keypair;
    constructor();
    getAddress(): string;
    /**
     * Sponsors a transaction by signing it as the gas payer and executing it.
     * Assumes the transaction was constructed with the Backend Address as the Gas Payer.
     *
     * @param txBytesBase64 Transaction bytes encoded in Base64
     * @param userSignatureBase64 User's signature encoded in Base64
     */
    sponsorAndExecuteTransaction(txBytesBase64: string, userSignatureBase64: string): Promise<{
        digest: string;
        status: "success" | "failure" | undefined;
        details: import("@mysten/sui/client").SuiTransactionBlockResponse;
    }>;
}
//# sourceMappingURL=service.d.ts.map