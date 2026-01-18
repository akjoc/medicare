import { MOCK_ORDERS } from "@/data/mockOrders";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RetailerOrderDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const order = MOCK_ORDERS.find(o => o.id === id);

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push("/(retailer)/orders" as any)} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Not Found</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.centerContainer}>
                    <Text>Order not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered": return "#16A34A";
            case "processing": return "#2563EB";
            case "cancelled": return "#DC2626";
            case "pending": return "#D97706";
            default: return "#6B7280";
        }
    };

    const handleDownloadInvoice = () => {
        Alert.alert("Download Invoice", "Invoice download started...");
        // Implement actual download logic here
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/(retailer)/orders" as any)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* STATUS CARD */}
                <View style={styles.card}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.label}>Order Status</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                {order.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <Text style={styles.dateText}>Placed on {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}</Text>
                </View>

                {/* ITEMS LIST */}
                <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
                <View style={styles.card}>
                    {order.items.map((item, index) => (
                        <View key={item.productId} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemSubtext}>Qty: {item.quantity} x ₹{item.price}</Text>
                            </View>
                            <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{order.totalAmount.toLocaleString()}</Text>
                    </View>
                </View>

                {/* PAYMENT INFO */}
                <Text style={styles.sectionTitle}>Payment Information</Text>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Method</Text>
                        <Text style={styles.infoValue}>
                            {order.paymentMethod === 'COD' ? 'Cash on Delivery' :
                                order.paymentMethod === 'UPI' ? 'UPI Payment' :
                                    order.paymentMethod === 'Bank Transfer' ? 'Bank Transfer' : order.paymentMethod}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Status</Text>
                        <Text style={[
                            styles.infoValue,
                            { color: order.status === 'Delivered' ? '#16A34A' : '#D97706', fontWeight: 'bold' }
                        ]}>
                            {order.status === 'Awaiting Payment Confirmation' ? 'PENDING' :
                                order.status === 'Delivered' ? 'COMPLETED' : 'PROCESSING'}
                        </Text>
                    </View>
                </View>

                {/* INVOICE BUTTON */}
                <TouchableOpacity style={styles.invoiceButton} onPress={handleDownloadInvoice}>
                    <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                    <Text style={styles.invoiceButtonText}>Download Invoice</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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
    content: {
        padding: 20,
        gap: 16,
        paddingBottom: 40,
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
    },
    statusHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: colors.textLight,
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
    orderId: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textDark,
    },
    dateText: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.textDark,
        marginLeft: 4,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.textDark,
    },
    itemSubtext: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 2,
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.textDark,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.primary,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: colors.textLight,
    },
    infoValue: {
        fontSize: 14,
        color: colors.textDark,
        fontWeight: "500",
    },
    invoiceButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.primary,
        gap: 8,
        marginTop: 8,
    },
    invoiceButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: "600",
    },
});
