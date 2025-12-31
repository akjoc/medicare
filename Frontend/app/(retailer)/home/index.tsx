import ProductCard from "@/components/retailer/ProductCard";
import { APP_CONFIG } from "@/constants/app";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, Product } from "@/data/mockProducts";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, FlatList, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Filter Logic
    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim().length === 0) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const lowerText = text.toLowerCase();
        const filtered = MOCK_PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(lowerText) ||
            p.salt?.toLowerCase().includes(lowerText)
        ).slice(0, 5); // Limit to 5 max

        setSearchResults(filtered);
        setShowResults(true);
    };

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
                                    handleSearch(""); // Clear search
                                    router.push(`/(retailer)/product/${item.id}`);
                                }}
                            >
                                <Ionicons name="medical-outline" size={16} color={colors.textLight} style={{ marginRight: 10 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.resultName}>{item.name}</Text>
                                    {item.salt && <Text style={styles.resultSalt} numberOfLines={1}>{item.salt}</Text>}
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );

    const renderBanner = () => (
        <View style={styles.bannerContainer}>
            <View style={styles.bannerPlaceholder}>
                <Text style={styles.bannerText}>Special Offer</Text>
                <Text style={styles.bannerSubText}>Get Flat 20% OFF on First Order</Text>
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

    const renderSection = (categoryName: string, data: Product[]) => {
        if (!data || data.length === 0) return null;

        return (
            <View style={styles.sectionContainer} key={categoryName}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{categoryName}</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={data}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={{ width: 160, marginRight: 12 }}>
                            <ProductCard
                                product={item}
                                onPress={() => router.push(`/(retailer)/product/${item.id}`)}
                            />
                        </View>
                    )}
                    contentContainerStyle={styles.horizontalList}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            {renderHeader()}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled" // Important for search clicks
            >
                {renderBanner()}
                {renderQuickActions()}

                {/* Dynamic Categories */}
                {MOCK_CATEGORIES.map(category => {
                    const categoryProducts = MOCK_PRODUCTS.filter(p => p.categoryId === category.id);
                    return renderSection(category.name, categoryProducts);
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
        paddingVertical: 8,
        maxHeight: 300,
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
    horizontalList: {
        paddingHorizontal: 20,
    },
});
