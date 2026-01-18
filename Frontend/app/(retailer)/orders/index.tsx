import { MOCK_ORDERS } from "@/data/mockOrders";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RetailerOrdersScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    // Filter orders for the current retailer (assuming retailer ID "1")
    const retailerOrders = MOCK_ORDERS.filter(order => order.retailerId === "1" || order.retailerId === "89283"); // including mock ID 89283 just in case

    const filteredOrders = retailerOrders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered": return "#16A34A";
            case "processing": return "#2563EB";
            case "cancelled": return "#DC2626";
            case "pending": return "#D97706";
            default: return "#6B7280";
        }
    };

    const renderOrderItem = ({ item }: { item: typeof MOCK_ORDERS[0] }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push(`/(retailer)/orders/${item.id}`)}
        >
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderId}>Order #{item.id}</Text>
                    <Text style={styles.orderDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderSummary}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Items</Text>
                    <Text style={styles.summaryValue}>{item.items.length}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Amount</Text>
                    <Text style={styles.summaryValue}>₹{item.totalAmount.toLocaleString()}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/(retailer)/account")} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={colors.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by Order ID"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredOrders}
                renderItem={renderOrderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={64} color={colors.textLight} />
                        <Text style={styles.emptyText}>No orders found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textDark,
    },
    searchContainer: {
        padding: 16,
        backgroundColor: colors.white,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 44,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: colors.textDark,
    },
    listContent: {
        padding: 16,
        gap: 16,
    },
    orderCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: colors.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    orderId: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.textDark,
    },
    orderDate: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
    },
    orderSummary: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    summaryItem: {
        alignItems: "flex-start",
    },
    summaryLabel: {
        fontSize: 12,
        color: colors.textLight,
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 12,
        gap: 4
    },
    viewDetailsText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.primary
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        gap: 16,
    },
    emptyText: {
        color: colors.textLight,
        fontSize: 16,
    },
});
