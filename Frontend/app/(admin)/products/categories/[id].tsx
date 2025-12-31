import CategoryForm from "@/components/admin/categories/CategoryForm";
import { Category } from "@/data/mockProducts";
import { CategoryService } from "@/services/categoryService";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EditCategoryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategory = async () => {
            if (typeof id === 'string') {
                const data = await CategoryService.getById(id);
                setCategory(data || null);
            }
            setLoading(false);
        };
        fetchCategory();
    }, [id]);

    const handleSubmit = async (data: Omit<Category, "id" | "productCount">) => {
        if (!id) return;
        setIsSubmitting(true);
        await CategoryService.update(id as string, data);
        setIsSubmitting(false);
        router.back();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!category) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Error</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.center}>
                    <Text>Category not found</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Category</Text>
                <View style={{ width: 40 }} />
            </View>

            <CategoryForm
                initialValues={category}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
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
        fontSize: 20,
        fontWeight: "700",
        color: colors.textDark,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
