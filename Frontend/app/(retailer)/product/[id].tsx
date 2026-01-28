import QuantitySelector from "@/components/retailer/QuantitySelector";
import { useCart } from "@/context/CartContext";
import { Category, CategoryService } from "@/services/categoryService";
import { retailerProductService } from "@/services/retailerProduct.service";
import { colors } from "@/styles/colors";
import { APIProduct } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeSlide, setActiveSlide] = useState(0);
    const { addToCart, getItemQuantity, updateQuantity } = useCart();

    const [product, setProduct] = useState<APIProduct | null>(null);
    const [category, setCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchProductDetails(id as string);
        }
    }, [id]);

    const fetchProductDetails = async (productId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const productData = await retailerProductService.getProductById(productId);
            setProduct(productData);

            if (productData && productData.CategoryId) {
                const categoryData = await CategoryService.getById(productData.CategoryId.toString());
                setCategory(categoryData);
            }
        } catch (err) {
            console.error("Error fetching details:", err);
            setError("Failed to load product details");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={{ color: colors.textLight, marginBottom: 20 }}>{error || "Product not found"}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.addToCartButton}>
                    <Text style={styles.addToCartText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const hasImages = product.imageUrls && product.imageUrls.length > 0;
    const isOutOfStock = product.stock <= 0;

    // Get current quantity
    const quantity = getItemQuantity(product.id);

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
        }
    };

    // Help extract data from nested arrays if needed
    const getFlattenedArray = (data: string[] | string[][] | undefined) => {
        if (!data) return [];
        return data.flat().filter(Boolean);
    };

    const saltDisplay = getFlattenedArray(product.salt);
    const companyDisplay = product.Company?.name || getFlattenedArray(product.companies)[0] || "N/A";

    // Parse prices
    const price = Number(product.price);
    const salePrice = product.salePrice ? Number(product.salePrice) : 0;
    const currentPrice = salePrice > 0 ? salePrice : price;

    return (
        <View style={styles.container}>
            {/* Sticky Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity
                    style={styles.headerBackButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {product?.name || "Product Details"}
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 60 }
                ]}
                showsVerticalScrollIndicator={false}
            >

                {/* Images Slider */}
                <View style={styles.imageContainer}>
                    {hasImages ? (
                        <>
                            <FlatList
                                data={product.imageUrls}
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
                            {product.imageUrls.length > 1 && (
                                <View style={styles.pagination}>
                                    {product.imageUrls.map((_, index) => (
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
                            <Text style={styles.categoryText}>{product.Categories?.[0]?.name || category?.name || "Medicine"}</Text>
                        </View>
                        {isOutOfStock ? (
                            <View style={[styles.stockBadge, { backgroundColor: "#FEE2E2" }]}>
                                <Text style={[styles.stockText, { color: "#EF4444" }]}>Out of Stock</Text>
                            </View>
                        ) : (
                            <View style={[styles.stockBadge, { backgroundColor: "#DCFCE7" }]}>
                                <Text style={[styles.stockText, { color: "#166534" }]}>In Stock</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.name}>{product.name}</Text>
                    {saltDisplay.length > 0 && (
                        <View style={styles.saltContainer}>
                            <Text style={styles.saltLabel}>Composition:</Text>
                            <Text style={styles.saltText}>{saltDisplay.join(", ")}</Text>
                        </View>
                    )}

                    <View style={styles.priceSection}>
                        <View style={styles.priceRow}>
                            <View>
                                <Text style={styles.label}>Retailer Price</Text>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.price}>₹{currentPrice}</Text>
                                    {salePrice > 0 && (
                                        <Text style={styles.originalPrice}>₹{price}</Text>
                                    )}
                                </View>
                            </View>
                            {salePrice > 0 && (
                                <View style={styles.discountTag}>
                                    <Text style={styles.discountTagText}>
                                        {Math.round(((price - salePrice) / price) * 100)}% Save
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Product Highlights */}
                    <View style={styles.highlightGrid}>
                        <View style={styles.highlightItem}>
                            <Ionicons name="apps-outline" size={20} color={colors.primary} />
                            <View>
                                <Text style={styles.highlightLabel}>Packing</Text>
                                <Text style={styles.highlightValue}>{product.packing || "N/A"}</Text>
                            </View>
                        </View>
                        <View style={styles.highlightItem}>
                            <Ionicons name="thermometer-outline" size={20} color={colors.primary} />
                            <View>
                                <Text style={styles.highlightLabel}>Dosage</Text>
                                <Text style={styles.highlightValue}>{product.dosage || "N/A"}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.cardSection}>
                        <Text style={styles.sectionTitle}>Manufacturer</Text>
                        <View style={styles.manufacturerInfo}>
                            <Ionicons name="business-outline" size={20} color={colors.textLight} />
                            <Text style={styles.manufacturerName}>{companyDisplay}</Text>
                        </View>
                    </View>

                    <View style={styles.cardSection}>
                        <Text style={styles.sectionTitle}>Product Description</Text>
                        <Text style={styles.description}>{product.description || "No additional description provided for this product. Please contact the manufacturer for specific details."}</Text>
                    </View>

                    <View style={styles.cardSection}>
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>SKU</Text>
                            <Text style={styles.detailValue}>{product.sku || "N/A"}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Shelf Life</Text>
                            <Text style={styles.detailValue}>{product.expiry || "Not mentioned"}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Stock Available</Text>
                            <Text style={styles.detailValue}>{product.stock} units</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.footer, { paddingBottom: insets.bottom - 25 || 20 }]}>
                {isOutOfStock ? (
                    <TouchableOpacity
                        style={[styles.addToCartButton, styles.disabledButton]}
                        disabled={true}
                    >
                        <Text style={styles.addToCartText}>Out of Stock</Text>
                    </TouchableOpacity>
                ) : quantity > 0 ? (
                    <View style={styles.quantityContainer}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.quantityLabel}>Cart Total</Text>
                            <Text style={styles.quantityTotal}>₹{(currentPrice * quantity).toFixed(2)}</Text>
                        </View>
                        <QuantitySelector
                            quantity={quantity}
                            onIncrease={() => handleUpdateQuantity(quantity + 1)}
                            onDecrease={() => handleUpdateQuantity(quantity - 1)}
                            onChangeText={handleQuantityTextChange}
                        />
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={handleAddToCart}
                    >
                        <Ionicons name="cart-outline" size={24} color={colors.white} />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                )}
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
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: colors.white,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    headerBackButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: colors.textDark,
        flex: 1,
        textAlign: "center",
    },
    imageContainer: {
        width: width,
        height: 380,
        backgroundColor: colors.white,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 10,
    },
    image: {
        width: width,
        height: 350,
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
        bottom: 20,
        alignSelf: "center",
        backgroundColor: "rgba(255,255,255,0.8)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#D1D5DB",
        marginHorizontal: 3,
    },
    paginationDotActive: {
        backgroundColor: colors.primary,
        width: 16,
    },
    detailsContainer: {
        padding: 20,
        backgroundColor: colors.white,
        marginTop: -30,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#E0F2FE",
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#0369A1",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    stockBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    stockText: {
        fontSize: 12,
        fontWeight: "700",
    },
    name: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.textDark,
        marginBottom: 8,
    },
    saltContainer: {
        backgroundColor: "#F9FAFB",
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    saltLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textLight,
        marginBottom: 4,
    },
    saltText: {
        fontSize: 14,
        color: colors.textDark,
        lineHeight: 20,
        fontWeight: "500",
    },
    priceSection: {
        marginBottom: 24,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    label: {
        fontSize: 13,
        color: colors.textLight,
        marginBottom: 4,
        fontWeight: "500",
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 8,
    },
    price: {
        fontSize: 32,
        fontWeight: "900",
        color: colors.primary,
    },
    originalPrice: {
        fontSize: 18,
        color: colors.textLight,
        textDecorationLine: "line-through",
        fontWeight: "400",
    },
    discountTag: {
        backgroundColor: "#DCFCE7",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 4,
    },
    discountTagText: {
        color: "#166534",
        fontWeight: "800",
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 20,
    },
    highlightGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    highlightItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        padding: 12,
        borderRadius: 16,
        gap: 10,
    },
    highlightLabel: {
        fontSize: 11,
        color: colors.textLight,
        fontWeight: "500",
    },
    highlightValue: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textDark,
    },
    cardSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textDark,
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: "#4B5563",
    },
    manufacturerInfo: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        padding: 16,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    manufacturerName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textDark,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    detailLabel: {
        fontSize: 14,
        color: colors.textLight,
        fontWeight: "500",
    },
    detailValue: {
        fontSize: 14,
        color: colors.textDark,
        fontWeight: "600",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    addToCartButton: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        borderRadius: 20,
        gap: 10,
    },
    disabledButton: {
        backgroundColor: "#D1D5DB",
    },
    addToCartText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: "700",
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F9FAFB",
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    quantityLabel: {
        fontSize: 12,
        color: colors.textLight,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    quantityTotal: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.primary,
    },
});
