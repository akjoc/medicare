export interface BankDetails {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
}

export interface UPIConfig {
    upiId: string;
    qrCodeUrl: string; // Mock URL
}

export interface AdvancePaymentConfig {
    enabled: boolean;
    methods: {
        upi: {
            enabled: boolean;
            config: UPIConfig;
        };
        bankTransfer: {
            enabled: boolean;
            config: BankDetails;
        };
    };
    instructions: string;
}

export interface CODConfig {
    enabled: boolean;
    note?: string;
}

export interface PaymentDiscount {
    enabled: boolean;
    type: 'PERCENTAGE' | 'FLAT';
    value: number;
    description: string;
}

export interface PaymentConfiguration {
    cod: CODConfig;
    advance: AdvancePaymentConfig;
    discount: PaymentDiscount;
}

export const MOCK_PAYMENT_CONFIG: PaymentConfiguration = {
    cod: {
        enabled: true,
        note: "Pay cash upon delivery.",
    },
    advance: {
        enabled: true,
        instructions: "Please share the payment screenshot with your Order ID on WhatsApp after payment.",
        methods: {
            upi: {
                enabled: true,
                config: {
                    upiId: "medicare@okhdfcbank",
                    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=medicare@okhdfcbank",
                },
            },
            bankTransfer: {
                enabled: true,
                config: {
                    bankName: "HDFC Bank",
                    accountNumber: "50100123456789",
                    ifscCode: "HDFC0001234",
                    accountHolderName: "Health Harbour Distributors Pvt Ltd",
                },
            },
        },
    },
    discount: {
        enabled: true,
        type: 'PERCENTAGE',
        value: 5,
        description: "5% off on total bill when paid in advance",
    },
};
