import ProductForm from "@/components/admin/products/ProductForm";
import { Product } from "@/data/mockProducts";
import { productService } from "@/services/productService";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EditProductScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (typeof id === 'string') {
                try {
                    const data = await productService.getProductById(id);
                    setProduct(data || null);
                } catch (error: any) {
                    console.error("Failed to fetch product", error);
                    const message = error.response?.data?.message || "Failed to fetch product";
                    Alert.alert("Error", message);
                }
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    const handleSubmit = async (data: Omit<Product, "id" | "createdAt">) => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            await productService.updateProduct(id as string, data);
            Alert.alert("Success", "Product updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error("Update product error:", error);
            const message = error.response?.data?.message || "Failed to update product";
            Alert.alert("Error", message);
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!product) {
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
                    <Text>Product not found</Text>
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
                <Text style={styles.title}>Edit Product</Text>
                <View style={{ width: 40 }} />
            </View>

            <ProductForm
                initialValues={product}
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
