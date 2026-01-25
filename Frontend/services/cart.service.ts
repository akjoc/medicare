import { privateClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoint";
import { APICart } from "../types/api";

export const cartService = {
    getCart: async (): Promise<APICart> => {
        const response = await privateClient.get(ENDPOINTS.GET_CART);
        return response.data;
    },

    addToCart: async (productId: number, quantity: number): Promise<void> => {
        await privateClient.post(ENDPOINTS.ADD_TO_CART, { productId, quantity });
    },

    updateCart: async (productId: number, quantity: number): Promise<void> => {
        await privateClient.put(ENDPOINTS.UPDATE_CART, { productId, quantity });
    },

    removeItem: async (cartItemId: string): Promise<void> => {
        await privateClient.delete(ENDPOINTS.REMOVE_SPECIFIC_ITEM_FROM_CART(cartItemId));
    },

    clearCart: async (): Promise<void> => {
        await privateClient.delete(ENDPOINTS.CLEAR_CART);
    },
};
