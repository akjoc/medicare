import { CartProvider } from "@/context/CartContext";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RetailerLayout() {
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <CartProvider>
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
                        name="cart/index"
                        options={{
                            title: "Cart",
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="cart-outline" size={size} color={color} />
                            ),
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
                        name="account/index"
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
                </Tabs>
            </CartProvider>
        </View>
    );
}
