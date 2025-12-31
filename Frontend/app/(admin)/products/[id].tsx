import ProductForm from "@/components/admin/products/ProductForm";
import { Product } from "@/data/mockProducts";
import { ProductService } from "@/services/productService";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EditProductScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (typeof id === 'string') {
                const data = await ProductService.getById(id);
                setProduct(data || null);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    const handleSubmit = async (data: Omit<Product, "id" | "createdAt">) => {
        if (!id) return;
        setIsSubmitting(true);
        await ProductService.update(id as string, data);
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
