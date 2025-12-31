import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/data/mockProducts";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [activeSlide, setActiveSlide] = useState(0);

    const product = MOCK_PRODUCTS.find(p => p.id === id);
    const category = product ? MOCK_CATEGORIES.find(c => c.id === product.categoryId) : null;

    if (!product) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Product not found</Text>
            </SafeAreaView>
        );
    }

    const hasImages = product.images && product.images.length > 0;
    const isOutOfStock = product.status === "out_of_stock";

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Back Button Overlay */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>

                {/* Images Slider */}
                <View style={styles.imageContainer}>
                    {hasImages ? (
                        <>
                            <FlatList
                                data={product.images}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={(event) => {
                                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                                    setActiveSlide(index);
                                }}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <Image
                                        source={{ uri: item }}
                                        style={styles.image}
                                        resizeMode="contain"
                                    />
                                )}
                            />
                            {product.images.length > 1 && (
                                <View style={styles.pagination}>
                                    {product.images.map((_, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.paginationDot,
                                                index === activeSlide && styles.paginationDotActive
                                            ]}
                                        />
                                    ))}
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Ionicons name="image-outline" size={80} color={colors.textLight} />
                            <Text style={styles.placeholderText}>No Image Available</Text>
                        </View>
                    )}
                </View>

                <View style={styles.detailsContainer}>
                    {/* Basic Info */}
                    <View style={styles.headerRow}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{category?.name || "Medicine"}</Text>
                        </View>
                        {isOutOfStock ? (
                            <View style={[styles.stockBadge, { backgroundColor: "#FEE2E2" }]}>
                                <Text style={[styles.stockText, { color: "#EF4444" }]}>Out of Stock</Text>
                            </View>
                        ) : (
                            <View style={[styles.stockBadge, { backgroundColor: "#DCFCE7" }]}>
                                <Text style={[styles.stockText, { color: "#166534" }]}>In Stock: {product.stock}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.name}>{product.name}</Text>
                    {product.salt && (
                        <Text style={styles.salt}>{product.salt}</Text>
                    )}

                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.label}>Price</Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.price}>₹{product.salePrice || product.price}</Text>
                                {product.salePrice && (
                                    <Text style={styles.originalPrice}>₹{product.price}</Text>
                                )}
                            </View>
                        </View>
                        {product.salePrice && (
                            <View style={styles.discountTag}>
                                <Text style={styles.discountTagText}>
                                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}% Save
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* Description */}
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    <View style={styles.divider} />

                    {/* Additional Details */}
                    <Text style={styles.sectionTitle}>Product Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>SKU</Text>
                        <Text style={styles.detailValue}>{product.sku}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Category</Text>
                        <Text style={styles.detailValue}>{category?.name}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.addToCartButton, isOutOfStock && styles.disabledButton]}
                    disabled={isOutOfStock}
                >
                    <Ionicons name="cart-outline" size={24} color={colors.white} />
                    <Text style={styles.addToCartText}>
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </Text>
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
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingBottom: 100,
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        width: width,
        height: 300,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: width,
        height: 300,
    },
    placeholderContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        backgroundColor: "#F8F9FA",
    },
    placeholderText: {
        marginTop: 12,
        color: colors.textLight,
        fontSize: 16,
    },
    pagination: {
        flexDirection: "row",
        position: "absolute",
        bottom: 16,
        alignSelf: "center",
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#D1D5DB",
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: colors.primary,
        width: 20,
    },
    detailsContainer: {
        padding: 20,
        backgroundColor: colors.white,
        marginTop: 10, // Small gap
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: 400,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "#E0F2FE",
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#0284C7",
    },
    stockBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    stockText: {
        fontSize: 12,
        fontWeight: "600",
    },
    name: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.textDark,
        marginBottom: 4,
    },
    salt: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 20,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        color: colors.textLight,
        marginBottom: 2,
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 8,
    },
    price: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.primary,
    },
    originalPrice: {
        fontSize: 16,
        color: colors.textLight,
        textDecorationLine: "line-through",
    },
    discountTag: {
        backgroundColor: "#FEF2F2",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    discountTagText: {
        color: "#EF4444",
        fontWeight: "700",
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: colors.textLight,
    },
    detailRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    detailLabel: {
        width: 100,
        fontSize: 14,
        color: colors.textLight,
    },
    detailValue: {
        flex: 1,
        fontSize: 14,
        color: colors.textDark,
        fontWeight: "500",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: 30, // Safe area
    },
    addToCartButton: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledButton: {
        backgroundColor: colors.textLight,
        shadowOpacity: 0,
        elevation: 0,
    },
    addToCartText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: "600",
    },
});
