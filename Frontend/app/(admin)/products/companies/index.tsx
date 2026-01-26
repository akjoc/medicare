import CompanyItem from "@/components/admin/companies/CompanyItem";
import { Company, CompanyService } from "@/services/company.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CompaniesScreen() {
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await CompanyService.getAll();
            setCompanies(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            "Delete Company",
            `Are you sure you want to delete "${name}"?`,
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await CompanyService.delete(id);
                            await loadData();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete company");
                            console.error(error);
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.title}>Companies</Text>
                <View style={{ width: 40 }} />
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push("/(admin)/products/companies/create")}
            >
                <Ionicons name="add" size={24} color={colors.white} />
                <Text style={styles.addButtonText}>Add Company</Text>
            </TouchableOpacity>

            <FlatList
                data={companies}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CompanyItem
                        company={item}
                        onPress={() => router.push(`/(admin)/products/companies/${item.id}`)}
                        onDelete={() => handleDelete(item.id, item.name)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No companies found</Text>
                }
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
        fontSize: 24,
        fontWeight: "800",
        color: colors.textDark,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        marginHorizontal: 20,
        padding: 12,
        borderRadius: 12,
        justifyContent: "center",
        gap: 8,
        marginBottom: 20,
    },
    addButtonText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: "center",
        color: colors.textLight,
        marginTop: 20,
    },
});
