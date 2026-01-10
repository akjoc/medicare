import CategoryItem from "@/components/admin/categories/CategoryItem";
import { Category, CategoryService } from "@/services/categoryService";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * CategoriesScreen
 * 
 * Displays a list of all categories.
 * Allows navigation to Create and Edit screens.
 */
export default function CategoriesScreen() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await CategoryService.getAll();
            setCategories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete "${name}"?`,
            [
                {
                    text: "No",
                    style: "cancel",
                },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await CategoryService.delete(id);
                            await loadData();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete category");
                            console.error(error);
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const organizedCategories = useMemo(() => {
        const flattenCategories = (cats: Category[], level = 0): (Category & { level: number })[] => {
            let result: (Category & { level: number })[] = [];
            cats.forEach(cat => {
                result.push({ ...cat, level });
                if (cat.subCategories && cat.subCategories.length > 0) {
                    result.push(...flattenCategories(cat.subCategories, level + 1));
                }
            });
            return result;
        };

        return flattenCategories(categories);
    }, [categories]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Custom Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.title}>Categories</Text>
                <View style={{ width: 40 }} />
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push("/(admin)/products/categories/create")}
            >
                <Ionicons name="add" size={24} color={colors.white} />
                <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>

            <FlatList
                data={organizedCategories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ paddingLeft: (item as any).level * 20 }}>
                        <CategoryItem
                            category={item}
                            onPress={() => router.push(`/(admin)/products/categories/${item.id}`)}
                            onDelete={() => handleDelete(item.id, item.name)}
                        />
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No categories found</Text>
                }
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
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.textDark,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        marginHorizontal: 20,
        padding: 12,
        borderRadius: 12,
        justifyContent: "center",
        gap: 8,
        marginBottom: 20,
    },
    addButtonText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: "center",
        color: colors.textLight,
        marginTop: 20,
    },
});
