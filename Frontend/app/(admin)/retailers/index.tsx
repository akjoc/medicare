import RetailerCard from "@/components/admin/retailers/RetailerCard";
import { Retailer } from "@/components/admin/retailers/RetailerForm";
import SearchBar from "@/components/SearchBar";
import { MOCK_RETAILERS } from "@/data/mockData";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * RetailersScreen - List view for managing retailers.
 * 
 * Displays a list of retailers with search functionality.
 * Allows navigation to creating a new retailer or viewing/editing an existing one.
 */
export default function RetailersScreen() {
    const router = useRouter();
    // Using local state for now, but in a real app this would come from an API or global store
    const [retailers, setRetailers] = useState<Retailer[]>(MOCK_RETAILERS);
    const [searchQuery, setSearchQuery] = useState("");

    const handleDelete = (id: string) => {
        // In a real app, this would make an API call
        // For now, we'll just filter out the item or mark it inactive
        setRetailers((prev) => prev.filter((r) => r.id !== id));
    };

    const filteredRetailers = retailers.filter(
        (r) =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

            <FlatList
                data={filteredRetailers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <RetailerCard
                        retailer={item}
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
});