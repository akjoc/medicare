import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BulkUploadModalProps {
    visible: boolean;
    onClose: () => void;
    onUpload: (file: any, onProgress: (progress: number) => void) => Promise<void>;
}

export default function BulkUploadModal({ visible, onClose, onUpload }: BulkUploadModalProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [completed, setCompleted] = useState(false);

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

            await onUpload(file, (p) => {
                setProgress(p);
            });

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
            console.error(error);
            const message = error.response?.data?.message || error.message || "Failed to upload file";
            Alert.alert("Error", message);
            setUploading(false);
        }
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
});
