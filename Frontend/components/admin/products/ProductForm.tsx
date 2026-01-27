import { Product } from "@/data/mockProducts";
import { CategoryService } from "@/services/categoryService";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
        categoryIds: initialValues?.categoryIds || [],
        price: initialValues?.price?.toString() || "",
        salePrice: initialValues?.salePrice?.toString() || "",
        stock: initialValues?.stock?.toString() || "",
        description: initialValues?.description || "",
        sku: initialValues?.sku || "",
        status: initialValues?.status || "active",
        images: initialValues?.imageUrls || [],
        salt: initialValues?.salt || [],
        companies: initialValues?.companies || [],
        buyingPrice: initialValues?.buyingPrice?.toString() || "",
        dosage: initialValues?.dosage || "",
        packing: initialValues?.packing || "",
        companyInput: initialValues?.companies?.[0] || "", // Helper state for single input
        expiry: initialValues?.expiry || "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);

    // New states for adding salt
    const [newSalt, setNewSalt] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await CategoryService.getAll();
            // Flatten the nested category structure to show all categories (parent + sub)
            const flattenCategories = (cats: any[]): any[] => {
                let result: any[] = [];
                cats.forEach(cat => {
                    result.push(cat);
                    if (cat.subCategories && cat.subCategories.length > 0) {
                        result = result.concat(flattenCategories(cat.subCategories));
                    }
                });
                return result;
            };
            const allCategories = flattenCategories(data);
            setCategories(allCategories);
        } catch (error) {
            console.error("Failed to fetch categories", error);
            Alert.alert("Error", "Failed to load categories");
        } finally {
            setLoadingCategories(false);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Product name is required";
        if (formData.categoryIds.length === 0) newErrors.categoryIds = "At least one category is required";
        if (!formData.price || isNaN(Number(formData.price))) newErrors.price = "Valid price is required";
        if (!formData.sku || !formData.sku.trim()) newErrors.sku = "SKU is required";


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validate()) {
            await onSubmit({
                ...formData,
                price: Number(formData.price),
                salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
                stock: formData.stock ? Number(formData.stock) : 0,
                categoryIds: formData.categoryIds,
                status: formData.status as any,
                imageUrls: formData.images,
                salt: formData.salt.length > 0 ? formData.salt : undefined,
                companies: formData.companyInput ? [formData.companyInput] : [],
                buyingPrice: formData.buyingPrice ? Number(formData.buyingPrice) : undefined,
                dosage: formData.dosage || undefined,
                packing: formData.packing || undefined,
                expiry: formData.expiry || undefined,
            });
        }
    };

    const pickImage = async () => {
        if (formData.images.length >= 5) {
            Alert.alert("Limit Reached", "You can only upload up to 5 images");
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            const fileExtension = uri.split('.').pop()?.toLowerCase();

            if (!fileExtension || !['jpg', 'jpeg', 'png'].includes(fileExtension)) {
                Alert.alert("Invalid Format", "Only JPG and PNG images are allowed");
                return;
            }

            // Show loading state briefly to give feedback
            setUploadingImage(true);
            setTimeout(() => {
                setFormData(prev => ({ ...prev, images: [...prev.images, uri] }));
                setUploadingImage(false);
            }, 500);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const addSalt = () => {
        if (newSalt.trim()) {
            setFormData(prev => ({ ...prev, salt: [...prev.salt, newSalt.trim()] }));
            setNewSalt("");
        }
    };

    const removeSalt = (index: number) => {
        setFormData(prev => ({
            ...prev,
            salt: prev.salt.filter((_, i) => i !== index)
        }));
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
                    <Text style={styles.label}>Categories (Multi-select)</Text>
                    {loadingCategories ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {categories.map(cat => {
                                const isSelected = formData.categoryIds.includes(cat.id);
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryChip,
                                            isSelected && styles.categoryChipSelected
                                        ]}
                                        onPress={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                categoryIds: isSelected
                                                    ? prev.categoryIds.filter(id => id !== cat.id)
                                                    : [...prev.categoryIds, cat.id]
                                            }));
                                        }}
                                    >
                                        <Text style={[
                                            styles.categoryChipText,
                                            isSelected && styles.categoryChipTextSelected
                                        ]}>{cat.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                    {errors.categoryIds && <Text style={styles.errorText}>{errors.categoryIds}</Text>}
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

                <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <Text style={styles.label}>Dosage</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.dosage}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, dosage: text }))}
                            placeholder="e.g. 500mg"
                            placeholderTextColor={colors.textLight}
                        />
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <Text style={styles.label}>Packing</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.packing}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, packing: text }))}
                            placeholder="e.g. 10x10"
                            placeholderTextColor={colors.textLight}
                        />
                    </View>
                </View>
            </View>

            {/* Salt Section */}
            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Chemical Composition (Salt)</Text>
                </View>

                <View style={styles.addItemRow}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={newSalt}
                        onChangeText={setNewSalt}
                        placeholder="e.g., Acetaminophen"
                        placeholderTextColor={colors.textLight}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addSalt}>
                        <Ionicons name="add" size={20} color={colors.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.chipContainer}>
                    {formData.salt.map((item, index) => (
                        <View key={index} style={styles.chip}>
                            <Text style={styles.chipText}>{item}</Text>
                            <TouchableOpacity onPress={() => removeSalt(index)}>
                                <Ionicons name="close-circle" size={18} color={colors.textLight} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {formData.salt.length === 0 && (
                        <Text style={styles.emptyText}>No salt added yet</Text>
                    )}
                </View>
            </View>

            {/* Companies Section - Simplified to single input */}
            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Company Information</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Company Name</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.companyInput}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, companyInput: text }))}
                        placeholder="e.g., Healthcare Corp"
                        placeholderTextColor={colors.textLight}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Buying Price</Text>
                    <TextInput
                        style={[styles.input, errors.buyingPrice && styles.inputError]}
                        value={formData.buyingPrice}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, buyingPrice: text }))}
                        placeholder="0.00"
                        keyboardType="numeric"
                        placeholderTextColor={colors.textLight}
                    />
                    {errors.buyingPrice && <Text style={styles.errorText}>{errors.buyingPrice}</Text>}
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
                        <Text style={styles.label}>Stock</Text>
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
                    <Text style={styles.label}>Expiry Date</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.expiry}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, expiry: text }))}
                        placeholder="DD-MM-YYYY"
                        placeholderTextColor={colors.textLight}
                    />
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
                    <Text style={styles.sectionTitle}>Images ({formData.images.length}/5)</Text>
                    <TouchableOpacity onPress={pickImage} disabled={uploadingImage || formData.images.length >= 5}>
                        <Text style={[styles.addLink, (uploadingImage || formData.images.length >= 5) && styles.addLinkDisabled]}>
                            + Add Image
                        </Text>
                    </TouchableOpacity>
                </View>

                {uploadingImage && (
                    <View style={styles.uploadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.uploadingText}>Loading image...</Text>
                    </View>
                )}

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {formData.images.map((img, index) => (
                        <View key={index} style={styles.imageWrapper}>
                            <Image source={{ uri: img }} style={styles.productImage} />
                            <TouchableOpacity
                                style={styles.removeImage}
                                onPress={() => removeImage(index)}
                            >
                                <Ionicons name="close-circle" size={24} color="#DC3545" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {formData.images.length === 0 && !uploadingImage && (
                        <Text style={styles.noImages}>No images added yet. (Max 5, jpg/png only)</Text>
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
    addLinkDisabled: {
        color: colors.textLight,
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
    addItemRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    chipText: {
        fontSize: 13,
        color: colors.textDark,
    },
    companyList: {
        gap: 12,
    },
    companyItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        gap: 12,
    },
    companyName: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
    },
    companyPrice: {
        fontSize: 13,
        color: colors.textLight,
        marginTop: 2,
    },
    emptyText: {
        color: colors.textLight,
        fontStyle: "italic",
        fontSize: 13,
    },
    uploadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    uploadingText: {
        color: colors.textLight,
        fontSize: 13,
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
        elevation: 2, // Shadow for elevation
    },
    submitButtonText: { fontWeight: "600", color: colors.white },
});
