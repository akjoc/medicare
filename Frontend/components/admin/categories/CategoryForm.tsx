import { Category, CategoryPayload } from "@/services/categoryService";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface CategoryFormProps {
    initialValues?: Partial<Category>;
    onSubmit: (data: CategoryPayload) => Promise<void>;
    isSubmitting?: boolean;
    categories?: Category[]; // List of existing categories for parent selection
}

/**
 * CategoryForm Component
 * 
 * Reusable form for creating and updating categories.
 * Includes support for selecting a parent category.
 */
export default function CategoryForm({
    initialValues,
    onSubmit,
    isSubmitting = false,
    categories = [],
}: CategoryFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<CategoryPayload>({
        name: initialValues?.name || "",
        description: initialValues?.description || "",
        parentId: initialValues?.parentId || null, // null means top-level
    });

    // Handle status separately if it's not part of the payload but needed for UI state (though type def doesn't have it, assuming it might be needed or was legacy)
    // The previous code had "status" but the new payload definition might not. 
    // Checking the previous file... it had status and image. 
    // The new service payload only has name, description, parentId.
    // I will stick to the service payload definition to avoid errors.
    // If the user wants status/image they should create backend support first.

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Flatten generic category tree for dropdown
    const allCategoriesFlat = (() => {
        const flatten = (cats: Category[]): Category[] => {
            let res: Category[] = [];
            cats.forEach(c => {
                res.push(c);
                if (c.subCategories) res.push(...flatten(c.subCategories));
            });
            return res;
        };
        return flatten(categories);
    })();

    // Filter potential parents (exclude self if editing)
    const potentialParents = allCategoriesFlat.filter(c => c.id !== initialValues?.id);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Category name is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validate()) {
            await onSubmit(formData);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        value={formData.name}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        placeholder="e.g., Electronics"
                        placeholderTextColor={colors.textLight}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                        placeholder="Optional description"
                        placeholderTextColor={colors.textLight}
                        multiline
                    />
                </View>

                {/* Parent Category Selection */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Parent Category</Text>
                    <View style={styles.optionList}>
                        <TouchableOpacity
                            style={[
                                styles.optionItem,
                                !formData.parentId && styles.optionSelected,
                            ]}
                            onPress={() => setFormData(prev => ({ ...prev, parentId: null }))}
                        >
                            <Text style={[
                                styles.optionText,
                                !formData.parentId && styles.optionTextSelected
                            ]}>None (Top Level)</Text>
                        </TouchableOpacity>

                        {potentialParents.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.optionItem,
                                    formData.parentId === cat.id && styles.optionSelected,
                                ]}
                                onPress={() => setFormData(prev => ({ ...prev, parentId: cat.id }))}
                            >
                                <Text style={[
                                    styles.optionText,
                                    formData.parentId === cat.id && styles.optionTextSelected
                                ]}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={isSubmitting}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="save-outline" size={20} color={colors.white} />
                            <Text style={styles.submitButtonText}>
                                {initialValues ? "Update" : "Create"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 8,
    },
    required: {
        color: "#DC3545",
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.textDark,
        borderWidth: 1,
        borderColor: "transparent",
    },
    inputError: {
        borderColor: "#DC3545",
        backgroundColor: "#FFF5F5",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    errorText: {
        color: "#DC3545",
        fontSize: 12,
        marginTop: 4,
    },
    optionList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    optionItem: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    optionSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    optionText: {
        fontSize: 14,
        color: colors.textDark,
    },
    optionTextSelected: {
        color: colors.white,
        fontWeight: "600",
    },
    footer: {
        flexDirection: "row",
        gap: 16,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
    },
    cancelButtonText: { fontWeight: "600", color: colors.textLight },
    submitButton: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.primary,
        gap: 8,
    },
    submitButtonText: { fontWeight: "600", color: colors.white },
});
