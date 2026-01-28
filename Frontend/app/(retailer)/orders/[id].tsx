import { OrderService } from "@/services/order.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface OrderDetail {
    id: number;
    status: string;
    totalAmount: number;
    subTotal: number;
    discount: number;
    deliveryFee: number;
    paymentMethod: string;
    paymentStatus: string;
    orderDate: string;
    couponCode: string | null;
    couponDiscount: number;
    paymentDiscount: number;
    invoiceUrl: string | null;
    OrderItems: Array<{
        id: number;
        quantity: number;
        price: number;
        productId: number;
        Product: {
            name: string;
        };
    }>;
}

export default function RetailerOrderDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const data = await OrderService.getOrderById(id as string);
            setOrder(data);
        } catch (error) {
            console.error("Failed to fetch order details:", error);
            Alert.alert("Error", "Failed to load order details.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.replace("/(retailer)/orders")} style={styles.backButton}>
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
        const s = status.toLowerCase();
        if (s.includes("delivered")) return "#16A34A";
        if (s.includes("processing") || s.includes("packed")) return "#2563EB";
        if (s.includes("cancelled")) return "#DC2626";
        if (s.includes("pending")) return "#D97706";
        return "#6B7280";
    };



    const handleDownloadInvoice = async () => {
        if (!order?.invoiceUrl) {
            Alert.alert("Error", "Invoice not available.");
            return;
        }

        try {
            setDownloading(true);
            const extension = order.invoiceUrl.split('.').pop()?.split('?')[0] || 'pdf';
            const filename = `invoice_${order.id}.${extension}`;
            const fileUri = FileSystem.cacheDirectory + filename;

            // 1. Download the file locally first
            const downloadRes = await FileSystem.downloadAsync(order.invoiceUrl, fileUri);
            if (downloadRes.status !== 200) {
                throw new Error("Failed to download invoice file");
            }

            // On Android, we can try to use SAF to save to a specific directory (like Downloads)
            if (Platform.OS === 'android') {
                try {
                    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                    if (permissions.granted) {
                        // Read from LOCAL fileUri
                        const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
                        await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, 'application/pdf')
                            .then(async (uri) => {
                                await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
                                Alert.alert("Success", "Invoice downloaded successfully.");
                            })
                            .catch(e => {
                                console.error(e);
                                Alert.alert("Error", "Failed to save file.");
                            });
                    } else {
                        // Fallback to regular share if permission denied
                        await shareFile(fileUri);
                    }
                } catch (e) {
                    // Fallback to share if SAF fails
                    await shareFile(fileUri);
                }
            } else {
                // iOS uses share sheet
                await shareFile(fileUri);
            }
        } catch (error) {
            console.error("Download failed:", error);
            Alert.alert("Error", "An error occurred while downloading the invoice.");
        } finally {
            setDownloading(false);
        }
    };

    const shareFile = async (fileUri: string) => {
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Error", "Sharing is not available on this device");
            return;
        }
        await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Download Invoice',
            UTI: 'com.adobe.pdf'
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace("/(retailer)/orders")} style={styles.backButton}>
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
                    <Text style={styles.dateText}>Placed on {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}</Text>
                </View>

                {/* ITEMS LIST */}
                <Text style={styles.sectionTitle}>Items ({order.OrderItems?.length || 0})</Text>
                <View style={styles.card}>
                    {order.OrderItems?.map((item, index) => (
                        <View key={item.id} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.Product?.name || "Product"}</Text>
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

                {/* BILLING SUMMARY */}
                <Text style={styles.sectionTitle}>Bill Summary</Text>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Subtotal</Text>
                        <Text style={styles.infoValue}>₹{order.subTotal.toLocaleString()}</Text>
                    </View>
                    {order.couponDiscount > 0 && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Coupon Discount ({order.couponCode})</Text>
                            <Text style={[styles.infoValue, { color: '#16A34A' }]}>- ₹{order.couponDiscount.toLocaleString()}</Text>
                        </View>
                    )}
                    {order.paymentDiscount > 0 && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Prepaid Discount</Text>
                            <Text style={[styles.infoValue, { color: '#16A34A' }]}>- ₹{order.paymentDiscount.toLocaleString()}</Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Delivery Fee</Text>
                        <Text style={[styles.infoValue, { color: order.deliveryFee === 0 ? '#16A34A' : colors.textDark }]}>
                            {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                        </Text>
                    </View>
                    <View style={[styles.infoRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }]}>
                        <Text style={[styles.infoLabel, { fontWeight: '700', color: colors.textDark }]}>Grand Total</Text>
                        <Text style={[styles.infoValue, { fontWeight: '700', fontSize: 16, color: colors.primary }]}>₹{order.totalAmount.toLocaleString()}</Text>
                    </View>
                </View>

                {/* PAYMENT INFO */}
                <Text style={styles.sectionTitle}>Payment Information</Text>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Method</Text>
                        <Text style={styles.infoValue}>
                            {order.paymentMethod === 'COD' ? 'Cash on Delivery' :
                                order.paymentMethod === 'ONLINE' ? 'Online Payment' : order.paymentMethod}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Status</Text>
                        <Text style={[
                            styles.infoValue,
                            { color: order.paymentStatus.toLowerCase() === 'paid' ? '#16A34A' : '#D97706', fontWeight: 'bold' }
                        ]}>
                            {order.paymentStatus.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* INVOICE BUTTON */}
                {order.invoiceUrl && (
                    <TouchableOpacity
                        style={[styles.invoiceButton, downloading && { opacity: 0.7 }]}
                        onPress={handleDownloadInvoice}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <>
                                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                                <Text style={styles.invoiceButtonText}>Download Invoice</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

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
