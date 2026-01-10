export type DiscountType = 'PERCENTAGE' | 'FLAT';

export interface Coupon {
    id: string;
    code: string;
    discountType: DiscountType;
    value: number;
    expiryDate: string; // ISO Date string
    usageLimit: number;
    usageCount: number;
    isActive: boolean;
    description?: string;
    categoryId?: string; // Optional: Apply to specific category
    retailerId?: string; // Optional: Apply to specific retailer
}

export const MOCK_COUPONS: Coupon[] = [
    {
        id: '1',
        code: 'WELCOME50',
        discountType: 'FLAT',
        value: 50,
        expiryDate: '2025-12-31T23:59:59Z',
        usageLimit: 1000,
        usageCount: 156,
        isActive: true,
        description: 'Flat ₹50 off for new users',
    },
    {
        id: '2',
        code: 'SAVE10',
        discountType: 'PERCENTAGE',
        value: 10,
        expiryDate: '2025-06-30T23:59:59Z',
        usageLimit: 500,
        usageCount: 42,
        isActive: true,
        description: '10% off on all medicines',
    },
    {
        id: '3',
        code: 'BULK20',
        discountType: 'PERCENTAGE',
        value: 20,
        expiryDate: '2025-03-31T23:59:59Z',
        usageLimit: 100,
        usageCount: 98,
        isActive: false,
        description: '20% off on bulk orders over ₹5000',
    },
];
