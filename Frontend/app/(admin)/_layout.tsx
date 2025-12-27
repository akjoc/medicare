import AppHeader from "@/components/AppHeader";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminLayout() {
    const insets = useSafeAreaInsets();

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
                    name="products/index"
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
                    name="account/index"
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
