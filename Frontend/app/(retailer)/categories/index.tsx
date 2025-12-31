import { MOCK_CATEGORIES } from "@/data/mockProducts";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoriesScreen() {
    const router = useRouter();

    // Only show top-level categories or all? Let's show all for now, or maybe group them.
    // The requirement is just "View full product catalog... Category".
    // Let's just list them nicely.

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.title}>Categories</Text>
            </View>

            <FlatList
                data={MOCK_CATEGORIES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push(`/(retailer)/categories/${item.id}`)}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="grid-outline" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.count}>{item.productCount} Products</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.textDark,
    },
    listContent: {
        padding: 20,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(11, 94, 215, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 4,
    },
    count: {
        fontSize: 14,
        color: colors.textLight,
    },
});
