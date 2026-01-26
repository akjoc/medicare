import { Company } from "@/services/company.service";
import { colors } from "@/styles/colors";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface CompanyFormProps {
    initialValues?: Partial<Company>;
    onSubmit: (data: Omit<Company, "id">) => Promise<void>;
    isSubmitting: boolean;
}

export default function CompanyForm({ initialValues, onSubmit, isSubmitting }: CompanyFormProps) {
    const [name, setName] = useState(initialValues?.name || "");
    const [status, setStatus] = useState<'active' | 'inactive'>(initialValues?.status || "active");

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSubmit({ name: name.trim(), status });
    };

    return (
        <View style={styles.container}>
            <View style={styles.field}>
                <Text style={styles.label}>Company Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter company name"
                    placeholderTextColor={colors.textLight}
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusRow}>
                    <TouchableOpacity
                        style={[styles.statusButton, status === "active" && styles.activeStatus]}
                        onPress={() => setStatus("active")}
                    >
                        <Text style={[styles.statusButtonText, status === "active" && styles.activeStatusText]}>Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statusButton, status === "inactive" && styles.inactiveStatus]}
                        onPress={() => setStatus("inactive")}
                    >
                        <Text style={[styles.statusButtonText, status === "inactive" && styles.inactiveStatusText]}>Inactive</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isSubmitting || !name.trim()}
            >
                {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                ) : (
                    <Text style={styles.submitButtonText}>
                        {initialValues ? "Update Company" : "Create Company"}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: colors.white,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        margin: 20,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.textDark,
    },
    statusRow: {
        flexDirection: "row",
        gap: 12,
    },
    statusButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
    },
    statusButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.textLight,
    },
    activeStatus: {
        backgroundColor: "#DCFCE7",
        borderColor: "#166534",
    },
    activeStatusText: {
        color: "#166534",
    },
    inactiveStatus: {
        backgroundColor: "#FEE2E2",
        borderColor: "#EF4444",
    },
    inactiveStatusText: {
        color: "#EF4444",
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "700",
    },
    disabledButton: {
        opacity: 0.6,
    },
});
