import CouponManager from "@/components/admin/payments/CouponManager";
import PaymentConfigurationScreen from "@/components/admin/payments/PaymentConfiguration";
import { colors } from "@/styles/colors";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PaymentsScreen() {
    const [activeTab, setActiveTab] = useState<"CONFIG" | "COUPONS">("CONFIG");

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Payments</Text>
                <Text style={styles.subtitle}>Configure settings & discounts</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "CONFIG" && styles.activeTab]}
                    onPress={() => setActiveTab("CONFIG")}
                >
                    <Text style={[styles.tabText, activeTab === "CONFIG" && styles.activeTabText]}>
                        Methods & Config
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "COUPONS" && styles.activeTab]}
                    onPress={() => setActiveTab("COUPONS")}
                >
                    <Text style={[styles.tabText, activeTab === "COUPONS" && styles.activeTabText]}>
                        Coupons
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {activeTab === "CONFIG" ? (
                    <PaymentConfigurationScreen />
                ) : (
                    <CouponManager />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: colors.textDark,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textLight,
        fontWeight: "500",
    },
    tabContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textLight,
    },
    activeTabText: {
        color: colors.primary,
    },
    content: {
        flex: 1,
    },
});