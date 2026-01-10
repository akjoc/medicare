import { MOCK_PAYMENT_CONFIG, PaymentConfiguration } from '@/data/paymentMethods';

// Simulate a database/server-side storage
let currentConfig = { ...MOCK_PAYMENT_CONFIG };

export const PaymentService = {
    getConfiguration: async (): Promise<PaymentConfiguration> => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return JSON.parse(JSON.stringify(currentConfig));
    },

    updateConfiguration: async (newConfig: PaymentConfiguration): Promise<PaymentConfiguration> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        currentConfig = { ...newConfig };
        return JSON.parse(JSON.stringify(currentConfig));
    },
};
