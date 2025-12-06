import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';

// Configuration
const BACKEND_URL = 'http://localhost:3001/sponsor';
const NETWORK = 'testnet'; // Ensure this matches backend

async function main() {
    // 1. Setup Client and User Keypair
    const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });
    const userKeypair = new Ed25519Keypair();
    const userAddress = userKeypair.getPublicKey().toSuiAddress();

    console.log(`User Address: ${userAddress}`);
    console.log('Use a faucet to get coins if needed, but for dry-run/sponsor check we might need balance to even sign? No.');

    // 2. Construct Transaction
    const tx = new Transaction();
    // Simple move call or just invalid one to test the flow
    // let's do a dummy split coin equivalent or just transfer 0 to self
    /*
    const [coin] = tx.splitCoins(tx.gas, [100]);
    tx.transferObjects([coin], userAddress);
    */
    // Since we don't have coins, let's just create an empty transaction?
    // Empty transaction might be invalid.
    // We need at least one command?
    // If the user has NO coins, they can't even have a gas object to split.
    // BUT the gas can be provided by the sponsor.
    // The "gas" input to the transaction is the Gas Object.

    // CRITICAL: For sponsored transaction, the User constructs the transaction, 
    // BUT the gasPayment object must be set.
    // If the backend is paying, the backend must provide the gas object ID to be used?
    // OR we use the "GasStation" standard where:
    // 1. User asks Backend for a Gas Object.
    // 2. Backend reserves one and sends to User.
    // 3. User makes tx with that gas object, signs.
    // 4. Backend signs.

    // Re-reading user request: "Backend... will pay the gas fee". "Receives { txBytes, signature }".
    // If the user constructed the bytes, the user MUST have put *some* gas object in it.
    // If usage of backend wallet is implied, maybe the Backend *Replaces* the gas object?
    // No, you can't modify the transaction after signature.

    // Thus, the only robust way (without 2 round trips) is if:
    // A) The user *knows* the backend's gas object ID (not just address) beforehand.
    // B) Or the "txBytes" is actually just the *intent* and the backend builds it? No, user signs.

    // WAIT. If the gas payer is different from the sender, the valid gas object must belong to the gas payer.
    // The user needs to set `tx.setGasOwner(backendAddress)` AND provide the specific Gas Object Reference.
    // Typically, the Gas Object ID must be known.

    // IF the user *doesn't* know the gas object, they can't build the final bytes to sign.
    // SO, there might be a missing step in the user's prompt or simple misunderstanding.
    // BUT, assuming the user *can* construct it, let's just make a valid construction.
    // We will assume for this TEST that we just want to test the endpoint connectivity and signature logic.
    // We won't succeed on-chain unless we have a real gas object.

    // We will mock the gas object setting if possible or just try to send what we have.
    tx.setSender(userAddress);

    // Pretend we know the backend address (PLACEHOLDER)
    // In a real app, user might GET /config to find the address.
    // For this test, we can just skip setting gas owner and see if backend fails or we just test the signature part.
    // If we want to simulate the backend paying, we set gas owner.
    // But we need a gas object ID.

    console.log("Constructing transaction...");
    // Just a basic tx

    const txBytes = await tx.build({ client, onlyTransactionKind: true });
    // WARNING: If we build `onlyTransactionKind`, we get bytes that *need* gas configuration.
    // If we send `TransactionBlock` bytes (full), it needs gas.

    // If the user sends `txBytes`, they usually send the full built transaction buffer.
    // If the backend is doing the gas, maybe the backend accepts `TransactionKind` bytes?
    // User Prompt: "txBytes is a string containing the transaction as Base64 encoded."
    // "containing the transaction".

    // Let's assume the user sends the full transaction.
    // We will build it normally. But we need a gas object.
    // Checking if we can build without gas object if we are not executing yet?
    // `tx.build` requires gas unless `onlyTransactionKind` is true.

    // If `onlyTransactionKind` is true, the user signs the *Kind*?
    // No, execution requires signing the full data.

    // Let's try to build with `client` but assume we might fail getting gas if we have no coins.
    try {
        // This simulates a user who HAS some dust or we mock it.
        // If we can't build, we can't test.
        // We'll just create a dummy byte array to test endpoint validation if build fails.
        const bytes = await tx.build({ client });
        const signature = (await userKeypair.signTransaction(bytes)).signature;

        await sendSponsorRequest(toBase64(bytes), signature);

    } catch (e) {
        console.warn("Could not build valid real transaction (no coins?), sending dummy data to test endpoint validation.");
        await sendSponsorRequest("dummy_tx_bytes", "dummy_signature");
    }
}

async function sendSponsorRequest(txBytes: string, signature: string) {
    try {
        const res = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txBytes, signature })
        });

        const data = await res.json();
        console.log('Response:', res.status, data);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

main().catch(console.error);
