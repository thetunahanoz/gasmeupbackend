import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
    PORT: process.env.PORT || 3000,
    SUI_NETWORK: process.env.SUI_NETWORK || 'testnet',
    BACKEND_PRIVATE_KEY: process.env.BACKEND_PRIVATE_KEY || '',
};
