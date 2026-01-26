import { APP_CONFIG } from "@/constants/app";
import { getUser, logout, User } from "@/services/auth.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RetailerAccountScreen() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await getUser();
        setUser(userData);
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace("/(auth)/login");
                    },
                },
            ]
        );
    };

    const handleCallSupport = () => {
        Linking.openURL(`tel:${APP_CONFIG.SUPPORT_NUMBER}`).catch(() => {
            Alert.alert("Error", "Could not open dialer");
        });
    };

    const handleWhatsAppSupport = () => {
        const url = `whatsapp://send?phone=${APP_CONFIG.WHATSAPP_NUMBER.replace('+', '')}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                return Linking.openURL(url);
            } else {
                return Linking.openURL(`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER.replace('+', '')}`);
            }
        }).catch(() => {
            Alert.alert("Error", "Could not open WhatsApp");
        });
    };

    if (!user) return null;

    const fullAddress = [user.address, user.city, user.state, user.zipCode].filter(Boolean).join(", ");

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Account</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* PROFILE CARD */}
                <View style={styles.card}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{(user.ownerName || user.name || "U").charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{user.ownerName || user.name}</Text>
                            <Text style={styles.profileShop}>{user.shopName || "Retailer"}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.contactInfo}>
                        <View style={styles.contactItem}>
                            <Ionicons name="call-outline" size={16} color={colors.textLight} />
                            <Text style={styles.contactText}>{user.phone || "No phone"}</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <Ionicons name="mail-outline" size={16} color={colors.textLight} />
                            <Text style={styles.contactText}>{user.email}</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <Ionicons name="location-outline" size={16} color={colors.textLight} />
                            <Text style={styles.contactText} numberOfLines={2}>{fullAddress || "No address"}</Text>
                        </View>
                    </View>
                </View>

                {/* MY ORDERS SECTION */}
                <Text style={styles.sectionHeader}>My Business</Text>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push("/(retailer)/orders" as any)}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                        <Ionicons name="cube-outline" size={22} color="#0284C7" />
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>My Orders</Text>
                        <Text style={styles.menuSubtitle}>Track orders, view history</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>

                {/* ACCOUNT SETTINGS */}
                <Text style={styles.sectionHeader}>Settings & Support</Text>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push("/(retailer)/account/security")}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
                        <Ionicons name="shield-checkmark-outline" size={22} color="#9333EA" />
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>Security</Text>
                        <Text style={styles.menuSubtitle}>Change password</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleWhatsAppSupport}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                        <Ionicons name="logo-whatsapp" size={22} color="#16A34A" />
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>WhatsApp Support</Text>
                        <Text style={styles.menuSubtitle}>Chat with us</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleCallSupport}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="call-outline" size={22} color="#D97706" />
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>Call Wholesaler</Text>
                        <Text style={styles.menuSubtitle}>Speak to an agent</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.textDark,
    },
    content: {
        padding: 20,
        paddingBottom: 20,
        gap: 20,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: colors.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.white,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textDark,
    },
    profileShop: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 16,
    },
    contactInfo: {
        gap: 8,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    contactText: {
        fontSize: 14,
        color: colors.textDark,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textLight,
        marginBottom: -8,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textDark,
    },
    menuSubtitle: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FEE2E2",
        padding: 16,
        borderRadius: 16,
        gap: 8,
        marginTop: 8,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#DC2626",
    },
    versionText: {
        textAlign: "center",
        color: colors.textLight,
        fontSize: 12,
        marginTop: 8,
    },
    logoutButtonSimple: {
        marginTop: 16,
        padding: 12,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    logoutText: {
        color: 'white',
        fontWeight: 'bold',
    }
});