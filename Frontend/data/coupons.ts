export type DiscountType = 'percent' | 'flat';

export interface Coupon {
    _id: string;
    id: string; // Keep for backward compatibility if needed, but we'll use _id
    code: string;
    type: DiscountType;
    value: number;
    expiryDate: string; // ISO Date string
    usageLimit: number;
    usageCount: number;
    isActive: boolean;
    description?: string;
    shortDescription?: string;
    categoryIds?: string[]; // Array of IDs
    retailerIds?: string[]; // Array of IDs
    categoryId?: string; // Legacy field
    retailerId?: string; // Legacy field
}

export const MOCK_COUPONS: Coupon[] = [
    {
        _id: '1',
        id: '1',
        code: 'WELCOME50',
        type: 'flat',
        value: 50,
        expiryDate: '2025-12-31T23:59:59Z',
        usageLimit: 1000,
        usageCount: 156,
        isActive: true,
        description: 'Flat ₹50 off for new users',
    },
    {
        _id: '2',
        id: '2',
        code: 'SAVE10',
        type: 'percent',
        value: 10,
        expiryDate: '2025-06-30T23:59:59Z',
        usageLimit: 500,
        usageCount: 42,
        isActive: true,
        description: '10% off on all medicines',
    },
    {
        _id: '3',
        id: '3',
        code: 'BULK20',
        type: 'percent',
        value: 20,
        expiryDate: '2025-03-31T23:59:59Z',
        usageLimit: 100,
        usageCount: 98,
        isActive: false,
        description: '20% off on bulk orders over ₹5000',
    },
];
