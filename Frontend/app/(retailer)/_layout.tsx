import { CartProvider, useCart } from "@/context/CartContext";
import { getUser } from "@/services/auth.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function RetailerTabs() {
    const insets = useSafeAreaInsets();
    const { items } = useCart();

    // Calculate total items (sum of quantities)
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: "#8e8e93",
                tabBarStyle: {
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 6,
                },
            }}
        >
            {/* HOME */}
            <Tabs.Screen
                name="home/index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* SEARCH */}
            <Tabs.Screen
                name="search/index"
                options={{
                    title: "Search",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* CART */}
            <Tabs.Screen
                name="cart"
                options={{
                    title: "Cart",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cart-outline" size={size} color={color} />
                    ),
                    tabBarBadge: cartCount > 0 ? cartCount : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: "#EF4444",
                        color: "white",
                        fontSize: 10,
                        fontWeight: 'bold',
                    }
                }}
            />

            {/* CATEGORIES */}
            <Tabs.Screen
                name="categories/index"
                options={{
                    title: "Categories",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* ACCOUNT */}
            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* HIDE THESE ROUTES FROM TABS */}
            <Tabs.Screen
                name="categories/[id]"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="product/[id]"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="orders/index"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="orders/[id]"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}

export default function RetailerLayout() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const user = await getUser();
            if (user?.role === "retailer") {
                setIsAuthorized(true);
            } else if (user?.role === "admin") {
                router.replace("/(admin)/orders");
            } else {
                router.replace("/(auth)/login");
            }
        };
        checkAuth();
    }, []);

    if (isAuthorized === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <CartProvider>
                <RetailerTabs />
            </CartProvider>
        </View>
    );
}
