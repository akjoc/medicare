import ProductCard from "@/components/retailer/ProductCard";
import { Category, CategoryService } from "@/services/categoryService";
import { retailerProductService } from "@/services/retailerProduct.service";
import { colors } from "@/styles/colors";
import { APIProduct } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoryProductsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<APIProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (id) {
            fetchData(id as string);
        }
    }, [id]);

    const fetchData = async (categoryId: string, pageNum: number = 1) => {
        try {
            setIsLoading(pageNum === 1);
            setIsLoadingMore(pageNum > 1);

            let currentCategory = category;

            // If we don't have the category yet (first load), fetch it
            if (!currentCategory) {
                currentCategory = await CategoryService.getById(categoryId);
                setCategory(currentCategory);
            }

            if (currentCategory) {
                const productsResponse = await retailerProductService.getProductsByCategory(currentCategory.name, pageNum, 10);

                if (pageNum === 1) {
                    setProducts(productsResponse.products);
                } else {
                    setProducts(prev => [...prev, ...productsResponse.products]);
                }

                setPage(pageNum);
                setTotalPages(productsResponse.totalPages);
            }

        } catch (error) {
            console.error("Error fetching category data:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]} edges={["top"]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!category) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Category not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.title}>{category.name}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        onPress={() => router.push(`/(retailer)/product/${item.id}`)}
                    />
                )}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                onEndReached={() => {
                    if (!isLoadingMore && page < totalPages) {
                        fetchData(id as string, page + 1);
                    }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isLoadingMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No products in this category</Text>
                    </View>
                }
            />
        </SafeAreaView>
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
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.textDark,
    },
    listContent: {
        padding: 14,
    },
    columnWrapper: {
        justifyContent: "space-between",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    emptyText: {
        color: colors.textLight,
        fontSize: 16,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: "center" as const,
    },
});
