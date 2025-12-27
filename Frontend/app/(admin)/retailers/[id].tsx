import RetailerForm, { Retailer } from "@/components/admin/retailers/RetailerForm";
import { MOCK_RETAILERS } from "@/data/mockData";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * EditRetailerScreen
 * 
 * Screen for editing an existing retailer.
 * Fetches retailer data by ID and populates the RetailerForm.
 */
export default function EditRetailerScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Find the retailer to edit
    const retailer = MOCK_RETAILERS.find((r) => r.id === id);

    const handleSubmit = async (data: Omit<Retailer, "id" | "joinedDate">) => {
        setIsSubmitting(true);
        // Simulate API call update
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Updating retailer:", id, data);
        setIsSubmitting(false);
        router.back();
    };

    if (!retailer) {
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
                    <Text style={styles.errorText}>Retailer not found</Text>
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
                <Text style={styles.title}>Edit Retailer</Text>
                <View style={{ width: 40 }} />
            </View>

            <RetailerForm
                initialValues={retailer}
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
    errorText: {
        fontSize: 16,
        color: colors.textLight,
    },
});
