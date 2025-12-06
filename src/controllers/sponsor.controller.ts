import type { Request, Response } from 'express';
import { SuiService } from '../service.js';

const suiService = new SuiService();

export const sponsorTransactionController = async (req: Request, res: Response) => {
    try {
        const { txBytes, signature } = req.body;

        if (!txBytes || !signature) {
            res.status(400).json({ error: 'Missing required fields: txBytes, signature' });
            return;
        }

        // Validate types if necessary (basic check)
        if (typeof txBytes !== 'string' || typeof signature !== 'string') {
            res.status(400).json({ error: 'Invalid field types. Both txBytes and signature must be strings.' });
            return;
        }

        console.log("Received sponsorship request");

        const result = await suiService.sponsorAndExecuteTransaction(txBytes, signature);

        console.log("Transaction executed successfully:", result.digest);
        res.json(result);

    } catch (error: any) {
        console.error("Sponsorship failed:", error);
        res.status(500).json({
            error: 'Transaction execution failed',
            details: error.message || error
        });
    }
};
