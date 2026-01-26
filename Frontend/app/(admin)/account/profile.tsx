import * as authService from "@/services/auth.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<authService.User | null>(null);
    const [phone, setPhone] = useState("");

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const userData = await authService.getUser();
            if (userData) {
                setUser(userData);
                // Mock phone number loading since it's not in the User interface yet
                setPhone("9876543210");
            }
        } catch (error) {
            console.error("Failed to load user profile", error);
            Alert.alert("Error", "Failed to load profile details");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real app, we would make an API call here to update the user
            // await authService.updateProfile({ ...user, phone });

            Alert.alert("Success", "Profile updated successfully");
            router.back();
        } catch (error) {
            console.error("Failed to update profile", error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
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
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0).toUpperCase() || "A"}
                            </Text>
                            <View style={styles.editBadge}>
                                <Ionicons name="camera" size={12} color={colors.white} />
                            </View>
                        </View>
                        <Text style={styles.nameText}>{user?.name}</Text>
                        <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={[styles.inputContainer, styles.disabledInput]}>
                                <Ionicons name="person-outline" size={20} color={colors.textLight} />
                                <TextInput
                                    style={styles.input}
                                    value={user?.name}
                                    editable={false}
                                    placeholder="Enter your name"
                                />
                            </View>
                            <Text style={styles.helperText}>Name cannot be changed</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={[styles.inputContainer, styles.disabledInput]}>
                                <Ionicons name="mail-outline" size={20} color={colors.textLight} />
                                <TextInput
                                    style={styles.input}
                                    value={user?.email}
                                    editable={false}
                                    placeholder="Enter your email"
                                />
                            </View>
                            <Text style={styles.helperText}>Email cannot be changed</Text>
                        </View>

                        {/* <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color={colors.textDark} />
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Enter your phone number"
                                    keyboardType="phone-pad"
                                    placeholderTextColor={colors.textLight}
                                />
                            </View>
                        </View> */}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textDark,
    },
    content: {
        padding: 20,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        position: "relative",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: "bold",
        color: colors.white,
    },
    editBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: colors.textDark,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.white,
    },
    nameText: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textDark,
        marginBottom: 4,
    },
    roleText: {
        fontSize: 14,
        color: colors.textLight,
        fontWeight: "600",
        letterSpacing: 1,
    },
    formSection: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 12,
    },
    disabledInput: {
        backgroundColor: "#F3F4F6", // Lighter gray for disabled state
        borderColor: "transparent",
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.textDark,
    },
    helperText: {
        fontSize: 12,
        color: colors.textLight,
        marginLeft: 4,
    },
    footer: {
        padding: 20,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    saveButton: {
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
});
