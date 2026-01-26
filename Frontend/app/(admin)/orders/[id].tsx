import { OrderService } from "@/services/order.service";
import { colors } from "@/styles/colors";
import { Feather as Icon } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface AdminOrderDetail {
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

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<AdminOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchOrderDetails = useCallback(async () => {
        try {
            const data = await OrderService.getOrderById(id as string);
            setOrder(data);
        } catch (error) {
            console.error("Failed to fetch order details:", error);
            Alert.alert("Error", "Failed to load order details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchOrderDetails();
        }
    }, [id, fetchOrderDetails]);

    const handleUpdateStatus = async (newStatus: string) => {
        if (!order) return;
        try {
            setLoading(true);
            await OrderService.updateOrderStatus(order.id.toString(), newStatus);
            Alert.alert("Success", `Order status updated to ${newStatus}`);
            await fetchOrderDetails();
        } catch (error) {
            console.error("Failed to update status:", error);
            Alert.alert("Error", "Failed to update status.");
            setLoading(false);
        }
    };

    const handleUploadInvoice = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
            });

            if (result.canceled) return;

            const file = result.assets[0];

            // Only allow PDF
            if (file.mimeType !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                Alert.alert("Error", "Only PDF files are allowed.");
                return;
            }

            // 2MB limit check
            if (file.size && file.size > 2 * 1024 * 1024) {
                Alert.alert("Error", "File size must be less than 2MB");
                return;
            }

            setUploading(true);
            const fileData = {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || "application/octet-stream",
            };

            await OrderService.uploadInvoice(order!.id.toString(), fileData);
            Alert.alert("Success", "Invoice uploaded successfully!");
            fetchOrderDetails();
        } catch (error) {
            console.error("Upload failed", error);
            Alert.alert("Error", "Failed to upload invoice.");
        } finally {
            setUploading(false);
        }
    };

    const handleUpdatePaymentStatus = async (status: 'approved' | 'rejected') => {
        if (!order) return;
        try {
            setLoading(true);
            await OrderService.updatePaymentStatus(order.id.toString(), status);
            Alert.alert("Success", `Payment ${status} successfully.`);
            await fetchOrderDetails();
        } catch (error) {
            console.log("akkkkk", error);
            console.error(`Failed to ${status} payment:`, error);
            Alert.alert("Error", `Failed to ${status} payment.`);
            setLoading(false);
        }
    };

    const handleApprovePayment = () => {
        Alert.alert(
            "Approve Payment",
            "Are you sure you want to approve this payment? The order will move to Processing state.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve",
                    onPress: () => handleUpdatePaymentStatus("approved")
                }
            ]
        );
    };

    const handleRateOrder = async (rating: number) => {
        if (!order) return;
        try {
            setLoading(true);
            await OrderService.rateOrder(order.id.toString(), rating);
            Alert.alert("Success", "Rating submitted successfully.");
            await fetchOrderDetails();
        } catch (error) {
            console.error("Failed to rate order:", error);
            Alert.alert("Error", "Failed to submit rating.");
            setLoading(false);
        }
    };

    const handleRejectPayment = () => {
        Alert.alert(
            "Reject Payment",
            "Are you sure you want to reject this payment?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: () => handleUpdatePaymentStatus("rejected")
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={[styles.centerContainer, { paddingTop: 100 }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

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

    const getStatusIconName = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("pending")) return "alert-circle";
        if (s.includes("processing")) return "check-circle";
        if (s.includes("packed")) return "package";
        if (s.includes("delivery")) return "truck";
        if (s.includes("delivered")) return "check-circle";
        if (s.includes("cancelled")) return "x-circle";
        return "help-circle";
    };

    const isAdvancePayment = order.paymentMethod !== "COD";
    const needsApproval = order.status === "Awaiting Payment Confirmation" || order.status === "pending";

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.title}>Order #{order.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[order.status] || colors.textLight) + "20" }]}>
                    <Icon name={getStatusIconName(order.status) as any} size={14} color={STATUS_COLORS[order.status] || colors.textLight} />
                    <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] || colors.textLight }]}>
                        {order.status}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Actions Card */}
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
                                    onPress={handleRejectPayment}
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

                {/* Invoice Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Invoice Management</Text>
                    <View style={styles.card}>
                        {order.invoiceUrl ? (
                            <View style={styles.invoiceDisplay}>
                                <View style={styles.invoiceInfo}>
                                    <Icon name="file-text" size={24} color={colors.primary} />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.invoiceName}>Order Invoice</Text>
                                        <Text style={styles.invoiceStatus}>Uploaded</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.viewInvoiceBtn}
                                    onPress={() => Linking.openURL(order.invoiceUrl!)}
                                >
                                    <Text style={styles.viewInvoiceText}>View</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.noInvoiceText}>No invoice uploaded yet.</Text>
                        )}

                        <TouchableOpacity
                            style={[styles.uploadBtn, uploading && styles.disabledBtn]}
                            onPress={handleUploadInvoice}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <>
                                    <Icon name="upload" size={18} color={colors.white} />
                                    <Text style={styles.uploadBtnText}>
                                        {order.invoiceUrl ? "Replace Invoice" : "Upload Invoice"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.uploadInfo}>PDF only (Max 2MB)</Text>
                    </View>
                </View>

                {/* Retailer Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Retailer Details</Text>
                    <View style={styles.card}>
                        <View style={styles.retailerHeader}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{order.retailerName?.charAt(0) || order.User?.name?.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text style={styles.retailerName}>{order.retailerName || order.User?.name}</Text>
                                <View style={styles.retailerMetaItem}>
                                    <Icon name="map-pin" size={14} color="#64748B" />
                                    <Text style={styles.retailerShop}>{order.shopName}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.contactRow}>
                            <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL(`mailto:${order.User?.email}`)}>
                                <Icon name="mail" size={18} color="#3B82F6" />
                                <Text style={styles.contactButtonText}>Email</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.addressContainer}>
                            <Icon name="map-pin" size={16} color="#64748B" />
                            <Text style={styles.addressText}>{order.address}</Text>
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
                                {order.paymentMethod === "COD" ? <Icon name="user" size={14} color="#0F172A" /> : <Icon name="credit-card" size={14} color="#0F172A" />}
                                <Text style={styles.infoValueText}>{order.paymentMethod}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Status</Text>
                            <Text style={[styles.infoValueBold, { color: STATUS_COLORS[order.status] || colors.textLight }]}>
                                {order.paymentStatus.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Rating Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Rating</Text>
                    <View style={styles.card}>
                        <View style={styles.ratingContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => !order.rating && handleRateOrder(star)}
                                    disabled={!!order.rating}
                                >
                                    <Icon
                                        name="star"
                                        size={32}
                                        color={(order.rating || 0) >= star ? "#F59E0B" : "#E2E8F0"}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        {order.rating ? (
                            <Text style={styles.ratingInfoText}>Rating submitted: {order.rating} stars</Text>
                        ) : (
                            <Text style={styles.ratingHintText}>Click a star to rate this order</Text>
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    // Invoice Styles
    invoiceDisplay: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    invoiceInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    invoiceName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0F172A",
    },
    invoiceStatus: {
        fontSize: 12,
        color: "#10B981",
        fontWeight: "500",
    },
    viewInvoiceBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#FFFFFF",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    viewInvoiceText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: "600",
    },
    noInvoiceText: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 16,
        fontStyle: "italic",
    },
    uploadBtn: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    disabledBtn: {
        opacity: 0.6,
    },
    uploadBtnText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: "600",
    },
    uploadInfo: {
        fontSize: 11,
        color: "#94A3B8",
        textAlign: "center",
        marginTop: 8,
    },
    ratingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        paddingVertical: 8,
    },
    ratingInfoText: {
        textAlign: "center",
        fontSize: 14,
        color: "#10B981",
        fontWeight: "600",
        marginTop: 8,
    },
    ratingHintText: {
        textAlign: "center",
        fontSize: 12,
        color: "#64748B",
        fontStyle: "italic",
        marginTop: 8,
    },
});
