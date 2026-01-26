import { Company } from "@/services/company.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CompanyItemProps {
    company: Company;
    onPress: () => void;
    onDelete: () => void;
}

export default function CompanyItem({ company, onPress, onDelete }: CompanyItemProps) {
    const isActive = company.status === "active";

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.info}>
                <Text style={styles.name}>{company.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: isActive ? "#DCFCE7" : "#FEE2E2" }]}>
                    <Text style={[styles.statusText, { color: isActive ? "#166534" : "#EF4444" }]}>
                        {company.status}
                    </Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={onPress} style={styles.iconButton}>
                    <Ionicons name="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
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
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
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
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "500",
        textTransform: "capitalize",
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    iconButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#F8FAFC",
    },
});
