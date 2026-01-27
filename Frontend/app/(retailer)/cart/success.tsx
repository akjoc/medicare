import { OrderService } from "@/services/order.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
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

export default function OrderSuccessScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    // Prevent back navigation to checkout
    useEffect(() => {
        const backAction = () => {
            router.replace("/(retailer)/home");
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const data = await OrderService.getOrderById(orderId as string);
            setOrder(data);
        } catch (error) {
            console.error("Failed to fetch order details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleContinueShopping = () => {
        // Reset the cart stack so that the next time user visits "Cart" tab, it's at index
        router.replace("/(retailer)/cart");
        setTimeout(() => {
            router.replace("/(retailer)/home");
        }, 0);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Fetching order details...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle" size={64} color={colors.error} />
                    <Text style={styles.errorText}>Something went wrong!</Text>
                    <Text style={styles.errorSubtext}>We couldn't find your order details.</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleContinueShopping}>
                        <Text style={styles.primaryButtonText}>Go to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isOnlinePayment = order.paymentMethod === "ONLINE";

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.successHeader}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="checkmark" size={48} color={colors.white} />
                    </View>
                    <Text style={styles.successTitle}>Order Placed Successfully!</Text>
                    <Text style={styles.orderIdText}>Order ID: #{order.id}</Text>
                </View>

                {isOnlinePayment && (
                    <View style={styles.noteCard}>
                        <Ionicons name="information-circle" size={20} color="#0369A1" />
                        <Text style={styles.noteText}>
                            Note: Your order will get processed after your payment is verified.
                        </Text>
                    </View>
                )}

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Summary</Text>
                    {order.OrderItems.map((item, index) => (
                        <View key={item.id} style={styles.itemRow}>
                            <Text style={styles.itemName} numberOfLines={1}>
                                {item.quantity}x {item.Product.name}
                            </Text>
                            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total</Text>
                        <Text style={styles.billValue}>₹{order.subTotal}</Text>
                    </View>
                    {order.couponDiscount > 0 && (
                        <View style={styles.billRow}>
                            <Text style={styles.discountLabel}>Coupon Discount</Text>
                            <Text style={styles.discountValue}>-₹{order.couponDiscount}</Text>
                        </View>
                    )}
                    {order.paymentDiscount > 0 && (
                        <View style={styles.billRow}>
                            <Text style={styles.discountLabel}>Payment Discount</Text>
                            <Text style={styles.discountValue}>-₹{order.paymentDiscount}</Text>
                        </View>
                    )}
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Delivery Fee</Text>
                        <Text style={[styles.billValue, { color: "#16A34A" }]}>
                            {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                        </Text>
                    </View>

                    <View style={[styles.billRow, { marginTop: 12 }]}>
                        <Text style={styles.totalLabel}>Total Paid</Text>
                        <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Payment Details</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Method</Text>
                        <Text style={styles.infoValue}>
                            {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: order.paymentStatus.toLowerCase() === 'paid' ? '#DCFCE7' : '#FEF3C7' }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: order.paymentStatus.toLowerCase() === 'paid' ? '#166534' : '#92400E' }
                            ]}>
                                {order.paymentStatus.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleContinueShopping}>
                    <Text style={styles.primaryButtonText}>Continue Shopping</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.white} />
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.white,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.textLight,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    content: {
        padding: 16,
        gap: 12,
        paddingBottom: 32,
    },
    successHeader: {
        alignItems: "center",
        paddingTop: 16,
        paddingBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#16A34A",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#16A34A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.textDark,
        textAlign: "center",
    },
    orderIdText: {
        fontSize: 16,
        color: colors.textLight,
        marginTop: 8,
        fontWeight: "600",
    },
    noteCard: {
        flexDirection: "row",
        backgroundColor: "#F0F9FF",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#BAE6FD",
        gap: 12,
        alignItems: "flex-start",
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        color: "#0369A1",
        lineHeight: 20,
        fontWeight: "500",
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textDark,
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    itemName: {
        flex: 1,
        fontSize: 14,
        color: colors.textDark,
        marginRight: 12,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 12,
    },
    billRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    billLabel: {
        fontSize: 14,
        color: colors.textLight,
    },
    billValue: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.textDark,
    },
    discountLabel: {
        fontSize: 14,
        color: "#16A34A",
    },
    discountValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#16A34A",
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.textDark,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.primary,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: colors.textLight,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },
    primaryButton: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 8,
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "700",
    },
    errorText: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textDark,
        marginTop: 16,
    },
    errorSubtext: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: "center",
        marginTop: 4,
        marginBottom: 24,
    },
});
