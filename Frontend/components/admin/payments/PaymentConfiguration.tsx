import { PaymentConfiguration } from "@/data/paymentMethods";
import { PaymentService } from "@/services/payment.service";
import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
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
    const [config, setConfig] = useState<PaymentConfiguration | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            await PaymentService.updateConfiguration(config);
            Alert.alert("Success", "Configuration saved successfully");
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

    return (
        <ScrollView style={styles.container}>
            {/* COD Section */}
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <View style={styles.headerTextContainer}>
                        <Ionicons name="cash-outline" size={24} color={colors.textDark} />
                        <Text style={styles.cardTitle}>Cash on Delivery (COD)</Text>
                    </View>
                    <Switch
                        value={config.cod.enabled}
                        onValueChange={(val) =>
                            setConfig((prev) => prev ? { ...prev, cod: { ...prev.cod, enabled: val } } : null)
                        }
                        trackColor={{ false: "#767577", true: colors.primary }}
                    />
                </View>
                {config.cod.enabled && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Note to Customer</Text>
                        <TextInput
                            style={styles.input}
                            value={config.cod.note}
                            onChangeText={(text) =>
                                setConfig((prev) => prev ? { ...prev, cod: { ...prev.cod, note: text } } : null)
                            }
                            placeholder="e.g. Verification required for large orders"
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
                        value={config.advance.enabled}
                        onValueChange={(val) =>
                            setConfig((prev) => prev ? { ...prev, advance: { ...prev.advance, enabled: val } } : null)
                        }
                        trackColor={{ false: "#767577", true: colors.primary }}
                    />
                </View>

                {config.advance.enabled && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.sectionSubtitle}>Instructions</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={config.advance.instructions}
                            onChangeText={(text) =>
                                setConfig((prev) => prev ? { ...prev, advance: { ...prev.advance, instructions: text } } : null)
                            }
                            multiline
                            placeholder="Instructions for the user..."
                        />

                        <View style={styles.divider} />

                        {/* UPI Config */}
                        <View style={styles.subSection}>
                            <View style={styles.headerRow}>
                                <Text style={styles.subSectionTitle}>UPI / QR Code</Text>
                                <Switch
                                    value={config.advance.methods.upi.enabled}
                                    onValueChange={(val) =>
                                        setConfig((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    advance: {
                                                        ...prev.advance,
                                                        methods: {
                                                            ...prev.advance.methods,
                                                            upi: { ...prev.advance.methods.upi, enabled: val },
                                                        },
                                                    },
                                                }
                                                : null
                                        )
                                    }
                                />
                            </View>
                            {config.advance.methods.upi.enabled && (
                                <>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>UPI ID</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={config.advance.methods.upi.config.upiId}
                                            onChangeText={(text) =>
                                                setConfig((prev) =>
                                                    prev
                                                        ? {
                                                            ...prev,
                                                            advance: {
                                                                ...prev.advance,
                                                                methods: {
                                                                    ...prev.advance.methods,
                                                                    upi: {
                                                                        ...prev.advance.methods.upi,
                                                                        config: { ...prev.advance.methods.upi.config, upiId: text },
                                                                    },
                                                                },
                                                            },
                                                        }
                                                        : null
                                                )
                                            }
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>QR Code Image</Text>
                                        <View style={styles.qrUploadContainer}>
                                            {config.advance.methods.upi.config.qrCodeUrl ? (
                                                <View style={styles.qrPreview}>
                                                    <Image
                                                        source={{ uri: config.advance.methods.upi.config.qrCodeUrl }}
                                                        style={styles.qrImage}
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.changeQrBtn}
                                                        onPress={() => {
                                                            // Mock Image Picker
                                                            const mockQr = "https://via.placeholder.com/150/000000/FFFFFF?text=New+QR";
                                                            setConfig((prev) =>
                                                                prev
                                                                    ? {
                                                                        ...prev,
                                                                        advance: {
                                                                            ...prev.advance,
                                                                            methods: {
                                                                                ...prev.advance.methods,
                                                                                upi: {
                                                                                    ...prev.advance.methods.upi,
                                                                                    config: { ...prev.advance.methods.upi.config, qrCodeUrl: mockQr },
                                                                                },
                                                                            },
                                                                        },
                                                                    }
                                                                    : null
                                                            );
                                                        }}
                                                    >
                                                        <Text style={styles.changeQrText}>Change Image</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.uploadBtn}
                                                    onPress={() => {
                                                        // Mock Image Picker
                                                        const mockQr = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NewQR";
                                                        setConfig((prev) =>
                                                            prev
                                                                ? {
                                                                    ...prev,
                                                                    advance: {
                                                                        ...prev.advance,
                                                                        methods: {
                                                                            ...prev.advance.methods,
                                                                            upi: {
                                                                                ...prev.advance.methods.upi,
                                                                                config: { ...prev.advance.methods.upi.config, qrCodeUrl: mockQr },
                                                                            },
                                                                        },
                                                                    },
                                                                }
                                                                : null
                                                        );
                                                    }}
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
                                    value={config.advance.methods.bankTransfer.enabled}
                                    onValueChange={(val) =>
                                        setConfig((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    advance: {
                                                        ...prev.advance,
                                                        methods: {
                                                            ...prev.advance.methods,
                                                            bankTransfer: { ...prev.advance.methods.bankTransfer, enabled: val },
                                                        },
                                                    },
                                                }
                                                : null
                                        )
                                    }
                                />
                            </View>
                            {config.advance.methods.bankTransfer.enabled && (
                                <>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Bank Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={config.advance.methods.bankTransfer.config.bankName}
                                            onChangeText={(text) =>
                                                setConfig((prev) =>
                                                    prev
                                                        ? {
                                                            ...prev,
                                                            advance: {
                                                                ...prev.advance,
                                                                methods: {
                                                                    ...prev.advance.methods,
                                                                    bankTransfer: {
                                                                        ...prev.advance.methods.bankTransfer,
                                                                        config: {
                                                                            ...prev.advance.methods.bankTransfer.config,
                                                                            bankName: text,
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        }
                                                        : null
                                                )
                                            }
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Account Number</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={config.advance.methods.bankTransfer.config.accountNumber}
                                            onChangeText={(text) =>
                                                setConfig((prev) =>
                                                    prev
                                                        ? {
                                                            ...prev,
                                                            advance: {
                                                                ...prev.advance,
                                                                methods: {
                                                                    ...prev.advance.methods,
                                                                    bankTransfer: {
                                                                        ...prev.advance.methods.bankTransfer,
                                                                        config: {
                                                                            ...prev.advance.methods.bankTransfer.config,
                                                                            accountNumber: text,
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        }
                                                        : null
                                                )
                                            }
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>IFSC Code</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={config.advance.methods.bankTransfer.config.ifscCode}
                                            onChangeText={(text) =>
                                                setConfig((prev) =>
                                                    prev
                                                        ? {
                                                            ...prev,
                                                            advance: {
                                                                ...prev.advance,
                                                                methods: {
                                                                    ...prev.advance.methods,
                                                                    bankTransfer: {
                                                                        ...prev.advance.methods.bankTransfer,
                                                                        config: {
                                                                            ...prev.advance.methods.bankTransfer.config,
                                                                            ifscCode: text,
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        }
                                                        : null
                                                )
                                            }
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Account Holder Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={config.advance.methods.bankTransfer.config.accountHolderName}
                                            onChangeText={(text) =>
                                                setConfig((prev) =>
                                                    prev
                                                        ? {
                                                            ...prev,
                                                            advance: {
                                                                ...prev.advance,
                                                                methods: {
                                                                    ...prev.advance.methods,
                                                                    bankTransfer: {
                                                                        ...prev.advance.methods.bankTransfer,
                                                                        config: {
                                                                            ...prev.advance.methods.bankTransfer.config,
                                                                            accountHolderName: text,
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        }
                                                        : null
                                                )
                                            }
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
                        value={config.discount.enabled}
                        onValueChange={(val) =>
                            setConfig((prev) => prev ? { ...prev, discount: { ...prev.discount, enabled: val } } : null)
                        }
                        trackColor={{ false: "#767577", true: colors.primary }}
                    />
                </View>

                {config.discount.enabled && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.explanation}>
                            Apply a discount when customers pay via {config.advance.enabled ? "Advance Payment" : "Configured Methods"}.
                        </Text>

                        <View style={styles.row}>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={styles.label}>Discount Type</Text>
                                <View style={styles.typeSelector}>
                                    <TouchableOpacity
                                        style={[
                                            styles.typeBtn,
                                            config.discount.type === "PERCENTAGE" && styles.typeBtnSelected
                                        ]}
                                        onPress={() => setConfig(prev => prev ? { ...prev, discount: { ...prev.discount, type: "PERCENTAGE" } } : null)}
                                    >
                                        <Text style={[
                                            styles.typeBtnText,
                                            config.discount.type === "PERCENTAGE" && styles.typeBtnTextSelected
                                        ]}>%</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.typeBtn,
                                            config.discount.type === "FLAT" && styles.typeBtnSelected
                                        ]}
                                        onPress={() => setConfig(prev => prev ? { ...prev, discount: { ...prev.discount, type: "FLAT" } } : null)}
                                    >
                                        <Text style={[
                                            styles.typeBtnText,
                                            config.discount.type === "FLAT" && styles.typeBtnTextSelected
                                        ]}>₹</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={styles.label}>Value</Text>
                                <TextInput
                                    style={styles.input}
                                    value={config.discount.value.toString()}
                                    onChangeText={(text) =>
                                        setConfig((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    discount: { ...prev.discount, value: Number(text) || 0 },
                                                }
                                                : null
                                        )
                                    }
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                value={config.discount.description}
                                onChangeText={(text) =>
                                    setConfig((prev) => prev ? { ...prev, discount: { ...prev.discount, description: text } } : null)
                                }
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
