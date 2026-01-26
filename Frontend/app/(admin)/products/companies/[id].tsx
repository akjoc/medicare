import CompanyForm from "@/components/admin/companies/CompanyForm";
import { Company, CompanyService } from "@/services/company.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EditCompanyScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCompany();
        }
    }, [id]);

    const fetchCompany = async () => {
        try {
            const data = await CompanyService.getById(id as string);
            setCompany(data);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch company details");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await CompanyService.update(id as string, data);
            Alert.alert("Success", "Company updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update company");
            console.error(error);
        } finally {
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Company</Text>
                <View style={{ width: 40 }} />
            </View>

            {company && (
                <CompanyForm
                    initialValues={company}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
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
        justifyContent: "center",
        alignItems: "center",
    },
});
