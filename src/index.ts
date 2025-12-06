import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { CONFIG } from './config.js';
import { sponsorTransactionController } from './controllers/sponsor.controller.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/sponsor', sponsorTransactionController);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', network: CONFIG.SUI_NETWORK });
});

const PORT = CONFIG.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Targeting Network: ${CONFIG.SUI_NETWORK}`);
});
