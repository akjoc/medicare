import ProductCard from "@/components/retailer/ProductCard";
import { APP_CONFIG } from "@/constants/app";
import { retailerCategoryService } from "@/services/retailerCategory.service";
import { retailerProductService } from "@/services/retailerProduct.service";
import { colors } from "@/styles/colors";
import { APICategory, APIProduct } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Data State
    const [products, setProducts] = useState<APIProduct[]>([]);
    const [categories, setCategories] = useState<APICategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<APIProduct[]>([]);
    const [totalSearchResults, setTotalSearchResults] = useState(0);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [productsResponse, categoriesData] = await Promise.all([
                retailerProductService.getProducts(1),
                retailerCategoryService.getAllCategories(),
            ]);

            setPage(1); // Reset page on refresh

            // Safely handle products response
            let productsData: APIProduct[] = [];
            if (productsResponse && productsResponse.products && Array.isArray(productsResponse.products)) {
                productsData = productsResponse.products;
                setTotalPages(productsResponse.totalPages || 1);
            } else if (Array.isArray(productsResponse)) {
                // Fallback if API returns direct array
                console.warn("API returned direct array for products");
                productsData = productsResponse as unknown as APIProduct[];
            } else {
                console.error("Invalid products response:", productsResponse);
            }
            setProducts(productsData);

            // Safely handle categories
            if (!categoriesData || !Array.isArray(categoriesData)) {
                console.error("Invalid categories data:", categoriesData);
                setCategories([]);
                return;
            }

            // Flatten categories to show sections for subcategories too
            const flattened: APICategory[] = [];
            const flatten = (cats: APICategory[]) => {
                if (!cats) return;
                cats.forEach(c => {
                    flattened.push(c);
                    if (c.subCategories && c.subCategories.length > 0) {
                        flatten(c.subCategories);
                    }
                });
            };
            flatten(categoriesData);
            setCategories(flattened);
        } catch (error) {
            console.error("Error fetching data:", error);
            // Ensure no undefined state
            setProducts([]);
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreProducts = async () => {
        if (isMoreLoading || page >= totalPages) return;

        try {
            setIsMoreLoading(true);
            const nextPage = page + 1;
            console.log(`Loading more products: page ${nextPage}`);

            const response = await retailerProductService.getProducts(nextPage);

            setProducts(prev => [...prev, ...response.products]);
            setPage(nextPage);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Error loading more products:", error);
        } finally {
            setIsMoreLoading(false);
        }
    };

    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };


    // Filter Logic
    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim().length === 0) {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim().length === 0) return;

        const timer = setTimeout(async () => {
            try {
                const data = await retailerProductService.searchProducts(searchQuery);
                setTotalSearchResults(data.totalProducts || data.products.length);
                setSearchResults(data.products.slice(0, 5));
                setShowResults(true);
            } catch (error) {
                console.error("Error searching products:", error);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const renderHeader = () => (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <View style={styles.headerContent}>
                <View>
                    <Text style={styles.logoText}>{APP_CONFIG.NAME}<Text style={styles.logoPlus}>+</Text></Text>
                    <Text style={styles.tagline}>{APP_CONFIG.TAGLINE}</Text>
                </View>
                {/* Notification Icon Placeholder */}
                <TouchableOpacity>
                    <Ionicons name="notifications-outline" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            <View style={{ zIndex: 10 }}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.primary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search medicines, salts..."
                        placeholderTextColor={colors.textLight}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        onFocus={() => {
                            if (searchQuery.length > 0) setShowResults(true);
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch("")}>
                            <Ionicons name="close-circle" size={20} color={colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Dropdown Results */}
                {showResults && searchResults.length > 0 && (
                    <View style={styles.searchResultsContainer}>
                        {searchResults.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.searchResultItem}
                                onPress={() => {
                                    setSearchQuery(""); // Clear search
                                    setShowResults(false);
                                    router.push(`/(retailer)/product/${item.id}`);
                                }}
                            >
                                <Ionicons name="medical-outline" size={16} color={colors.textLight} style={{ marginRight: 10 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.resultName}>{item.name}</Text>
                                    {item.salt && item.salt.length > 0 && <Text style={styles.resultSalt} numberOfLines={1}>{item.salt.join(", ")}</Text>}
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                            </TouchableOpacity>
                        ))}
                        {totalSearchResults > 5 && (
                            <TouchableOpacity
                                style={styles.seeMoreButton}
                                onPress={() => {
                                    setShowResults(false);
                                    router.push({
                                        pathname: "/(retailer)/search",
                                        params: { q: searchQuery }
                                    });
                                }}
                            >
                                <Text style={styles.seeMoreText}>See More Results ({totalSearchResults - 5}+)</Text>
                                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    );

    const renderBanner = () => (
        <View style={styles.bannerContainer}>
            <View style={styles.bannerPlaceholder}>
                <Text style={styles.bannerText}>Your B2B Partner</Text>
                <Text style={styles.bannerSubText}>Get medicines at best prices</Text>
            </View>
        </View>
    );

    const renderQuickActions = () => (
        <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: "#EC4899" }]}>
                <View style={styles.quickActionContent}>
                    <Text style={styles.quickActionTitle}>
                        Place your order instantly
                    </Text>
                    <View style={styles.quickActionIconRow}>
                        <Ionicons name="alarm-outline" size={32} color="#FFF" />
                    </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: "#14B8A6" }]}>
                <View style={styles.quickActionContent}>
                    <Text style={styles.quickActionTitle}>
                        Upload Prescription
                    </Text>
                    <View style={styles.quickActionIconRow}>
                        <Ionicons name="document-text-outline" size={32} color="#FFF" />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            {renderHeader()}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScroll={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent)) {
                        loadMoreProducts();
                    }
                }}
                scrollEventThrottle={400}
            >
                {renderBanner()}
                {/* {renderQuickActions()} */}

                {/* Dynamic Categories */}
                {categories.map(category => {
                    const categoryProducts = (products || []).filter(p => {
                        // Check direct ID
                        // @ts-ignore
                        if ((p.categoryId || p.CategoryId) === category.id) return true;

                        // Check Categories array (if backend returns populated categories)
                        // @ts-ignore
                        if (p.Categories && Array.isArray(p.Categories)) {
                            // @ts-ignore
                            return p.Categories.some(c => c.id === category.id);
                        }

                        return false;
                    });

                    if (categoryProducts.length === 0) return null;

                    // Show only first 6 products on home screen
                    const displayProducts = categoryProducts.slice(0, 6);

                    return (
                        <View style={styles.sectionContainer} key={category.id}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{category.name}</Text>
                                <TouchableOpacity onPress={() => router.push(`/(retailer)/categories/${category.id}`)}>
                                    <Text style={styles.seeAll}>See All</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.gridContainer}>
                                {displayProducts.map((product) => (
                                    <View key={product.id} style={styles.gridItem}>
                                        <ProductCard
                                            product={product}
                                            onPress={() => router.push(`/(retailer)/product/${product.id}`)}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    headerContainer: {
        backgroundColor: colors.primary,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        zIndex: 100, // Ensure dropdown is on top
    },
    headerContent: {
        marginBottom: 16,
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    logoText: {
        fontSize: 24,
        fontWeight: "900",
        color: colors.white,
        fontStyle: "italic",
    },
    logoPlus: {
        color: "#EF4444",
    },
    tagline: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.8)",
        fontWeight: "500",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: colors.textDark,
    },
    searchResultsContainer: {
        position: "absolute",
        top: 55, // Height of input + margin
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderRadius: 12,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        paddingBottom: 8, // Added padding to prevent cropping
        maxHeight: 400, // Slightly increased to accommodate See More button
    },
    seeMoreButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        backgroundColor: colors.white,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    seeMoreText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.primary,
        marginRight: 6,
    },
    searchResultItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    resultName: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
    },
    resultSalt: {
        fontSize: 12,
        color: colors.textLight,
    },
    scrollContent: {
        paddingTop: 20,
        paddingBottom: 40,
        zIndex: 1, // Lower z-index than header
    },
    bannerContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    bannerPlaceholder: {
        height: 160,
        backgroundColor: "#4F46E5",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    bannerText: {
        color: "#FFF",
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 8,
    },
    bannerSubText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 16,
    },
    quickActionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    quickActionCard: {
        width: (width - 50) / 2,
        height: 100,
        borderRadius: 16,
        padding: 16,
        justifyContent: "center",
    },
    quickActionContent: {
        flex: 1,
        justifyContent: "space-between",
    },
    quickActionTitle: {
        color: colors.white,
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 18,
    },
    quickActionIconRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textDark,
    },
    seeAll: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: "600",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 14,
    },
    gridItem: {
        width: "50%",
        marginBottom: 12,
        paddingHorizontal: 6,
    },
});
