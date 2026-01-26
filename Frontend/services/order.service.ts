import { privateClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoint';

export interface CreateOrderPayload {
    address: string;
    paymentMethod: 'COD' | 'ONLINE';
    cartItems: {
        productId: number;
        quantity: number;
    }[];
    itemTotal: number;
    deliveryFee: string | number;
    couponDiscount: number;
    paymentDiscount: number;
    toPay: number | string;
    couponCode: string | null;
}

export const OrderService = {
    placeOrder: async (payload: CreateOrderPayload) => {
        try {
            const response = await privateClient.post(ENDPOINTS.CREATE_ORDER, payload);
            return response.data;
        } catch (error) {
            console.error("Error placing order:", error);
            throw error;
        }
    },

    getUserOrders: async () => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_USER_ORDERS);
            return response.data;
        } catch (error) {
            console.error("Error fetching user orders:", error);
            throw error;
        }
    },

    getAllOrders: async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_ALL_ORDERS, { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching all orders:", error);
            throw error;
        }
    },

    getOrderById: async (id: string) => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_ORDER_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${id}:`, error);
            throw error;
        }
    },

    uploadInvoice: async (orderId: string, file: any) => {
        try {
            const formData = new FormData();
            formData.append('invoice', file);

            const response = await privateClient.post(ENDPOINTS.UPLOAD_ORDER_INVOICE(orderId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Error uploading invoice for order ${orderId}:`, error);
            throw error;
        }
    },

    updatePaymentStatus: async (orderId: string, status: 'approved' | 'rejected') => {
        try {
            const response = await privateClient.put(ENDPOINTS.UPDATE_PAYMENT_STATUS(orderId), { status });
            return response.data;
        } catch (error) {
            console.error(`Error updating payment status for order ${orderId}:`, error);
            throw error;
        }
    },

    updateOrderStatus: async (orderId: string, status: string) => {
        try {
            const response = await privateClient.put(ENDPOINTS.UPDATE_ORDER_STATUS(orderId), { status });
            return response.data;
        } catch (error) {
            console.error(`Error updating order status for order ${orderId}:`, error);
            throw error;
        }
    },

    rateOrder: async (orderId: string, rating: number) => {
        try {
            const response = await privateClient.put(ENDPOINTS.ORDER_RETAILER_RATING(orderId), { rating });
            return response.data;
        } catch (error) {
            console.error(`Error rating order ${orderId}:`, error);
            throw error;
        }
    }
};
