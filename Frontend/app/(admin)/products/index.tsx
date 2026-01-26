import BulkUploadModal from "@/components/admin/products/BulkUploadModal";
import ProductItem from "@/components/admin/products/ProductItem";
import { Product } from "@/data/mockProducts";
import { productService } from "@/services/productService";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProductsScreen() {

    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Debounce search query with 500ms delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset page on search
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadData = useCallback(async (isLoadMore = false) => {
        if (!isLoadMore) setLoading(true);
        try {
            const currentPage = isLoadMore ? page + 1 : 1;
            console.log(`Fetching products page ${currentPage}...`);

            const response = debouncedSearchQuery.trim()
                ? await productService.searchProducts(debouncedSearchQuery.trim(), currentPage)
                : await productService.getProducts(currentPage);

            if (isLoadMore) {
                setProducts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newProducts = response.products.filter((p: any) => !existingIds.has(p.id));
                    return [...prev, ...newProducts];
                });
                setPage(currentPage);
            } else {
                setProducts(response.products);
                setPage(1);
            }
            setTotalPages(response.totalPages);
        } catch (error: any) {
            console.error("Failed to fetch products", error);
            const message = error.response?.data?.message || "Failed to fetch products";
            Alert.alert("Error", message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [debouncedSearchQuery, page]);

    // Initial load
    useFocusEffect(
        useCallback(() => {
            loadData(false);
        }, [debouncedSearchQuery]) // Depend only on query changing, handled by useEffect above for initial trigger? 
        // Actually, let's keep it simple. useFocusEffect with useCallback dependency on debouncedSearchQuery might loop if loadData changes?
        // Let's refactor slightly to be safer
    );

    // Better Focus Effect handling to avoid loops/stale closures
    useFocusEffect(
        useCallback(() => {
            // When screen focuses, if we have a query, it might trigger. 
            // We want to refresh list on focus essentially.
            setPage(1);

            const fetchInitial = async () => {
                setLoading(true);
                try {
                    const response = debouncedSearchQuery.trim()
                        ? await productService.searchProducts(debouncedSearchQuery.trim(), 1)
                        : await productService.getProducts(1);
                    setProducts(response.products);
                    setTotalPages(response.totalPages);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchInitial();
        }, [debouncedSearchQuery])
    );

    const handleLoadMore = () => {
        if (!loadingMore && !loading && page < totalPages) {
            setLoadingMore(true);
            loadData(true);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Delete Product",
            "Are you sure you want to delete this product?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await productService.deleteProduct(id);
                            // Refresh current list - easiest is to reload first page
                            loadData(false);
                            Alert.alert("Success", "Product deleted successfully");
                        } catch (error: any) {
                            console.error("Delete product error:", error);
                            const message = error.response?.data?.message || "Failed to delete product";
                            Alert.alert("Error", message);
                        }
                    }
                }
            ]
        );
    };

    const handleBulkUpload = async (file: any, onProgress: (p: number) => void) => {
        try {
            await productService.bulkUploadProducts(file, onProgress);
            // Refresh list after successful upload
            loadData(false);
        } catch (error: any) {
            console.error("Bulk upload error:", error);
            // Propagate error to modal for handling
            throw error;
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.center}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Products</Text>
                    <Text style={styles.subtitle}>{products.length} Items</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push("/(admin)/products/create")}
                >
                    <Ionicons name="add" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
                <View style={[styles.searchContainer, { flex: 1 }]}>
                    <Ionicons name="search" size={20} color={colors.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search products..."
                        placeholderTextColor={colors.textLight}
                    />
                </View>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowUploadModal(true)}
                >
                    <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.push("/(admin)/products/categories")}
                >
                    <Ionicons name="grid-outline" size={24} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.push("/(admin)/products/companies")}
                >
                    <Ionicons name="business-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {loading && !loadingMore ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <ProductItem
                            product={item}
                            onPress={() => router.push(`/(admin)/products/${item.id}`)}
                            onDelete={() => handleDelete(item.id.toString())}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No products found</Text>
                        </View>
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            )}

            <BulkUploadModal
                visible={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUpload={handleBulkUpload}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: colors.textDark,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textLight,
        fontWeight: "500",
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },
    actionRow: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: colors.textDark,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    emptyText: {
        color: colors.textLight,
        fontSize: 16,
    },
});