import { Category } from "@/data/mockProducts";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CategoryItemProps {
    category: Category;
    onPress: () => void;
    onDelete: () => void;
}

export default function CategoryItem({ category, onPress, onDelete }: CategoryItemProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="grid-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{category.name}</Text>
                    {category.description ? (
                        <Text style={styles.description} numberOfLines={1}>
                            {category.description}
                        </Text>
                    ) : null}
                </View>
            </View>

            <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
            >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(11, 94, 215, 0.1)", // colors.primary with opacity
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        borderWidth: 1,
        borderColor: "rgba(11, 94, 215, 0.2)",
    },
    info: {
        flex: 1,
        marginRight: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 2,
    },
    description: {
        fontSize: 13,
        color: colors.textLight,
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#FFF5F5",
    },
});
