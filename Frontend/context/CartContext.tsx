import { APIProduct } from "@/types/api";
import React, { createContext, useContext, useState } from "react";

export interface CartItem {
    product: APIProduct;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: APIProduct) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getItemQuantity: (productId: string | number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

// ... existing imports

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from storage on mount
    useEffect(() => {
        const loadCart = async () => {
            try {
                const storedCart = await AsyncStorage.getItem("cart");
                if (storedCart) {
                    setItems(JSON.parse(storedCart));
                }
            } catch (error) {
                console.error("Failed to load cart from storage", error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadCart();
    }, []);

    // Save cart to storage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            AsyncStorage.setItem("cart", JSON.stringify(items)).catch((error) =>
                console.error("Failed to save cart to storage", error)
            );
        }
    }, [items, isLoaded]);

    const addToCart = (product: APIProduct) => {
        setItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.product.id === product.id);
            if (existingItem) {
                return currentItems.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...currentItems, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        // Convert to number for comparison since APIProduct id is number
        const idNum = Number(productId);
        setItems((currentItems) => currentItems.filter((item) => item.product.id !== idNum));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        const idNum = Number(productId);
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.product.id === idNum ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const getItemQuantity = (productId: string | number) => {
        const idNum = Number(productId);
        return items.find((item) => item.product.id === idNum)?.quantity || 0;
    };

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getItemQuantity,
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
