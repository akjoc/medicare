import { useCart } from "@/context/CartContext";
import { colors } from "@/styles/colors";
import { APIProduct } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
    product: APIProduct;
    onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
    const { addToCart, getItemQuantity, updateQuantity } = useCart();
    const hasImage = product.imageUrls && product.imageUrls.length > 0;
    const isOutOfStock = product.stock <= 0;

    // Calculate discount
    const price = Number(product.price);
    const salePrice = product.salePrice ? Number(product.salePrice) : 0;
    const discount = salePrice > 0 ? Math.round(((price - salePrice) / price) * 100) : 0;

    const handleAddToCart = () => {
        addToCart(product.id);
    };

    const handleUpdateQuantity = (newQty: number) => {
        updateQuantity(product.id, newQty);
    };

    const handleQuantityTextChange = (text: string) => {
        const qty = parseInt(text);
        if (!isNaN(qty)) {
            updateQuantity(product.id, qty);
        } else if (text === "") {
            // Optional: Handle empty input if needed, but safer to do nothing or set to 0
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, isOutOfStock && styles.outOfStock]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                {hasImage ? (
                    <Image source={{ uri: product.imageUrls[0] }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="image-outline" size={40} color={colors.textLight} />
                    </View>
                )}
                {salePrice > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                            {Math.round(((price - salePrice) / price) * 100)}% OFF
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>
                {product.salt && product.salt.length > 0 && (
                    <Text style={styles.salt} numberOfLines={1}>
                        {product.salt.join(", ")}
                    </Text>
                )}

                <View style={styles.priceContainer}>
                    <Text style={styles.price}>
                        ₹{product.salePrice || product.price}
                    </Text>
                    {product.salePrice && (
                        <Text style={styles.originalPrice}>₹{product.price}</Text>
                    )}
                </View>

                <View style={styles.footer}>
                    {isOutOfStock ? (
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    ) : (
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.stockText}>In Stock</Text>

                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart();
                                }}
                            >
                                <Ionicons name="add" size={20} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        flex: 1,
        // For grid layout
        marginHorizontal: 6,
    },
    outOfStock: {
        opacity: 0.7,
    },
    imageContainer: {
        height: 140,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
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
    discountBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: "#EF4444",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: "700",
    },
    content: {
        padding: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 4,
        height: 40,
    },
    salt: {
        fontSize: 12,
        color: colors.textLight,
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 6,
        marginBottom: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.primary,
    },
    originalPrice: {
        fontSize: 12,
        color: colors.textLight,
        textDecorationLine: "line-through",
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
        minHeight: 32, // Reserve space
    },
    stockText: {
        fontSize: 12,
        color: "#28A745",
        fontWeight: "500",
    },
    outOfStockText: {
        fontSize: 12,
        color: "#EF4444",
        fontWeight: "500",
    },
    addButton: {
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
});
