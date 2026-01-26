import * as authService from "@/services/auth.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function AccountScreen() {
    const router = useRouter();
    const [user, setUser] = useState<authService.User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const userData = await authService.getUser();
            setUser(userData);
        } catch (error) {
            console.error("Failed to load user profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await authService.logout();
                            router.replace("/(auth)/login");
                        } catch (error) {
                            console.error("Logout failed", error);
                            Alert.alert("Error", "Logout failed, please try again.");
                        }
                    }
                }
            ]
        );
    };

    const handleWhatsAppSupport = () => {
        Linking.openURL("https://wa.me/919999999999");
    };

    const handleCallSupport = () => {
        Linking.openURL("tel:9999999999");
    };

    if (loading) {
        return (
            <View style={styles.loadingCenter}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Account</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0).toUpperCase() || "A"}
                            </Text>
                        </View>
                        <View style={styles.profileTexts}>
                            <Text style={styles.userName}>{user?.name || "Admin User"}</Text>
                            <Text style={styles.userEmail}>{user?.email || "admin@example.com"}</Text>
                            <TouchableOpacity onPress={() => router.push("/(admin)/account/profile")}>
                                <Text style={styles.viewActivityLink}>View your profile</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push("/(admin)/account/profile")}
                    >
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="person-outline" size={22} color={colors.textDark} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Your Profile</Text>
                            <Text style={styles.menuSubtitle}>Edit your personal information</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push("/(admin)/account/security")}
                    >
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="lock-closed-outline" size={22} color={colors.textDark} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Security</Text>
                            <Text style={styles.menuSubtitle}>Change your account password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push("/(admin)/account/app-settings")}
                    >
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="settings-outline" size={22} color={colors.textDark} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>App Configuration</Text>
                            <Text style={styles.menuSubtitle}>Manage Tagline, Support Numbers</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </TouchableOpacity> */}

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => Alert.alert("Up to Date", "You are using the latest version 1.0.0")}
                    >
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="download-outline" size={22} color={colors.textDark} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Check for Updates</Text>
                            <Text style={styles.menuSubtitle}>App Version 1.0.0</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0</Text>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingCenter: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: colors.textDark,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    profileCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: colors.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    profileInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.white,
    },
    profileTexts: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.textDark,
    },
    userEmail: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 4,
    },
    viewActivityLink: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: "600",
    },
    menuSection: {
        backgroundColor: colors.white,
        borderRadius: 16,
        paddingVertical: 8,
        marginBottom: 24,
        shadowColor: colors.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: colors.textLight,
    },
    divider: {
        height: 1,
        backgroundColor: "#F3F4F6",
        marginLeft: 72, // Align with text start
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FEF2F2",
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#FEE2E2",
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#EF4444",
    },
    versionText: {
        textAlign: "center",
        color: colors.textLight,
        fontSize: 12,
    },
});
