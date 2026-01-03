import RetailerForm from "@/components/admin/retailers/RetailerForm";
import { retailerService } from "@/services/retailer.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * CreateRetailerScreen
 * 
 * Screen for adding a new retailer to the system.
 * Uses the reusable RetailerForm component.
 */
export default function CreateRetailerScreen() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            var response = await retailerService.createRetailer(data);
            console.log("response", response);
            Alert.alert("Success", "Retailer created successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const message = error.response?.data?.error || error.response?.data?.message || "Failed to create retailer";
            Alert.alert("Error", message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.title}>Add Retailer</Text>
                <View style={{ width: 40 }} />
            </View>

            <RetailerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
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
        paddingBottom: 10,
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
});
