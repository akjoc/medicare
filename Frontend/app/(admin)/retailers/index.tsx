import RetailerCard from "@/components/admin/retailers/RetailerCard";
import { Retailer } from "@/components/admin/retailers/RetailerForm";
import SearchBar from "@/components/SearchBar";
import { retailerService } from "@/services/retailer.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * RetailersScreen - List view for managing retailers.
 * 
 * Displays a list of retailers with search functionality.
 * Allows navigation to creating a new retailer or viewing/editing an existing one.
 */
export default function RetailersScreen() {
    const router = useRouter();
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchRetailers = useCallback(async () => {
        try {
            setLoading(true);
            console.log("Fetching retailers list...");
            const data = await retailerService.getRetailers();
            setRetailers(data);
        } catch (error) {
            console.error("Failed to fetch retailers", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load retailers on focus (so it updates after create/edit)
    useFocusEffect(
        useCallback(() => {
            fetchRetailers();
            return () => { };
        }, [fetchRetailers])
    );

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Retailer",
            "Are you sure you want to delete this retailer?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await retailerService.deleteRetailer(id);
                            // Optimistically update list or refetch
                            // Refetching ensures consistency
                            fetchRetailers();
                            Alert.alert("Success", "Retailer deleted successfully");
                        } catch (error: any) {
                            console.error("Delete retailer error:", error);
                            const message = error.response?.data?.message || "Failed to delete retailer";
                            Alert.alert("Error", message);
                        }
                    }
                }
            ]
        );
    };

    const filteredRetailers = retailers.filter(
        (r) =>
            (r.ownerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.shopName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Render the main view. 
    // We use a regular View instead of SafeAreaView for the container because 
    // the parent layout already handles safe areas for the top header.
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Retailers</Text>
                    <Text style={styles.subtitle}>Manage your retailer network</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push("/(admin)/retailers/create")}
                >
                    <Ionicons name="add" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search retailers..."
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredRetailers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <RetailerCard
                            retailer={item}
                            // Map ownerName to name for display if card expects name
                            // Assuming card was working with MOCK which had 'name'.
                            // If API returns ownerName, we might need to adjust card or map here.
                            // Let's assume Card uses 'name'. API returns 'ownerName' likely.
                            // We can map on the fly or update Card.
                            // Updating Card is better, but for now let's see.
                            // Wait, Retailer interface in Form has ownerName. 
                            // Check RetailerCard...
                            onPress={() => router.push(`/(admin)/retailers/${item.id}`)}
                            onDelete={() => handleDelete(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color={colors.textLight} />
                            <Text style={styles.emptyText}>No retailers found</Text>
                        </View>
                    }
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
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: colors.textDark,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textLight,
        fontWeight: "500",
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.textLight,
        fontWeight: "500",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});