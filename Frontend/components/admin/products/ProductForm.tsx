import { MOCK_CATEGORIES, Product } from "@/data/mockProducts";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface ProductFormProps {
    initialValues?: Partial<Product>;
    onSubmit: (data: Omit<Product, "id" | "createdAt">) => Promise<void>;
    isSubmitting?: boolean;
}

export default function ProductForm({
    initialValues,
    onSubmit,
    isSubmitting = false,
}: ProductFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: initialValues?.name || "",
        categoryId: initialValues?.categoryId || "",
        price: initialValues?.price?.toString() || "",
        salePrice: initialValues?.salePrice?.toString() || "",
        stock: initialValues?.stock?.toString() || "",
        description: initialValues?.description || "",
        sku: initialValues?.sku || "",
        status: initialValues?.status || "active",
        images: initialValues?.images || [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Product name is required";
        if (!formData.categoryId) newErrors.categoryId = "Category is required";
        if (!formData.price || isNaN(Number(formData.price))) newErrors.price = "Valid price is required";
        if (!formData.stock || isNaN(Number(formData.stock))) newErrors.stock = "Valid stock is required";
        if (!formData.sku.trim()) newErrors.sku = "SKU is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validate()) {
            await onSubmit({
                ...formData,
                price: Number(formData.price),
                salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
                stock: Number(formData.stock),
                categoryId: formData.categoryId,
                status: formData.status as any,
                images: formData.images,
            });
        }
    };

    const handleAddImageMock = () => {
        // Mocking image selection
        const mockImages = [
            "https://via.placeholder.com/150",
            "https://via.placeholder.com/150/0000FF/808080",
        ];
        const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
        setFormData(prev => ({ ...prev, images: [...prev.images, randomImage] }));
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Basic Info</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Product Name <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        value={formData.name}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        placeholder="e.g., Paracetamol 500mg"
                        placeholderTextColor={colors.textLight}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {MOCK_CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryChip,
                                    formData.categoryId === cat.id && styles.categoryChipSelected
                                ]}
                                onPress={() => setFormData(prev => ({ ...prev, categoryId: cat.id }))}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    formData.categoryId === cat.id && styles.categoryChipTextSelected
                                ]}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <Text style={styles.label}>Price <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, errors.price && styles.inputError]}
                            value={formData.price}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                            placeholder="0.00"
                            keyboardType="numeric"
                            placeholderTextColor={colors.textLight}
                        />
                        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <Text style={styles.label}>Sale Price</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.salePrice}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, salePrice: text }))}
                            placeholder="Optional"
                            keyboardType="numeric"
                            placeholderTextColor={colors.textLight}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Inventory & Details</Text>
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <Text style={styles.label}>SKU <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, errors.sku && styles.inputError]}
                            value={formData.sku}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, sku: text }))}
                            placeholder="Unique ID"
                            placeholderTextColor={colors.textLight}
                        />
                        {errors.sku && <Text style={styles.errorText}>{errors.sku}</Text>}
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <Text style={styles.label}>Stock <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, errors.stock && styles.inputError]}
                            value={formData.stock}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
                            placeholder="Qty"
                            keyboardType="numeric"
                            placeholderTextColor={colors.textLight}
                        />
                        {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                        placeholder="Product description..."
                        placeholderTextColor={colors.textLight}
                        multiline
                    />
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Images</Text>
                    <TouchableOpacity onPress={handleAddImageMock}>
                        <Text style={styles.addLink}>+ Add Image</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {formData.images.map((img, index) => (
                        <View key={index} style={styles.imageWrapper}>
                            <Image source={{ uri: img }} style={styles.productImage} />
                            <TouchableOpacity
                                style={styles.removeImage}
                                onPress={() => setFormData(prev => ({
                                    ...prev,
                                    images: prev.images.filter((_, i) => i !== index)
                                }))}
                            >
                                <Ionicons name="close-circle" size={24} color="#DC3545" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {formData.images.length === 0 && (
                        <Text style={styles.noImages}>No images added yet.</Text>
                    )}
                </ScrollView>
            </View>

            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Status</Text>
                </View>
                <View style={styles.row}>
                    {["active", "inactive", "out_of_stock"].map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.statusBtn,
                                formData.status === status && styles.statusActive
                            ]}
                            onPress={() => setFormData(prev => ({ ...prev, status: status as any }))}
                        >
                            <Text style={[
                                styles.statusTxt,
                                formData.status === status && styles.txtWhite
                            ]}>{status.replace(/_/g, " ")}</Text>
                        </TouchableOpacity>
                    ))}
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
                                {initialValues ? "Update Product" : "Create Product"}
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
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textDark,
    },
    addLink: {
        color: colors.primary,
        fontWeight: "600",
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
    required: { color: "#DC3545" },
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
    row: {
        flexDirection: "row",
        gap: 12,
    },
    categoryScroll: {
        flexDirection: "row",
        marginBottom: 8,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 8,
    },
    categoryChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryChipText: {
        fontSize: 13,
        color: colors.textDark,
    },
    categoryChipTextSelected: {
        color: colors.white,
        fontWeight: "600",
    },
    imageWrapper: {
        position: "relative",
        marginRight: 12,
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeImage: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: colors.white,
        borderRadius: 12,
    },
    noImages: {
        color: colors.textLight,
        fontStyle: "italic",
    },
    statusBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statusActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    statusTxt: { fontSize: 12, fontWeight: "600", color: colors.textLight, textTransform: "capitalize" },
    txtWhite: { color: colors.white },
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
