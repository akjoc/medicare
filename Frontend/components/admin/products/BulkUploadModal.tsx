import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BulkUploadModalProps {
    visible: boolean;
    onClose: () => void;
    onUpload: (file: any, onProgress: (progress: number) => void) => Promise<void>;
}

export default function BulkUploadModal({ visible, onClose, onUpload }: BulkUploadModalProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [uploadErrors, setUploadErrors] = useState<string[]>([]);

    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
                    "text/csv", // .csv
                    "application/vnd.ms-excel" // .xls
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const file = result.assets[0];

            // Check file size (5MB limit)
            if (file.size && file.size > 5 * 1024 * 1024) {
                Alert.alert("Error", "File size exceeds 5MB limit");
                return;
            }

            setUploading(true);
            setProgress(0);
            setCompleted(false);
            setUploadErrors([]);

            // Simulate progress to ensure user sees activity
            const simulationInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 0.9) return 0.9;
                    return Math.min(prev + 0.1, 0.9);
                });
            }, 300);

            try {
                await onUpload(file, (p) => {
                    // Update progress only if actual progress is greater than simulated
                    setProgress((prev) => Math.max(prev, p));
                });
            } finally {
                clearInterval(simulationInterval);
            }

            setProgress(1);
            setCompleted(true);
            setTimeout(() => {
                onClose();
                // Reset state after closing
                setTimeout(() => {
                    setUploading(false);
                    setProgress(0);
                    setCompleted(false);
                }, 500);
            }, 1500);
        } catch (error: any) {
            // Error handling is improved to showing the modal
            console.error(error);
            const message = error.response?.data?.message || error.message || "Failed to upload file";
            const errors = error.response?.data?.errors;

            if (errors && Array.isArray(errors) && errors.length > 0) {
                setUploadErrors(errors);
            } else {
                Alert.alert("Error", message);
            }
            setUploading(false);
        }
    };

    const handleClose = () => {
        setUploadErrors([]);
        onClose();
    };

    const handleCloseErrorModal = () => {
        setUploadErrors([]);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Bulk Upload Products</Text>
                        {!uploading && (
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.textDark} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.content}>
                        {!uploading ? (
                            <>
                                <View style={styles.uploadArea}>
                                    <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
                                    <Text style={styles.uploadText}>
                                        Select Excel or CSV file
                                    </Text>
                                    <Text style={styles.uploadSubtext}>Max size: 5MB</Text>
                                </View>
                                <TouchableOpacity style={styles.button} onPress={handleUpload}>
                                    <Text style={styles.buttonText}>Select File & Upload</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.progressContainer}>
                                {completed ? (
                                    <View style={styles.completedState}>
                                        <Ionicons name="checkmark-circle" size={64} color="#28A745" />
                                        <Text style={styles.completedText}>Upload Successful!</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={styles.progressText}>Uploading... {Math.round(progress * 100)}%</Text>
                                        <View style={styles.progressBarBg}>
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    { width: `${progress * 100}%` }
                                                ]}
                                            />
                                        </View>
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Error Modal */}
            <Modal
                visible={uploadErrors.length > 0}
                transparent
                animationType="fade"
                onRequestClose={handleCloseErrorModal}
            >
                <View style={styles.errorOverlay}>
                    <View style={styles.errorModal}>
                        <View style={styles.errorHeader}>
                            <Ionicons name="alert-circle" size={48} color={colors.error} />
                            <Text style={styles.errorTitle}>Upload Failed</Text>
                            <Text style={styles.errorSubtitle}>
                                The following errors were found in your file:
                            </Text>
                        </View>
                        <ScrollView style={styles.errorList}>
                            {uploadErrors.map((error, index) => (
                                <View key={index} style={styles.errorItem}>
                                    <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.button} onPress={handleCloseErrorModal}>
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
        marginBottom: 50,
    },
    modal: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 300,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textDark,
    },
    content: {
        flex: 1,
    },
    uploadArea: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: "dashed",
        borderRadius: 16,
        padding: 40,
        marginBottom: 24,
        backgroundColor: colors.background,
    },
    uploadText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: "600",
        color: colors.textDark,
    },
    uploadSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: colors.textLight,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    progressContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
    },
    progressText: {
        marginBottom: 12,
        fontSize: 16,
        fontWeight: "600",
        color: colors.textDark,
    },
    progressBarBg: {
        width: "100%",
        height: 12,
        backgroundColor: colors.border,
        borderRadius: 6,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: colors.primary,
    },
    completedState: {
        alignItems: "center",
        gap: 16,
    },
    completedText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#28A745",
    },
    errorOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorModal: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxHeight: "80%",
        elevation: 5,
    },
    errorHeader: {
        alignItems: "center",
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.error,
        marginTop: 8,
    },
    errorSubtitle: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 4,
        textAlign: "center",
    },
    errorList: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
        backgroundColor: "#FFF5F5",
    },
    errorItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
        gap: 8,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: colors.textDark,
        lineHeight: 20,
    },
});
