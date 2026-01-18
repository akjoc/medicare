import { MOCK_ORDERS, Order, OrderStatus } from "@/data/mockOrders";
import { colors } from "@/styles/colors";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const STATUS_COLORS: Record<OrderStatus, string> = {
    "Awaiting Payment Confirmation": "#F59E0B", // Amber
    Processing: "#3B82F6", // Blue
    Packed: "#8B5CF6", // Purple
    "Out for Delivery": "#F97316", // Orange
    Delivered: "#10B981", // Green
    Cancelled: "#EF4444", // Red
};

export default function OrdersScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");

    const filteredOrders = useMemo(() => {
        return MOCK_ORDERS.filter((order) => {
            const matchesSearch =
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.retailerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.shopName.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "All" || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    const renderOrderItem = ({ item }: { item: Order }) => {
        const getStatusIconName = (status: OrderStatus) => {
            switch (status) {
                case "Awaiting Payment Confirmation": return "alert-circle";
                case "Processing": return "time";
                case "Packed": return "cube";
                case "Out for Delivery": return "bicycle"; // Using bicycle for delivery/truck equivalent in Ionicons if needed, or stick to generic
                case "Delivered": return "checkmark-circle";
                case "Cancelled": return "close-circle";
                default: return "help-circle";
            }
        };

        const getPaymentIconName = (method: string) => {
            switch (method) {
                case "COD": return "cash-outline";
                case "UPI": return "phone-portrait-outline";
                case "Bank Transfer": return "card-outline";
                default: return "card-outline";
            }
        };

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    item.status === "Awaiting Payment Confirmation" && styles.cardHighlight
                ]}
                onPress={() => router.push(`/(admin)/orders/${item.id}` as any)}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.orderIdContainer}>
                        <Text style={styles.orderId}>#{item.id}</Text>
                        <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + "20" }]}>
                        <Icon name={getStatusIconName(item.status) as any} size={14} color={STATUS_COLORS[item.status]} />
                        <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.retailerName}>{item.retailerName}</Text>
                    <Text style={styles.shopName}>{item.shopName}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Icon name={getPaymentIconName(item.paymentMethod) as any} size={14} color={colors.textLight} />
                            <Text style={styles.metaText}>{item.paymentMethod}</Text>
                        </View>
                        <Text style={styles.amount}>₹{item.totalAmount.toLocaleString()}</Text>
                    </View>
                </View>

                {item.status === "Awaiting Payment Confirmation" && (
                    <View style={styles.actionPrompt}>
                        <Text style={styles.actionPromptText}>Action Required: Verify Payment</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Orders</Text>
                    <Text style={styles.subtitle}>{filteredOrders.length} Orders Recieved</Text>
                </View>
                {/* Placeholder for future action button if needed, or keeping layout consistent */}
                {/* <TouchableOpacity style={styles.addButton}>
                    <Icon name="filter" size={24} color={colors.white} />
                 </TouchableOpacity> */}
            </View>

            <View style={styles.actionRow}>
                <View style={[styles.searchContainer, { flex: 1 }]}>
                    <Icon name="search" size={20} color={colors.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Order ID, Retailer..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.textLight}
                    />
                </View>
            </View>

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
                    {["All", "Awaiting Payment Confirmation", "Processing", "Packed", "Out for Delivery", "Delivered", "Cancelled"].map((status) => (
                        <Pressable
                            key={status}
                            style={[
                                styles.filterChip,
                                statusFilter === status && styles.filterChipActive,
                                status === "Awaiting Payment Confirmation" && statusFilter !== status && styles.filterChipWarning
                            ]}
                            onPress={() => setStatusFilter(status as OrderStatus | "All")}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    statusFilter === status && styles.filterChipTextActive,
                                    status === "Awaiting Payment Confirmation" && statusFilter !== status && styles.filterChipTextWarning
                                ]}
                            >
                                {status === "Awaiting Payment Confirmation" ? "Action Needed" : status}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="cube-outline" size={48} color={colors.textLight} />
                        <Text style={styles.emptyStateText}>No orders found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
    actionRow: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: colors.textDark,
    },
    filtersContainer: {
        marginBottom: 16,
    },
    filterList: {
        paddingHorizontal: 20, // Match other padding
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterChipWarning: {
        borderColor: "#F59E0B",
        borderWidth: 1,
        backgroundColor: "#FFFBEB"
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.textLight,
    },
    filterChipTextActive: {
        color: colors.white,
    },
    filterChipTextWarning: {
        color: "#D97706"
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: colors.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "transparent",
    },
    cardHighlight: {
        borderColor: "#FCD34D",
        backgroundColor: "#FFFBEB",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    orderIdContainer: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textDark,
    },
    date: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    cardBody: {
        gap: 4,
    },
    retailerName: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textDark,
    },
    shopName: {
        fontSize: 13,
        color: colors.textLight,
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.background, // lighter border
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: colors.textLight,
        fontWeight: "500",
    },
    amount: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textDark,
    },
    actionPrompt: {
        marginTop: 12,
        backgroundColor: "#FEF3C7",
        padding: 8,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FDE68A"
    },
    actionPromptText: {
        color: "#B45309",
        fontSize: 12,
        fontWeight: "600"
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    emptyStateText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.textLight,
    },
});