import RetailerForm, { Retailer } from "@/components/admin/retailers/RetailerForm";
import { retailerService } from "@/services/retailer.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

    const [retailer, setRetailer] = useState<Retailer | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRetailer = async () => {
        try {
            setLoading(true);
            const data = await retailerService.getRetailerById(id as string);
            setRetailer(data);
        } catch (error) {
            console.error("Failed to fetch retailer", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (id) fetchRetailer();
            return () => { };
        }, [id])
    );

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await retailerService.updateRetailer(id as string, data);
            Alert.alert("Success", "Retailer updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error("Update retailer error:", error);
            const message = error.response?.data?.error || error.response?.data?.message || "Failed to update retailer";
            Alert.alert("Error", message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Edit Retailer</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

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
