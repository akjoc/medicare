import ProductCard from "@/components/retailer/ProductCard";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, Product } from "@/data/mockProducts";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = (text: string) => {
        setQuery(text);
        if (text.trim() === "") {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setHasSearched(true);
        const lowerText = text.toLowerCase();

        const filtered = MOCK_PRODUCTS.filter(p => {
            const matchesName = p.name.toLowerCase().includes(lowerText);
            const matchesSalt = p.salt?.toLowerCase().includes(lowerText);

            // Find category name
            const category = MOCK_CATEGORIES.find(c => c.id === p.categoryId);
            const matchesCategory = category?.name.toLowerCase().includes(lowerText);

            return matchesName || matchesSalt || matchesCategory;
        });

        setResults(filtered);
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
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch("")}>
                            <Ionicons name="close-circle" size={20} color={colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
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
                    hasSearched ? (
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