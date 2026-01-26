import { getUser } from "@/services/auth.service";
import { cartService } from "@/services/cart.service";
import { CouponService } from "@/services/coupon.service";
import { APICartItem, APIProduct } from "@/types/api";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

export type CartItem = APICartItem & { Product: APIProduct };

export interface AppliedCoupon {
    code: string;
    discount: number; // Server-calculated discount amount
}

interface CartContextType {
    items: CartItem[];
    isLoading: boolean;
    appliedCoupon: AppliedCoupon | null;
    addToCart: (productId: number, quantity?: number) => Promise<void>;
    removeFromCart: (cartItemId: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getItemQuantity: (productId: number) => number;
    refreshCart: () => Promise<void>;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

    const refreshCart = async () => {
        setIsLoading(true);
        try {
            const cart = await cartService.getCart();
            setItems(cart.CartItems || []);
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load cart on mount
    useEffect(() => {
        refreshCart();
    }, []);

    const validateAndApplyCoupon = useCallback(async (code: string, currentItems: CartItem[]) => {
        try {
            const user = await getUser();
            if (!user) return;


            const subtotal = currentItems.reduce((sum, item) => {
                const price = Number(item.Product.price);
                const salePrice = item.Product.salePrice ? Number(item.Product.salePrice) : 0;
                const effectivePrice = salePrice > 0 ? salePrice : price;
                return sum + effectivePrice * item.quantity;
            }, 0);

            const payload = {
                code,
                retailerId: user.retailerId,
                orderValue: subtotal,
                cartItems: currentItems.map(item => {
                    // Extract category IDs from the Categories array provided by the backend
                    let categoryIds: number[] = [];
                    const product = item.Product as any;

                    if (product.Categories && Array.isArray(product.Categories)) {
                        categoryIds = product.Categories.map((cat: any) => Number(cat.id));
                    } else if (product.CategoryId) {
                        categoryIds = [Number(product.CategoryId)];
                    } else if (product.Category?.id) {
                        categoryIds = [Number(product.Category.id)];
                    }

                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        categoryId: categoryIds,
                        price: item.Product.price,
                        salePrice: item.Product.salePrice
                    };
                })
            };

            const result = await CouponService.applyCoupon(payload);
            setAppliedCoupon({
                code,
                discount: result.discountAmount // Always use the amount returned by backend
            });
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Coupon is no longer valid";
            setAppliedCoupon(null);
            Alert.alert("Coupon Removed", errorMessage);
            return false;
        }
    }, []);

    const applyCoupon = async (code: string) => {
        await validateAndApplyCoupon(code, items);
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
    };

    const addToCart = async (productId: number, quantity: number = 1) => {
        try {
            await cartService.addToCart(productId, quantity);
            const cart = await cartService.getCart();
            const newItems = cart.CartItems || [];
            setItems(newItems);

            if (appliedCoupon) {
                await validateAndApplyCoupon(appliedCoupon.code, newItems);
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to add to cart");
        }
    };

    const removeFromCart = async (cartItemId: number) => {
        try {
            await cartService.removeItem(cartItemId.toString());
            const cart = await cartService.getCart();
            const newItems = cart.CartItems || [];
            setItems(newItems);

            if (appliedCoupon) {
                await validateAndApplyCoupon(appliedCoupon.code, newItems);
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to remove item");
        }
    };

    const updateQuantity = async (productId: number, quantity: number) => {
        if (quantity < 1) {
            const item = items.find(i => i.productId === productId);
            if (item) {
                await removeFromCart(item.id);
            }
            return;
        }
        try {
            await cartService.updateCart(productId, quantity);
            await refreshCart();
            // Note: Per user request, we don't auto-validate coupon on quantity update
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.error || "Failed to update quantity");
        }
    };

    const clearCart = async () => {
        try {
            await cartService.clearCart();
            setItems([]);
            setAppliedCoupon(null);
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to clear cart");
        }
    };

    const getItemQuantity = (productId: number) => {
        return items.find((item) => item.productId === productId)?.quantity || 0;
    };

    return (
        <CartContext.Provider
            value={{
                items,
                isLoading,
                appliedCoupon,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getItemQuantity,
                refreshCart,
                applyCoupon,
                removeCoupon,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
