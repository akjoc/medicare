import { AdminPaymentConfiguration } from "@/data/paymentMethods";
import { PaymentService } from "@/services/payment.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function PaymentConfigurationScreen() {
    const [config, setConfig] = useState<AdminPaymentConfiguration | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [qrImage, setQrImage] = useState<any>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const data = await PaymentService.getConfiguration();
            setConfig(data);
        } catch (error) {
            Alert.alert("Error", "Failed to load payment configuration");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            setQrImage(result.assets[0]);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            // Clean payload to ONLY include fields required by backend in form-data
            const updateData: any = {
                codEnabled: config.codEnabled,
                codNote: config.codNote,
                advancePaymentEnabled: config.advancePaymentEnabled,
                advancePaymentInstruction: config.advancePaymentInstruction,
                upiQrEnabled: config.upiQrEnabled,
                bankTransferEnabled: config.bankTransferEnabled,
                bankName: config.bankName,
                accountNumber: config.accountNumber,
                ifscCode: config.ifscCode,
                accountHolderName: config.accountHolderName,
                upiId: config.upiId,
                advancePaymentDiscountEnabled: config.advancePaymentDiscountEnabled,
                discountType: config.discountType,
                discountValue: config.discountValue,
                discountDescription: config.discountDescription,
            };

            await PaymentService.updateConfiguration(updateData, qrImage);
            Alert.alert("Success", "Configuration saved successfully");
            setQrImage(null);
            loadConfig();
        } catch (error) {
            Alert.alert("Error", "Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !config) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const updateField = <K extends keyof AdminPaymentConfiguration>(field: K, value: AdminPaymentConfiguration[K]) => {
        setConfig(prev => prev ? { ...prev, [field]: value } : null);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* COD Section */}
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <View style={styles.headerTextContainer}>
                        <Ionicons name="cash-outline" size={24} color={colors.textDark} />
                        <Text style={styles.cardTitle}>Cash on Delivery (COD)</Text>
                    </View>
                    <Switch
                        value={config.codEnabled}
                        onValueChange={(val) => updateField('codEnabled', val)}
                        trackColor={{ false: "#767577", true: colors.primary }}
                    />
                </View>
                {config.codEnabled && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Note to Customer</Text>
                        <TextInput
                            style={styles.input}
                            value={config.codNote}
                            onChangeText={(text) => updateField('codNote', text)}
                            placeholder="e.g. Pay cash upon delivery."
                        />
                    </View>
                )}
            </View>

            {/* Advance Payment Section */}
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <View style={styles.headerTextContainer}>
                        <Ionicons name="card-outline" size={24} color={colors.textDark} />
                        <Text style={styles.cardTitle}>Advance Payment</Text>
                    </View>
                    <Switch
                        value={config.advancePaymentEnabled}
                        onValueChange={(val) => updateField('advancePaymentEnabled', val)}
                        trackColor={{ false: "#767577", true: colors.primary }}
                    />
                </View>

                {config.advancePaymentEnabled && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.sectionSubtitle}>Instructions</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={config.advancePaymentInstruction}
                            onChangeText={(text) => updateField('advancePaymentInstruction', text)}
                            multiline
                            placeholder="Instructions for the user..."
                        />

                        <View style={styles.divider} />

                        {/* UPI Config */}
                        <View style={styles.subSection}>
                            <View style={styles.headerRow}>
                                <Text style={styles.subSectionTitle}>UPI / QR Code</Text>
                                <Switch
                                    value={config.upiQrEnabled}
                                    onValueChange={(val) => updateField('upiQrEnabled', val)}
                                />
                            </View>
                            {config.upiQrEnabled && (
                                <>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>UPI ID</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={config.upiId || ""}
                                            onChangeText={(text) => updateField('upiId', text)}
                                            placeholder="e.g. test@lorem.com"
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>QR Code Image</Text>
                                        <View style={styles.qrUploadContainer}>
                                            {(qrImage || config.qrCodeUrl) ? (
                                                <View style={styles.qrPreview}>
                                                    <Image
                                                        source={{ uri: qrImage?.uri || config.qrCodeUrl }}
                                                        style={styles.qrImage}
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.changeQrBtn}
                                                        onPress={pickImage}
                                                    >
                                                        <Text style={styles.changeQrText}>Change Image</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.uploadBtn}
                                                    onPress={pickImage}
                                                >
                                                    <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                                                    <Text style={styles.uploadBtnText}>Upload QR Code</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>

                        <View style={styles.divider} />

                        {/* Bank Transfer Config */}
                        <View style={styles.subSection}>
                            <View style={styles.headerRow}>
                                <Text style={styles.subSectionTitle}>Bank Transfer</Text>
                                <Switch
                                    value={config.bankTransferEnabled}
                                    onValueChange={(val) => updateField('bankTransferEnabled', val)}
                                />
                            </View>
                            {config.bankTransferEnabled && (
                                <>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Bank Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={config.bankName || ""}
                                            onChangeText={(text) => updateField('bankName', text)}
                                            placeholder="e.g. ICICI"
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Account Number</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={config.accountNumber || ""}
                                            onChangeText={(text) => updateField('accountNumber', text)}
                                            keyboardType="numeric"
                                            placeholder="Account Number"
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>IFSC Code</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={config.ifscCode || ""}
                                            onChangeText={(text) => updateField('ifscCode', text)}
                                            placeholder="IFSC Code"
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Account Holder Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={config.accountHolderName || ""}
                                            onChangeText={(text) => updateField('accountHolderName', text)}
                                            placeholder="Account Holder Name"
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                )}
            </View>

            {/* Discount Section */}
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <View style={styles.headerTextContainer}>
                        <Ionicons name="pricetag-outline" size={24} color={colors.textDark} />
                        <Text style={styles.cardTitle}>Payment Discount</Text>
                    </View>
                    <Switch
                        value={config.advancePaymentDiscountEnabled}
                        onValueChange={(val) => updateField('advancePaymentDiscountEnabled', val)}
                        trackColor={{ false: "#767577", true: colors.primary }}
                    />
                </View>

                {config.advancePaymentDiscountEnabled && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.explanation}>
                            Apply a discount when customers pay via {config.advancePaymentEnabled ? "Advance Payment" : "Configured Methods"}.
                        </Text>

                        <View style={styles.row}>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={styles.label}>Discount Type</Text>
                                <View style={styles.typeSelector}>
                                    <TouchableOpacity
                                        style={[
                                            styles.typeBtn,
                                            config.discountType === "PERCENT" && styles.typeBtnSelected
                                        ]}
                                        onPress={() => updateField('discountType', 'PERCENT')}
                                    >
                                        <Text style={[
                                            styles.typeBtnText,
                                            config.discountType === "PERCENT" && styles.typeBtnTextSelected
                                        ]}>%</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.typeBtn,
                                            config.discountType === "FLAT" && styles.typeBtnSelected
                                        ]}
                                        onPress={() => updateField('discountType', 'FLAT')}
                                    >
                                        <Text style={[
                                            styles.typeBtnText,
                                            config.discountType === "FLAT" && styles.typeBtnTextSelected
                                        ]}>₹</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={styles.label}>Value</Text>
                                <TextInput
                                    style={styles.input}
                                    value={config.discountValue.toString()}
                                    onChangeText={(text) => updateField('discountValue', Number(text) || 0)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                value={config.discountDescription || ""}
                                onChangeText={(text) => updateField('discountDescription', text)}
                                placeholder="e.g. 5% off on Advance Payment"
                            />
                        </View>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color={colors.white} />
                ) : (
                    <Text style={styles.saveButtonText}>Save Configuration</Text>
                )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    headerTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textDark,
    },
    expandedContent: {
        marginTop: 12,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.textDark,
        borderWidth: 1,
        borderColor: "transparent",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    subSection: {
        marginTop: 8,
    },
    subSectionTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textDark,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    },
    saveButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "700",
    },
    sectionSubtitle: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textLight,
        marginBottom: 8,
    },
    explanation: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 16,
        fontStyle: "italic",
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 4,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    typeBtnSelected: {
        backgroundColor: colors.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    typeBtnText: {
        fontWeight: "600",
        color: colors.textLight,
    },
    typeBtnTextSelected: {
        color: colors.primary,
    },
    qrUploadContainer: {
        marginTop: 4,
    },
    qrPreview: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    qrImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    changeQrBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    changeQrText: {
        color: colors.textDark,
        fontWeight: "600",
        fontSize: 14,
    },
    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: "dashed",
        gap: 8,
    },
    uploadBtnText: {
        color: colors.primary,
        fontWeight: "600",
        fontSize: 16,
    },
});
