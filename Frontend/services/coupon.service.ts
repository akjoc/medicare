import { privateClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoint';
import { Coupon } from '@/data/coupons';

export interface CouponResponse {
    coupons: Coupon[];
    totalCoupons: number;
    totalPages: number;
    currentPage: number;
}

export const CouponService = {
    getAllCoupons: async (page = 1, limit = 20): Promise<CouponResponse> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_COUPONS, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching coupons:", error);
            throw error;
        }
    },

    createCoupon: async (coupon: any): Promise<Coupon> => {
        try {
            const response = await privateClient.post(ENDPOINTS.CREATE_COUPON, coupon);
            return response.data;
        } catch (error) {
            console.error("Error creating coupon:", error);
            throw error;
        }
    },

    updateCoupon: async (id: string, updates: any): Promise<Coupon> => {
        try {
            const response = await privateClient.put(ENDPOINTS.UPDATE_COUPON(id), updates);
            return response.data;
        } catch (error) {
            console.error("Error updating coupon:", error);
            throw error;
        }
    },

    toggleCouponStatus: async (id: string): Promise<void> => {
        try {
            await privateClient.patch(ENDPOINTS.TOGGLE_COUPON_STATUS(id));
        } catch (error) {
            console.error("Error toggling coupon status:", error);
            throw error;
        }
    },

    deleteCoupon: async (id: string): Promise<void> => {
        try {
            await privateClient.delete(ENDPOINTS.DELETE_COUPON(id));
        } catch (error) {
            console.error("Error deleting coupon:", error);
            throw error;
        }
    }
};
