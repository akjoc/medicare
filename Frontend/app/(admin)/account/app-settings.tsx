import { APP_CONFIG } from "@/constants/app";
import { AppSettingsService } from "@/services/appSettings.service";
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
    View
} from "react-native";

export default function AppSettingsScreen() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [config, setConfig] = useState({
        appName: APP_CONFIG.NAME,
        tagline: APP_CONFIG.TAGLINE,
        whatsappNumber: APP_CONFIG.WHATSAPP_NUMBER,
        callSupportNumber: "+919999999999",
        gstNumber: APP_CONFIG.GST_NUMBER,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const settings = await AppSettingsService.getSettings();
            if (settings) {
                setConfig({
                    appName: settings.appName || APP_CONFIG.NAME,
                    tagline: settings.tagline || APP_CONFIG.TAGLINE,
                    whatsappNumber: settings.whatsappNumber || APP_CONFIG.WHATSAPP_NUMBER,
                    callSupportNumber: settings.callSupportNumber || "+919999999999",
                    gstNumber: settings.gstNumber || APP_CONFIG.GST_NUMBER,
                });
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            // Fallback to constants if API fails
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await AppSettingsService.updateSettings(config);
            Alert.alert("Success", "App configuration updated successfully");
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to update configuration");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                    </TouchableOpacity>
                    <Text style={styles.title}>App Configuration</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header matching Orders/Products style */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.title}>App Configuration</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>General Settings</Text>
                        <View style={styles.card}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>App Name</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="apps-outline" size={20} color={colors.textLight} />
                                    <TextInput
                                        style={styles.input}
                                        value={config.appName}
                                        onChangeText={(text) => setConfig({ ...config, appName: text })}
                                        placeholder="Enter App Name"
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                            </View>

                            <View style={[styles.inputGroup, { marginTop: 16 }]}>
                                <Text style={styles.label}>App Tagline</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="text-outline" size={20} color={colors.textLight} />
                                    <TextInput
                                        style={styles.input}
                                        value={config.tagline}
                                        onChangeText={(text) => setConfig({ ...config, tagline: text })}
                                        placeholder="e.g. B2B Medicine Ordering"
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                                <Text style={styles.helperText}>Visible on the login screen and header</Text>
                            </View>

                            <View style={[styles.inputGroup, { marginTop: 16 }]}>
                                <Text style={styles.label}>GST Number</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="document-text-outline" size={20} color={colors.textLight} />
                                    <TextInput
                                        style={styles.input}
                                        value={config.gstNumber}
                                        onChangeText={(text) => setConfig({ ...config, gstNumber: text })}
                                        placeholder="Enter GST Number"
                                        autoCapitalize="characters"
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Support Contact</Text>
                        <View style={styles.card}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>WhatsApp Number</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="logo-whatsapp" size={20} color={colors.textLight} />
                                    <TextInput
                                        style={styles.input}
                                        value={config.whatsappNumber}
                                        onChangeText={(text) => setConfig({ ...config, whatsappNumber: text })}
                                        placeholder="+91..."
                                        keyboardType="phone-pad"
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                            </View>

                            <View style={[styles.inputGroup, { marginTop: 16 }]}>
                                <Text style={styles.label}>Call Support Number</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="call-outline" size={20} color={colors.textLight} />
                                    <TextInput
                                        style={styles.input}
                                        value={config.callSupportNumber}
                                        onChangeText={(text) => setConfig({ ...config, callSupportNumber: text })}
                                        placeholder="+91..."
                                        keyboardType="phone-pad"
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                            </View>
                        </View>
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
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.textDark,
    },
    content: {
        padding: 20,
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textDark,
        marginLeft: 4,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: colors.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
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
        backgroundColor: colors.background,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 12,
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
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
});
