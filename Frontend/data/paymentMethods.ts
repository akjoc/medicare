export interface PaymentConfiguration {
    codEnabled: boolean;
    codNote: string;
    advancePaymentEnabled: boolean;
    advancePaymentInstruction: string;
    advancePaymentMethods: {
        upiQr: {
            enabled: boolean;
            upiId: string;
            qrCodeUrl: string;
        };
        bankTransfer: {
            enabled: boolean;
            bankName: string;
            accountNumber: string;
            ifscCode: string;
            accountHolderName: string;
        };
    };
    discount: {
        enabled: boolean;
        type: 'PERCENT' | 'FLAT';
        value: number;
        description: string;
    };
}

export const MOCK_PAYMENT_CONFIG: PaymentConfiguration = {
    codEnabled: true,
    codNote: "Pay cash upon delivery.",
    advancePaymentEnabled: true,
    advancePaymentInstruction: "Please share the payment screenshot with your Order ID on WhatsApp after payment.",
    advancePaymentMethods: {
        upiQr: {
            enabled: true,
            upiId: "test@lorem.com",
            qrCodeUrl: "https://res.cloudinary.com/dhvch5umt/image/upload/v1769287921/medicare_products/eoxttamernopt0gbuayh.jpg"
        },
        bankTransfer: {
            enabled: true,
            bankName: "ICICI",
            accountNumber: "308348601588",
            ifscCode: "ICIC00016",
            accountHolderName: "Test"
        }
    },
    discount: {
        enabled: true,
        type: "PERCENT",
        value: 5,
        description: "Save 5% on Advance payments"
    }
};
