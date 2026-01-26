import AppHeader from "@/components/AppHeader";
import { getUser } from "@/services/auth.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminLayout() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const user = await getUser();
            if (user?.role === "admin") {
                setIsAuthorized(true);
            } else if (user?.role === "retailer") {
                router.replace("/(retailer)/home");
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
            <AppHeader />

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
                <Tabs.Screen
                    name="orders/index"
                    options={{
                        title: "Orders",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="receipt-outline" color={color} size={size} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="orders/[id]"
                    options={{
                        href: null,
                    }}
                />

                <Tabs.Screen
                    name="products"
                    options={{
                        title: "Products",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="cube-outline" color={color} size={size} />
                        ),
                    }}
                />

                <Tabs.Screen
                    // name="retailers/index"
                    name="retailers"
                    options={{
                        title: "Retailers",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="people-outline" color={color} size={size} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="payments/index"
                    options={{
                        title: "Payments",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="card-outline" color={color} size={size} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="account"
                    options={{
                        title: "Account",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="person-outline" color={color} size={size} />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}
