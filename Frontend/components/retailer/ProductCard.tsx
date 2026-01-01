import { useCart } from "@/context/CartContext";
import { Product } from "@/data/mockProducts";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
    product: Product;
    onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
    const { addToCart } = useCart();
    const hasImage = product.images && product.images.length > 0;
    const isOutOfStock = product.status === "out_of_stock";

    const handleAddToCart = () => {
        addToCart(product);
    };

    return (
        <TouchableOpacity
            style={[styles.container, isOutOfStock && styles.outOfStock]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                {hasImage ? (
                    <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="image-outline" size={40} color={colors.textLight} />
                    </View>
                )}
                {product.salePrice && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                            {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>
                {product.salt && (
                    <Text style={styles.salt} numberOfLines={1}>
                        {product.salt}
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
                        <Text style={styles.stockText}>In Stock</Text>
                    )}

                    {!isOutOfStock && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleAddToCart();
                            }}
                        >
                            <Ionicons name="add" size={20} color={colors.white} />
                        </TouchableOpacity>
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
