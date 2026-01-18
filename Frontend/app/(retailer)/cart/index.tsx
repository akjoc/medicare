import QuantitySelector from "@/components/retailer/QuantitySelector";
import { APP_CONFIG } from "@/constants/app";
import { CartItem, useCart } from "@/context/CartContext";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Coupon Data
const MOCK_COUPONS: Record<string, number> = {
    "SAVE10": 10,      // Flat 10 off
    "WELCOME20": 20,   // Flat 20 off
    "MED50": 50,       // Flat 50 off
};

export default function CartScreen() {
    const { items, updateQuantity, removeFromCart, clearCart } = useCart();
    const router = useRouter();

    // Local state for coupon management
    const [showCouponInput, setShowCouponInput] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [appliedCouponCode, setAppliedCouponCode] = useState("");

    const subtotal = items.reduce(
        (sum, item) => {
            const price = Number(item.product.price);
            const salePrice = item.product.salePrice ? Number(item.product.salePrice) : 0;
            const effectivePrice = salePrice > 0 ? salePrice : price;
            return sum + effectivePrice * item.quantity;
        },
        0
    );

    const totalAmount = Math.max(0, subtotal - appliedDiscount);

    const handleApplyCoupon = () => {
        setCouponError(""); // Reset error
        const code = couponCode.trim().toUpperCase();

        if (!code) {
            setCouponError("Please enter a coupon code");
            return;
        }

        if (MOCK_COUPONS.hasOwnProperty(code)) {
            const discount = MOCK_COUPONS[code];

            // Basic validation: Check if discount is not greater than subtotal (optional, but good practice)
            if (discount > subtotal) {
                setCouponError("Coupon value exceeds cart total");
                return;
            }

            setAppliedDiscount(discount);
            setAppliedCouponCode(code);
            setShowCouponInput(false); // Hide input after successful application
            setCouponCode(""); // Clear input
        } else {
            setAppliedDiscount(0);
            setAppliedCouponCode("");
            setCouponError("Invalid coupon code");
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedDiscount(0);
        setAppliedCouponCode("");
        setCouponError("");
    };

    const handleCheckout = () => {
        router.push("/(retailer)/cart/checkout");
    };

    const handleAskForDiscount = () => {
        const message = `Hi, I would like to ask for an extra discount for my cart on ${APP_CONFIG.NAME}.
Total Value: ₹${totalAmount}

Items:
${items.map(item => `- ${item.product.name} (Qty: ${item.quantity})`).join('\n')}`;

        const url = `whatsapp://send?phone=${APP_CONFIG.WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

        Linking.openURL(url).catch(() => {
            // fallback if whatsapp not installed
        });
    };

    const renderCartItem = ({ item }: { item: CartItem }) => {
        const product = item.product;
        // Parse prices to ensure math works
        const price = Number(product.price);
        const salePrice = product.salePrice ? Number(product.salePrice) : 0;
        const currentPrice = salePrice > 0 ? salePrice : price;

        return (
            <View style={styles.cartItemContainer}>
                <View style={styles.imageContainer}>
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                        <Image source={{ uri: product.imageUrls[0] }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="image-outline" size={24} color={colors.textLight} />
                        </View>
                    )}
                </View>

                <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {product.name}
                    </Text>
                    {product.salt && product.salt.length > 0 && (
                        <Text style={styles.itemSalt} numberOfLines={1}>
                            {product.salt[0]}
                        </Text>
                    )}
                    <Text style={styles.itemPrice}>
                        ₹{currentPrice}
                    </Text>
                </View>

                <View style={styles.actionsContainer}>
                    <QuantitySelector
                        quantity={item.quantity}
                        onIncrease={() => updateQuantity(product.id.toString(), item.quantity + 1)}
                        onDecrease={() => updateQuantity(product.id.toString(), item.quantity - 1)}
                        onChangeText={(text) => {
                            const qty = parseInt(text);
                            if (!isNaN(qty)) {
                                updateQuantity(product.id.toString(), qty);
                            }
                        }}
                    />
                </View>
            </View>
        );
    };

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={80} color="#E5E7EB" />
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity
                    style={styles.shopNowButton}
                    onPress={() => router.push("/(retailer)/home")}
                >
                    <Text style={styles.shopNowText}>Shop Now</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.white }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Cart</Text>
                    <TouchableOpacity onPress={clearCart}>
                        <Text style={styles.clearCartText}>Clear All</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={{ flex: 1 }}>
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.product.id.toString()}
                    renderItem={renderCartItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        <View style={{ paddingBottom: 20 }}>
                            {/* Coupon Section */}
                            <View style={styles.couponSection}>
                                {appliedCouponCode ? (
                                    <View style={styles.appliedCouponContainer}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="pricetag" size={20} color="#059669" />
                                            <Text style={styles.appliedCouponText}>
                                                Code <Text style={{ fontWeight: 'bold' }}>{appliedCouponCode}</Text> applied
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={handleRemoveCoupon}>
                                            <Text style={styles.removeCouponText}>Remove</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <>
                                        {!showCouponInput && (
                                            <TouchableOpacity
                                                style={styles.haveCouponButton}
                                                onPress={() => setShowCouponInput(true)}
                                            >
                                                <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
                                                <Text style={styles.haveCouponText}>Have a coupon?</Text>
                                            </TouchableOpacity>
                                        )}

                                        {showCouponInput && (
                                            <View style={styles.couponInputContainer}>
                                                <View style={styles.inputWrapper}>
                                                    <TextInput
                                                        style={styles.couponInput}
                                                        placeholder="Enter coupon code"
                                                        value={couponCode}
                                                        onChangeText={(text) => {
                                                            setCouponCode(text);
                                                            setCouponError("");
                                                        }}
                                                        autoCapitalize="characters"
                                                        autoCorrect={false}
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.applyButton}
                                                        onPress={handleApplyCoupon}
                                                    >
                                                        <Text style={styles.applyButtonText}>Apply</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                {couponError ? (
                                                    <Text style={styles.errorText}>{couponError}</Text>
                                                ) : null}
                                                <TouchableOpacity
                                                    onPress={() => setShowCouponInput(false)}
                                                    style={{ marginTop: 8, alignSelf: 'flex-start' }}
                                                >
                                                    <Text style={{ color: colors.textLight, fontSize: 12 }}>Cancel</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>

                            {/* Bill Details */}
                            <View style={styles.billDetails}>
                                <Text style={styles.billTitle}>Bill Details</Text>
                                <View style={styles.billRow}>
                                    <Text style={styles.billLabel}>Item Total</Text>
                                    <Text style={styles.billValue}>₹{subtotal}</Text>
                                </View>
                                {appliedDiscount > 0 && (
                                    <View style={styles.billRow}>
                                        <Text style={[styles.billLabel, { color: '#059669' }]}>Coupon Discount</Text>
                                        <Text style={[styles.billValue, { color: '#059669' }]}>- ₹{appliedDiscount}</Text>
                                    </View>
                                )}
                                <View style={[styles.billRow, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 8 }]}>
                                    <Text style={[styles.billLabel, { fontWeight: '700', color: colors.textDark }]}>To Pay</Text>
                                    <Text style={[styles.billValue, { fontWeight: '700', fontSize: 16 }]}>₹{totalAmount}</Text>
                                </View>
                            </View>

                            {/* WhatsApp Link within scroll view */}
                            <TouchableOpacity style={styles.whatsappLink} onPress={handleAskForDiscount}>
                                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                                <Text style={styles.whatsappLinkText}>Ask for extra discount on WhatsApp</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </View>

            {/* Fixed Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{totalAmount}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                    <Text style={styles.checkoutText}>Proceed</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.white,
    },
    emptyText: {
        fontSize: 18,
        color: colors.textLight,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 24,
    },
    shopNowButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopNowText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 16,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.white,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textDark,
    },
    clearCartText: {
        color: "#EF4444",
        fontSize: 14,
        fontWeight: "600",
    },
    listContent: {
        padding: 16,
    },
    cartItemContainer: {
        flexDirection: "row",
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    placeholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0F0F0",
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 2,
    },
    itemSalt: {
        fontSize: 12,
        color: colors.textLight,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.primary,
    },
    actionsContainer: {
        alignItems: "flex-end",
    },

    // Bill Details
    billDetails: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    billTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textDark,
        marginBottom: 12,
    },
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

    // Whatsapp Link
    whatsappLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        gap: 8,
    },
    whatsappLinkText: {
        color: '#1B5E20',
        fontWeight: '600',
        fontSize: 14,
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
    checkoutButton: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 100, // Pill shape
        gap: 6,
    },
    checkoutText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 16,
    },

    // Coupon Styles
    couponSection: {
        marginBottom: 16,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    haveCouponButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    haveCouponText: {
        color: colors.primary,
        fontWeight: "600",
        marginLeft: 8,
        fontSize: 14,
    },
    couponInputContainer: {
        marginTop: 12,
    },
    inputWrapper: {
        flexDirection: "row",
        gap: 8,
    },
    couponInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        fontSize: 14,
    },
    applyButton: {
        backgroundColor: colors.textDark,
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    applyButtonText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 14,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    appliedCouponContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ECFDF5",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    appliedCouponText: {
        color: "#065F46",
        marginLeft: 8,
        fontSize: 14,
    },
    removeCouponText: {
        color: "#EF4444",
        fontSize: 12,
        fontWeight: "600",
    },
});