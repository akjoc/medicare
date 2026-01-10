import CategoryForm from "@/components/admin/categories/CategoryForm";
import { Category, CategoryPayload, CategoryService } from "@/services/categoryService";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CreateCategoryScreen() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        CategoryService.getAll().then(setCategories).catch(console.error);
    }, []);

    const handleSubmit = async (data: CategoryPayload) => {
        setIsSubmitting(true);
        try {
            await CategoryService.create(data);
            router.back();
        } catch (error) {
            console.error("Failed to create category", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.title}>Add Category</Text>
                <View style={{ width: 40 }} />
            </View>

            <CategoryForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                categories={categories}
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
});
