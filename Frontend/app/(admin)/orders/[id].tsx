import { MOCK_ORDERS, Order, OrderStatus } from "@/data/mockOrders";
import { Feather as Icon } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";


const STATUS_COLORS: Record<OrderStatus, string> = {
    "Awaiting Payment Confirmation": "#F59E0B",
    Processing: "#3B82F6",
    Packed: "#8B5CF6",
    "Out for Delivery": "#F97316",
    Delivered: "#10B981",
    Cancelled: "#EF4444",
};

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);

    // Load order
    useEffect(() => {
        const foundOrder = MOCK_ORDERS.find((o) => o.id === id);
        if (foundOrder) {
            setOrder({ ...foundOrder });
        }
    }, [id]);

    const handleUpdateStatus = (newStatus: OrderStatus) => {
        if (!order) return;

        // In a real app, this would be an API call
        // For now, we update the mock data reference and local state
        const mockOrderIndex = MOCK_ORDERS.findIndex(o => o.id === order.id);
        if (mockOrderIndex !== -1) {
            MOCK_ORDERS[mockOrderIndex].status = newStatus;
        }

        setOrder({ ...order, status: newStatus });
        Alert.alert("Success", `Order status updated to ${newStatus}`);
    };

    const handleApprovePayment = () => {
        Alert.alert(
            "Approve Payment",
            "Are you sure you want to approve this payment? The order will move to Processing state.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve",
                    onPress: () => handleUpdateStatus("Processing")
                }
            ]
        );
    };

    if (!order) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Order Not Found</Text>
                </View>
            </View>
        );
    }

    const getStatusIconName = (status: OrderStatus) => {
        switch (status) {
            case "Awaiting Payment Confirmation": return "alert-circle";
            case "Processing": return "check-circle"; // Using check-circle
            case "Packed": return "package";
            case "Out for Delivery": return "truck";
            case "Delivered": return "check-circle";
            case "Cancelled": return "x-circle";
            default: return "help-circle";
        }
    };

    const isAdvancePayment = order.paymentMethod !== "COD";
    const needsApproval = order.status === "Awaiting Payment Confirmation";

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.title}>Order #{order.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + "20" }]}>
                    <Icon name={getStatusIconName(order.status) as any} size={14} color={STATUS_COLORS[order.status]} />
                    <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
                        {order.status}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Actions Card (Top Priority) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>
                    <View style={styles.actionGrid}>
                        {needsApproval ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.approveByPaymentButton]}
                                    onPress={handleApprovePayment}
                                >
                                    <Icon name="check-circle" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonTextPrimary}>Approve Payment</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.rejectButton]}
                                    onPress={() => Alert.alert("Reject", "Reject functionality not implemented in mock")}
                                >
                                    <Icon name="x-circle" size={20} color="#EF4444" />
                                    <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>Reject</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            // Status Lifecycle Actions
                            <>
                                {order.status === "Processing" && (
                                    <TouchableOpacity
                                        style={styles.actionButtonPrimary}
                                        onPress={() => handleUpdateStatus("Packed")}
                                    >
                                        <Icon name="package" size={20} color="#FFFFFF" />
                                        <Text style={styles.actionButtonTextPrimary}>Mark as Packed</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status === "Packed" && (
                                    <TouchableOpacity
                                        style={styles.actionButtonPrimary}
                                        onPress={() => handleUpdateStatus("Out for Delivery")}
                                    >
                                        <Icon name="truck" size={20} color="#FFFFFF" />
                                        <Text style={styles.actionButtonTextPrimary}>Ship Order</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status === "Out for Delivery" && (
                                    <TouchableOpacity
                                        style={styles.actionButtonPrimary}
                                        onPress={() => handleUpdateStatus("Delivered")}
                                    >
                                        <Icon name="check-circle" size={20} color="#FFFFFF" />
                                        <Text style={styles.actionButtonTextPrimary}>Mark Delivered</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status !== "Cancelled" && order.status !== "Delivered" && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={() => handleUpdateStatus("Cancelled")}
                                    >
                                        <Icon name="x-circle" size={20} color="#EF4444" />
                                        <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>Cancel Order</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                </View>

                {/* Retailer Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Retailer Details</Text>
                    <View style={styles.card}>
                        <View style={styles.retailerHeader}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{order.retailerName.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text style={styles.retailerName}>{order.retailerName}</Text>
                                <View style={styles.retailerMetaItem}>
                                    <Icon name="map-pin" size={14} color="#64748B" />
                                    <Text style={styles.retailerShop}>{order.shopName}</Text>
                                </View>
                            </View>
                        </View>
                        {/* Mock Contact Actions */}
                        <View style={styles.contactRow}>
                            <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL(`tel:9999999999`)}>
                                <Icon name="phone" size={18} color="#3B82F6" />
                                <Text style={styles.contactButtonText}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL(`mailto:test@test.com`)}>
                                <Icon name="mail" size={18} color="#3B82F6" />
                                <Text style={styles.contactButtonText}>Email</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.addressContainer}>
                            <Icon name="map-pin" size={16} color="#64748B" />
                            <Text style={styles.addressText}>123, Wellness Street, Health City, CA</Text>
                        </View>
                    </View>
                </View>

                {/* Products */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
                    <View style={styles.card}>
                        {order.items.map((item, index) => (
                            <View key={index} style={[styles.productItem, index === order.items.length - 1 && styles.lastProductItem]}>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{item.name}</Text>
                                    <Text style={styles.productMeta}>Qty: {item.quantity} x ₹{item.price}</Text>
                                </View>
                                <Text style={styles.productTotal}>₹{item.quantity * item.price}</Text>
                            </View>
                        ))}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>₹{order.totalAmount.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Information</Text>
                    <View style={styles.card}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Method</Text>
                            <View style={styles.infoValueBubble}>
                                {order.paymentMethod === "COD" ? <Icon name="dollar-sign" size={14} color="#0F172A" /> : <Icon name="credit-card" size={14} color="#0F172A" />}
                                <Text style={styles.infoValueText}>{order.paymentMethod}</Text>
                            </View>
                        </View>
                        {isAdvancePayment && (
                            <>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Status</Text>
                                    <Text style={[styles.infoValueBold, { color: STATUS_COLORS[order.status] }]}>
                                        {order.status === "Awaiting Payment Confirmation" ? "Pending Approval" : "Paid"}
                                    </Text>
                                </View>
                                {order.paymentProofUrl && (
                                    <View style={styles.proofContainer}>
                                        <Text style={styles.proofLabel}>Payment Proof</Text>
                                        <TouchableOpacity
                                            style={styles.proofLink}
                                            onPress={() => Linking.openURL(order.paymentProofUrl!)}
                                        >
                                            <Icon name="external-link" size={16} color="#3B82F6" />
                                            <Text style={styles.proofLinkText}>View Screenshot</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {order.paymentTransactionId && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Transaction ID</Text>
                                        <View style={styles.copyRow}>
                                            <Text style={styles.infoValueMono}>{order.paymentTransactionId}</Text>
                                            <Icon name="copy" size={14} color="#94A3B8" />
                                        </View>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#0F172A",
        flex: 1,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#334155",
        marginLeft: 4,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    actionButtonPrimary: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#3B82F6",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    approveByPaymentButton: {
        flex: 2,
        backgroundColor: "#10B981",
        borderColor: "#10B981",
    },
    actionButtonTextPrimary: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    rejectButton: {
        borderColor: "#FEE2E2",
        backgroundColor: "#FEF2F2",
    },
    cancelButton: {
        borderColor: "#FEE2E2",
        backgroundColor: "#FEF2F2",
        marginTop: 8,
        flexBasis: "100%", // Full width
    },
    actionButtonText: {
        color: "#0F172A",
        fontWeight: "600",
        fontSize: 14,
    },
    // Retailer Styles
    retailerHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#64748B",
    },
    retailerName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0F172A",
    },
    retailerShop: {
        fontSize: 14,
        color: "#64748B",
    },
    retailerMetaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 2,
    },
    contactRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    contactButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        backgroundColor: "#EFF6FF",
        borderRadius: 8,
        gap: 6,
    },
    contactButtonText: {
        color: "#3B82F6",
        fontWeight: "600",
    },
    addressContainer: {
        flexDirection: "row",
        gap: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: "#0F172A",
        lineHeight: 20,
    },
    // Product Styles
    productItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    lastProductItem: {
        borderBottomWidth: 0,
    },
    productInfo: {
        gap: 4,
    },
    productName: {
        fontSize: 15,
        fontWeight: "500",
        color: "#0F172A",
    },
    productMeta: {
        fontSize: 13,
        color: "#64748B",
    },
    productTotal: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0F172A",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#0F172A",
    },
    totalValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#3B82F6",
    },
    // Info Rows
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: "#64748B",
    },
    infoValueBubble: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 6,
    },
    infoValueText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#0F172A",
    },
    infoValueBold: {
        fontSize: 14,
        fontWeight: "700",
    },
    infoValueMono: {
        fontSize: 14,
        fontFamily: "Courier",
        color: "#0F172A",
    },
    copyRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    proofContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        gap: 8,
    },
    proofLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
    },
    proofLink: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    proofLinkText: {
        color: "#3B82F6",
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});
