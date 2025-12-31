import { Product } from "@/data/mockProducts";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProductItemProps {
    product: Product;
    onPress: () => void;
    onDelete: () => void;
}

export default function ProductItem({ product, onPress, onDelete }: ProductItemProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.imageContainer}>
                {product.images && product.images.length > 0 ? (
                    <Image source={{ uri: product.images[0] }} style={styles.image} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="image-outline" size={24} color={colors.textLight} />
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.sku}>SKU: {product.sku}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{product.price}</Text>
                    {product.stock <= 20 && (
                        <Text style={styles.lowStock}>Low Stock: {product.stock}</Text>
                    )}
                </View>
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                <Ionicons name="trash-outline" size={20} color="#DC3545" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: colors.background,
        marginRight: 12,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    placeholderImage: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    info: {
        flex: 1,
        marginRight: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 4,
    },
    sku: {
        fontSize: 12,
        color: colors.textLight,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    price: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.primary,
    },
    lowStock: {
        fontSize: 12,
        color: "#DC3545",
        fontWeight: "600",
    },
    deleteButton: {
        padding: 8,
    },
});
