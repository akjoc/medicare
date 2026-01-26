import { OrderService } from "@/services/order.service";
import { colors } from "@/styles/colors";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface AdminOrder {
    id: number;
    userId: number;
    status: string;
    address: string;
    totalAmount: number;
    subTotal: number;
    discount: number;
    deliveryFee: number;
    paymentMethod: string;
    paymentStatus: string;
    orderDate: string;
    retailerName: string;
    shopName: string;
    couponCode: string | null;
    couponDiscount: number;
    paymentDiscount: number;
    invoiceUrl: string | null;
    rating: number | null;
    review: string | null;
    createdAt: string;
    updatedAt: string;
    User: {
        id: number;
        name: string;
        email: string;
    };
    OrderItems: Array<{
        id: number;
        quantity: number;
        price: number;
        productId: number;
        Product: {
            id: number;
            name: string;
        };
    }>;
}

const STATUS_COLORS: Record<string, string> = {
    "pending": "#F59E0B",
    "Processing": "#3B82F6",
    "Packed": "#8B5CF6",
    "Out for Delivery": "#F97316",
    "Delivered": "#10B981",
    "Cancelled": "#EF4444",
    "Awaiting Payment Confirmation": "#F59E0B",
};

export default function OrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Debounce search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchOrders = useCallback(async (pageNum: number, search: string, status: string, isRefresh = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const params = {
                page: pageNum,
                limit: 10,
                search: search || undefined,
                status: status === "All" ? undefined : status
            };
            const response = await OrderService.getAllOrders(params);

            if (isRefresh || pageNum === 1) {
                setOrders(response.orders);
            } else {
                setOrders(prev => [...prev, ...response.orders]);
            }

            setTotalPages(response.pages);
            setTotalItems(response.total);
            setPage(pageNum);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial fetch and filter changes
    useEffect(() => {
        fetchOrders(1, debouncedSearch, statusFilter, true);
    }, [debouncedSearch, statusFilter]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrders(1, debouncedSearch, statusFilter, true);
    };

    const handleLoadMore = () => {
        if (!loading && page < totalPages) {
            fetchOrders(page + 1, debouncedSearch, statusFilter);
        }
    };

    const renderOrderItem = ({ item }: { item: AdminOrder }) => {
        const getStatusIconName = (status: string) => {
            const s = status.toLowerCase();
            if (s.includes("pending")) return "alert-circle";
            if (s.includes("processing")) return "time";
            if (s.includes("packed")) return "cube";
            if (s.includes("delivery")) return "bicycle";
            if (s.includes("delivered")) return "checkmark-circle";
            if (s.includes("cancelled")) return "close-circle";
            return "help-circle";
        };

        const getPaymentIconName = (method: string) => {
            switch (method) {
                case "COD": return "cash-outline";
                case "ONLINE": return "card-outline";
                default: return "card-outline";
            }
        };

        const statusColor = STATUS_COLORS[item.status] || colors.textLight;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    (item.status === "Awaiting Payment Confirmation" || item.status === "pending") && styles.cardHighlight
                ]}
                onPress={() => router.push(`/(admin)/orders/${item.id}` as any)}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.orderIdContainer}>
                        <Text style={styles.orderId}>#{item.id}</Text>
                        <Text style={styles.date}>{new Date(item.orderDate).toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                        <Icon name={getStatusIconName(item.status) as any} size={14} color={statusColor} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
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

                {(item.status === "Awaiting Payment Confirmation" || (item.paymentMethod === "ONLINE" && item.paymentStatus === "pending")) && (
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
                    <Text style={styles.subtitle}>{totalItems} Orders Found</Text>
                </View>
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
                            ]}
                            onPress={() => setStatusFilter(status)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    statusFilter === status && styles.filterChipTextActive,
                                ]}
                            >
                                {status === "pending" ? "Action Needed" : status}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={orders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading && !refreshing ? (
                        <View style={{ paddingVertical: 20 }}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Icon name="cube-outline" size={48} color={colors.textLight} />
                            <Text style={styles.emptyStateText}>No orders found</Text>
                        </View>
                    ) : null
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