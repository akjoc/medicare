import { APP_CONFIG } from "@/constants/app";
import { useCart } from "@/context/CartContext";
import { RetailerPaymentConfiguration } from "@/data/paymentMethods";
import { getUser } from "@/services/auth.service";
import { CreateOrderPayload, OrderService } from "@/services/order.service";
import { PaymentService } from "@/services/payment.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, clearCart, appliedCoupon } = useCart();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "PREPAID">("COD");
    const [isQRModalVisible, setIsQRModalVisible] = useState(false);

    // Live Payment Configuration
    const [paymentConfig, setPaymentConfig] = useState<RetailerPaymentConfiguration | null>(null);
    const [configLoading, setConfigLoading] = useState(true);

    // State for user and address
    const [user, setUser] = useState<any>(null);
    const [deliveryAddress, setDeliveryAddress] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Load Payment Config
        try {
            const config = await PaymentService.getRetailerConfiguration();
            setPaymentConfig(config);
        } catch (error) {
            console.error("Failed to load payment config", error);
        } finally {
            setConfigLoading(false);
        }

        // Load User for Address
        try {
            const userData = await getUser();
            setUser(userData);
            if (userData) {
                const parts = [
                    userData.address,
                    userData.city,
                    userData.state,
                    userData.zipCode
                ].filter(Boolean);
                if (parts.length > 0) {
                    setDeliveryAddress(parts.join(", "));
                } else {
                    setDeliveryAddress("Jaipur, Rajasthan"); // Fallback
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const subtotal = items.reduce(
        (sum, item) => {
            const price = Number(item.Product.price);
            const salePrice = item.Product.salePrice ? Number(item.Product.salePrice) : 0;
            const effectivePrice = salePrice > 0 ? salePrice : price;
            return sum + effectivePrice * item.quantity;
        },
        0
    );

    const couponDiscount = appliedCoupon?.discount || 0;
    const baseForPrepaidDiscount = subtotal - couponDiscount;

    // Calculate Discount based on Payment Config
    let prepaidDiscount = 0;
    if (paymentConfig?.discount.enabled && paymentMethod === "PREPAID") {
        if (paymentConfig.discount.type === "PERCENT") {
            prepaidDiscount = (baseForPrepaidDiscount * paymentConfig.discount.value) / 100;
        } else {
            prepaidDiscount = paymentConfig.discount.value;
        }
    }

    const totalAmount = Math.max(0, baseForPrepaidDiscount - prepaidDiscount);

    // Replaced handleAddressChange with direct edit
    // const handleAddressChange = () => {
    //     Alert.alert("Change Address", "Address management feature coming soon!");
    // };

    const handlePlaceOrder = async () => {
        if (!items.length) return;

        if (!deliveryAddress.trim()) {
            Alert.alert("Error", "Please enter a delivery address");
            return;
        }

        setLoading(true);
        try {
            const orderData: CreateOrderPayload = {
                address: deliveryAddress, // Using dynamic deliveryAddress
                paymentMethod: paymentMethod === "COD" ? "COD" : "ONLINE",
                cartItems: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                itemTotal: subtotal,
                deliveryFee: "FREE", // Hardcoded as per current UI/logic
                couponDiscount: couponDiscount,
                paymentDiscount: prepaidDiscount,
                toPay: totalAmount.toFixed(2),
                couponCode: appliedCoupon?.code || null
            };

            const response = await OrderService.placeOrder(orderData);

            clearCart();
            router.replace({
                pathname: "/(retailer)/cart/success",
                params: { orderId: response.orderId }
            });
        } catch (error: any) {
            console.error("Place order failed:", error);
            const errorMessage = error.response?.data?.error || "Failed to place order. Please try again.";
            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAskForDiscount = () => {
        const message = `Hi, I would like to place an order from ${APP_CONFIG.NAME}.
Here are the details:
${items.map(item => `- ${item.Product.name} (x${item.quantity})`).join("\n")}

Total Value: ₹${totalAmount}
Payment Method: ${paymentMethod}

Can you offer any extra discount on this?`;

        const url = `whatsapp://send?phone=${APP_CONFIG.WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch(() => {
            Alert.alert("Error", "WhatsApp is not installed");
        });
    };

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No items to checkout</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Go Back to Cart</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (configLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.white }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkout</Text>
                    <View style={{ width: 24 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Address Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="location" size={18} color={colors.primary} />
                        <Text style={styles.cardTitle}>Delivery Address</Text>
                    </View>
                    <TextInput
                        style={styles.addressInput}
                        value={deliveryAddress}
                        onChangeText={setDeliveryAddress}
                        multiline
                        placeholder="Enter delivery address"
                        placeholderTextColor={colors.textLight}
                    />
                    <Text style={styles.helperText}>Tap to edit address</Text>
                </View>

                {/* Order Items */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Items ({items.length})</Text>
                    {items.map((item, index) => (
                        <View key={item.id}>
                            {index > 0 && <View style={styles.itemDivider} />}
                            <View style={styles.orderItem}>
                                <Text style={styles.orderItemName} numberOfLines={1}>
                                    {item.quantity}x {item.Product.name}
                                </Text>
                                <Text style={styles.orderItemPrice}>
                                    ₹{(item.Product.salePrice ? Number(item.Product.salePrice) : Number(item.Product.price)) * item.quantity}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Bill Details */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Bill Details</Text>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total</Text>
                        <Text style={styles.billValue}>₹{subtotal}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Delivery Fee</Text>
                        <Text style={[styles.billValue, { color: '#059669' }]}>FREE</Text>
                    </View>
                    {couponDiscount > 0 && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: '#059669' }]}>Coupon ({appliedCoupon?.code})</Text>
                            <Text style={[styles.billValue, { color: '#059669' }]}>- ₹{couponDiscount.toFixed(2)}</Text>
                        </View>
                    )}
                    {prepaidDiscount > 0 && paymentMethod === "PREPAID" && (
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: '#059669' }]}>Prepaid Discount</Text>
                            <Text style={[styles.billValue, { color: '#059669' }]}>- ₹{prepaidDiscount.toFixed(2)}</Text>
                        </View>
                    )}
                    <View style={[styles.billRow, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 8 }]}>
                        <Text style={[styles.billLabel, { fontWeight: '700', color: colors.textDark }]}>To Pay</Text>
                        <Text style={[styles.billValue, { fontWeight: '700', fontSize: 16 }]}>₹{totalAmount}</Text>
                    </View>
                </View>

                {/* WhatsApp Link */}
                <TouchableOpacity style={styles.whatsappLink} onPress={handleAskForDiscount}>
                    <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                    <Text style={styles.whatsappLinkText}>Ask for extra discount on WhatsApp</Text>
                </TouchableOpacity>

                {/* Payment Method */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Payment Method</Text>

                    {/* COD Option */}
                    {paymentConfig?.codEnabled && (
                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                paymentMethod === "COD" && styles.paymentOptionSelected,
                            ]}
                            onPress={() => setPaymentMethod("COD")}
                        >
                            <Ionicons
                                name={paymentMethod === "COD" ? "radio-button-on" : "radio-button-off"}
                                size={20}
                                color={paymentMethod === "COD" ? colors.primary : colors.textLight}
                            />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.paymentText}>Cash on Delivery</Text>
                                {paymentConfig.codNote && (
                                    <Text style={styles.paymentSubtext}>{paymentConfig.codNote}</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Prepaid Option */}
                    {paymentConfig?.advancePaymentEnabled && (
                        <>
                            <TouchableOpacity
                                style={[
                                    styles.paymentOption,
                                    paymentMethod === "PREPAID" && styles.paymentOptionSelected,
                                ]}
                                onPress={() => setPaymentMethod("PREPAID")}
                            >
                                <Ionicons
                                    name={paymentMethod === "PREPAID" ? "radio-button-on" : "radio-button-off"}
                                    size={20}
                                    color={paymentMethod === "PREPAID" ? colors.primary : colors.textLight}
                                />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.paymentText}>Advance Payment (Online)</Text>
                                    {paymentConfig.discount.enabled && (
                                        <Text style={styles.paymentSubtext}>
                                            {paymentConfig.discount.description || "Get extra discount"}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>

                            {/* Payment Details for Prepaid */}
                            {paymentMethod === "PREPAID" && (
                                <View style={styles.prepaidDetails}>
                                    {paymentConfig.advancePaymentInstruction && (
                                        <Text style={[styles.detailText, { marginBottom: 12, color: colors.primary, fontWeight: '500' }]}>
                                            {paymentConfig.advancePaymentInstruction}
                                        </Text>
                                    )}

                                    {paymentConfig.advancePaymentMethods?.upiQr?.enabled && (
                                        <View style={styles.methodDetail}>
                                            <Text style={styles.methodTitle}>UPI / QR Code</Text>
                                            {paymentConfig.advancePaymentMethods?.upiQr?.qrCodeUrl && (
                                                <TouchableOpacity onPress={() => setIsQRModalVisible(true)}>
                                                    <Image
                                                        source={{ uri: paymentConfig.advancePaymentMethods?.upiQr?.qrCodeUrl }}
                                                        style={styles.qrImage}
                                                        resizeMode="contain"
                                                    />
                                                </TouchableOpacity>
                                            )}
                                            <Text style={styles.detailText}>
                                                UPI ID: {paymentConfig.advancePaymentMethods?.upiQr?.upiId}
                                            </Text>
                                        </View>
                                    )}

                                    {paymentConfig.advancePaymentMethods?.bankTransfer?.enabled && (
                                        <View style={[styles.methodDetail, { marginTop: 12 }]}>
                                            <Text style={styles.methodTitle}>Bank Transfer</Text>
                                            <Text style={styles.detailText}>
                                                Bank: {paymentConfig.advancePaymentMethods?.bankTransfer?.bankName}
                                            </Text>
                                            <Text style={styles.detailText}>
                                                Acc No: {paymentConfig.advancePaymentMethods?.bankTransfer?.accountNumber}
                                            </Text>
                                            <Text style={styles.detailText}>
                                                IFSC: {paymentConfig.advancePaymentMethods?.bankTransfer?.ifscCode}
                                            </Text>
                                            <Text style={styles.detailText}>
                                                Holder: {paymentConfig.advancePaymentMethods?.bankTransfer?.accountHolderName}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Fixed Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{totalAmount}</Text>
                </View>
                <TouchableOpacity
                    style={styles.placeOrderBtn}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Text style={styles.placeOrderText}>Place Order</Text>
                            <Ionicons name="arrow-forward" size={18} color={colors.white} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Full Page QR Modal */}
            <Modal
                visible={isQRModalVisible}
                transparent={false}
                animationType="fade"
                onRequestClose={() => setIsQRModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Scan to Pay</Text>
                        <TouchableOpacity
                            onPress={() => setIsQRModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={32} color={colors.textDark} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        {paymentConfig?.advancePaymentMethods?.upiQr?.qrCodeUrl && (
                            <Image
                                source={{ uri: paymentConfig.advancePaymentMethods?.upiQr?.qrCodeUrl }}
                                style={styles.fullQrImage}
                                resizeMode="contain"
                            />
                        )}
                        <Text style={styles.modalUpiId}>
                            UPI ID: {paymentConfig?.advancePaymentMethods?.upiQr?.upiId}
                        </Text>
                        <Text style={styles.modalInstructions}>
                            Scan this QR code using any UPI app to make the payment.
                        </Text>
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textDark,
    },
    content: {
        padding: 16,
    },

    // Card Styles
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textDark,
        marginBottom: 12,
    },

    addressInput: {
        fontSize: 14,
        color: colors.textDark,
        lineHeight: 20,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.background,
        textAlignVertical: 'top',
        minHeight: 80,
    },
    helperText: {
        fontSize: 12,
        color: colors.textLight,
        fontStyle: 'italic',
    },
    // Order Items
    orderItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    orderItemName: {
        flex: 1,
        fontSize: 14,
        color: colors.textDark,
        marginRight: 12,
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
    },
    itemDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 4,
    },

    // Bill Details
    billRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
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

    // WhatsApp Link
    whatsappLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
    },
    whatsappLinkText: {
        color: '#1B5E20',
        fontWeight: '600',
        fontSize: 14,
    },

    // Payment
    paymentOption: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 12,
        marginBottom: 8,
    },
    paymentOptionSelected: {
        backgroundColor: `${colors.primary}05`,
        marginHorizontal: -16,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    paymentText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 4,
    },
    paymentSubtext: {
        fontSize: 12,
        color: '#059669',
    },
    prepaidDetails: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    methodDetail: {
        marginBottom: 8,
    },
    methodTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textDark,
        marginBottom: 8,
    },
    qrImage: {
        width: 120,
        height: 120,
        marginBottom: 8,
        alignSelf: 'center',
    },
    detailText: {
        fontSize: 13,
        color: colors.textDark,
        marginBottom: 4,
    },

    // Bottom Bar
    bottomBar: {
        backgroundColor: colors.white,
        padding: 16,
        paddingBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 10,
    },
    totalContainer: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 12,
        color: colors.textLight,
        marginBottom: 2,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.textDark,
    },
    placeOrderBtn: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 100,
        gap: 6,
    },
    placeOrderText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 16,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 18,
        color: colors.textLight,
        marginBottom: 16,
    },
    backButton: {
        padding: 12,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    backButtonText: {
        color: colors.textDark,
        fontWeight: "600",
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textDark,
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    fullQrImage: {
        width: '100%',
        height: '70%',
        marginBottom: 24,
    },
    modalUpiId: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textDark,
        marginBottom: 8,
    },
    modalInstructions: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
        lineHeight: 20,
    },
});
