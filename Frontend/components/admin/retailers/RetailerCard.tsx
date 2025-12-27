import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Retailer } from "./RetailerForm";

// Props for the RetailerCard component
interface RetailerCardProps {
    retailer: Retailer;
    onPress: () => void;
    onDelete: () => void;
}

/**
 * RetailerCard Component
 * 
 * Displays a summary of a retailer in the list view.
 * Shows shop name, status, and contact info.
 */
export default function RetailerCard({ retailer, onPress, onDelete }: RetailerCardProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.info}>
                    <Text style={styles.shopName} numberOfLines={1}>
                        {retailer.shopName}
                    </Text>
                    <View style={styles.statusRow}>
                        <Text style={styles.name}>{retailer.name}</Text>
                        <View style={styles.dot} />
                        <View
                            style={[
                                styles.statusBadge,
                                retailer.status === "active"
                                    ? styles.statusActive
                                    : styles.statusInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    retailer.status === "active"
                                        ? styles.statusTextActive
                                        : styles.statusTextInactive,
                                ]}
                            >
                                {retailer.status}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                    <Ionicons name="trash-outline" size={20} color="#DC3545" />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={16} color={colors.textLight} />
                    <Text style={styles.detailText}>{retailer.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="mail-outline" size={16} color={colors.textLight} />
                    <Text style={styles.detailText}>{retailer.email}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={colors.textLight} />
                    <Text style={styles.detailText} numberOfLines={1}>
                        {retailer.address}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    info: {
        flex: 1,
        marginRight: 12,
    },
    shopName: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textDark,
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    name: {
        fontSize: 14,
        color: colors.textLight,
        fontWeight: "500",
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#D1D1D6",
        marginHorizontal: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusActive: {
        backgroundColor: "#E6F4EA",
    },
    statusInactive: {
        backgroundColor: "#FFF5F5",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    statusTextActive: {
        color: "#1E7E34",
    },
    statusTextInactive: {
        color: "#BD2130",
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#FFF5F5",
        justifyContent: "center",
        alignItems: "center",
    },
    divider: {
        height: 1,
        backgroundColor: "#F5F5F5",
        marginBottom: 12,
    },
    details: {
        gap: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: colors.textLight,
        flex: 1,
    },
});
