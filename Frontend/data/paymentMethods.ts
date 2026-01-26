export interface AdminPaymentConfiguration {
    id: number;
    codEnabled: boolean;
    codNote: string;
    advancePaymentEnabled: boolean;
    advancePaymentInstruction: string;
    upiQrEnabled: boolean;
    bankTransferEnabled: boolean;
    bankName: string | null;
    accountNumber: string | null;
    ifscCode: string | null;
    accountHolderName: string | null;
    upiId: string | null;
    qrCodeUrl: string | null;
    advancePaymentDiscountEnabled: boolean;
    discountType: 'PERCENT' | 'FLAT';
    discountValue: number;
    discountDescription: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface RetailerPaymentConfiguration {
    codEnabled: boolean;
    codNote: string | null;
    advancePaymentEnabled: boolean;
    advancePaymentInstruction: string | null;
    advancePaymentMethods: {
        upiQr: {
            enabled: boolean;
            upiId: string;
            qrCodeUrl: string;
        } | null;
        bankTransfer: {
            enabled: boolean;
            bankName: string;
            accountNumber: string;
            ifscCode: string;
            accountHolderName: string;
        } | null;
    } | null;
    discount: {
        enabled: boolean;
        type: 'PERCENT' | 'FLAT';
        value: number;
        description: string;
    };
}

// Keep the old name as an alias for now if needed, or update everywhere
// export type PaymentConfiguration = RetailerPaymentConfiguration;

export const MOCK_PAYMENT_CONFIG: RetailerPaymentConfiguration = {
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
