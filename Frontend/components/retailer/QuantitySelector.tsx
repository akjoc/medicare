import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface QuantitySelectorProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onChangeText: (text: string) => void;
}

export default function QuantitySelector({
    quantity,
    onIncrease,
    onDecrease,
    onChangeText,
}: QuantitySelectorProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onDecrease} style={[styles.button, styles.buttonLeft]}>
                <Ionicons name={quantity === 1 ? "trash-outline" : "remove"} size={18} color={quantity === 1 ? "#EF4444" : colors.textDark} />
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                value={String(quantity)}
                onChangeText={onChangeText}
                keyboardType="numeric"
                selectTextOnFocus
                textAlign="center"
            />

            <TouchableOpacity onPress={onIncrease} style={[styles.button, styles.buttonRight]}>
                <Ionicons name="add" size={18} color={colors.textDark} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB", // Light gray border like Amazon
        height: 36, // Compact height
        overflow: "hidden", // Ensure children respect border radius
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    button: {
        width: 36,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F3F4F6", // Light background for buttons
        borderColor: "#D1D5DB",
    },
    buttonLeft: {
        borderRightWidth: 1,
    },
    buttonRight: {
        borderLeftWidth: 1,
    },
    input: {
        width: 44,
        height: "100%",
        fontSize: 16,
        fontWeight: "600",
        color: colors.textDark,
        backgroundColor: colors.white,
        padding: 0, // Remove default padding
    },
});
