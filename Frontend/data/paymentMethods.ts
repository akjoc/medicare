export interface PaymentConfiguration {
    id: number;
    codEnabled: boolean;
    codNote: string;
    advancePaymentEnabled: boolean;
    advancePaymentInstruction: string;
    upiQrEnabled: boolean;
    bankTransferEnabled: boolean;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    upiId: string;
    qrCodeUrl: string;
    qrCodePublicId: string;
    advancePaymentDiscountEnabled: boolean;
    discountType: 'PERCENT' | 'FLAT';
    discountValue: number;
    discountDescription: string;
    createdAt?: string;
    updatedAt?: string;
}

export const MOCK_PAYMENT_CONFIG: PaymentConfiguration = {
    id: 1,
    codEnabled: true,
    codNote: "Pay cash upon delivery.",
    advancePaymentEnabled: true,
    advancePaymentInstruction: "Please share the payment screenshot with your Order ID on WhatsApp after payment.",
    upiQrEnabled: true,
    bankTransferEnabled: false,
    bankName: "ICICI",
    accountNumber: "308348601588",
    ifscCode: "ICIC00016",
    accountHolderName: "Test",
    upiId: "test@lorem.com",
    qrCodeUrl: "https://res.cloudinary.com/dhvch5umt/image/upload/v1769105665/medicare_products/avxpn4knrvpauldsmdwn.jpg",
    qrCodePublicId: "medicare_products/avxpn4knrvpauldsmdwn",
    advancePaymentDiscountEnabled: true,
    discountType: "PERCENT",
    discountValue: 5,
    discountDescription: "null",
    createdAt: "2026-01-22T17:37:19.000Z",
    updatedAt: "2026-01-22T18:14:36.000Z"
};
