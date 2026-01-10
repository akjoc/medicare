import { Coupon, MOCK_COUPONS } from '@/data/coupons';

// Simulate storage
let localCoupons = [...MOCK_COUPONS];

export const CouponService = {
    getAllCoupons: async (): Promise<Coupon[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return [...localCoupons];
    },

    createCoupon: async (coupon: Omit<Coupon, 'id' | 'usageCount'>): Promise<Coupon> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newCoupon: Coupon = {
            ...coupon,
            id: Math.random().toString(36).substr(2, 9),
            usageCount: 0,
        };
        localCoupons.push(newCoupon);
        return newCoupon;
    },

    updateCoupon: async (id: string, updates: Partial<Coupon>): Promise<Coupon> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const index = localCoupons.findIndex((c) => c.id === id);
        if (index === -1) throw new Error('Coupon not found');

        localCoupons[index] = { ...localCoupons[index], ...updates };
        return localCoupons[index];
    },

    deleteCoupon: async (id: string): Promise<void> => {
        // In this requirement, "Disable" is mostly used, but soft delete or hard delete logic here.
        // For now, let's assume this deletes it from the list or we can just use update to set active=false
        await new Promise((resolve) => setTimeout(resolve, 600));
        localCoupons = localCoupons.filter(c => c.id !== id);
    }
};
