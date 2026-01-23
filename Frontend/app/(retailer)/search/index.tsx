import ProductCard from "@/components/retailer/ProductCard";
import { retailerProductService } from "@/services/retailerProduct.service";
import { colors } from "@/styles/colors";
import { APIProduct } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
    const router = useRouter();
    const { q } = useLocalSearchParams<{ q?: string }>();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<APIProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (q) {
            setQuery(q);
            performSearch(q);
        }
    }, [q]);

    useEffect(() => {
        if (query.trim() === "" || query === q) return;

        const timer = setTimeout(() => {
            performSearch(query);
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = (text: string) => {
        setQuery(text);
        if (text.trim() === "") {
            setResults([]);
            setHasSearched(false);
        }
    };

    const performSearch = async (text: string) => {
        setHasSearched(true);
        setIsLoading(true);

        try {
            const data = await retailerProductService.searchProducts(text);
            setResults(data.products);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={colors.textLight} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search medicines, salts, categories..."
                        value={query}
                        onChangeText={handleSearch}
                        placeholderTextColor={colors.textLight}
                        autoFocus
                    />
                    {isLoading && (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                    )}
                    {query.length > 0 && !isLoading && (
                        <TouchableOpacity onPress={() => handleSearch("")}>
                            <Ionicons name="close-circle" size={20} color={colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={results}
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
                ListEmptyComponent={
                    hasSearched && query.trim() !== "" ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={64} color={colors.border} />
                            <Text style={styles.emptyText}>No results found for "{query}"</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="medical-outline" size={64} color={colors.border} />
                            <Text style={styles.emptyText}>Search by Name, Salt, or Category</Text>
                        </View>
                    )
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
    header: {
        padding: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: colors.textDark,
        height: "100%",
    },
    listContent: {
        padding: 14,
        flexGrow: 1,
    },
    columnWrapper: {
        justifyContent: "space-between",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.textLight,
        textAlign: "center",
    },
});
