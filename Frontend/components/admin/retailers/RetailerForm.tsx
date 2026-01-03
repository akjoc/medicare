import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Interface defining the shape of a Retailer object
export interface Retailer {
    id: string;
    ownerName: string;
    shopName: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    drugLicenseNumber?: string;
    password?: string;
    status: "active" | "inactive";
    joinedDate: string;
    gst?: string;
}

// Props for the RetailerForm component
interface RetailerFormProps {
    initialValues?: Partial<Retailer>; // Values for editing mode
    onSubmit: (data: any) => Promise<void>; // Submit handler
    isSubmitting?: boolean; // Loading state
}

/**
 * RetailerForm Component
 * 
 * A reusable form for creating or editing retailer information.
 * Handles local state for form fields, validation, and submission.
 */
export default function RetailerForm({
    initialValues,
    onSubmit,
    isSubmitting = false,
}: RetailerFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        ownerName: initialValues?.ownerName || "",
        shopName: initialValues?.shopName || "",
        email: initialValues?.email || "",
        phone: initialValues?.phone || "",
        address: initialValues?.address || "",
        city: initialValues?.city || "",
        state: initialValues?.state || "",
        zipCode: initialValues?.zipCode || "",
        drugLicenseNumber: initialValues?.drugLicenseNumber || "",
        password: "",
        status: initialValues?.status || "active",
        gst: initialValues?.gst || "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Validate all required fields and formats
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.ownerName.trim()) newErrors.ownerName = "Full name is required";
        if (!formData.shopName.trim()) newErrors.shopName = "Shop name is required";

        // Basic email regex validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        // Phone Validation (10 digits)
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (formData.phone.replace(/\D/g, "").length < 10) {
            newErrors.phone = "Phone number must be at least 10 digits";
        }

        if (!formData.address.trim()) newErrors.address = "Address is required";

        // Password is compulsory only for new retailers
        if (!initialValues && !formData.password.trim()) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleInputChange = (field: string, text: string) => {
        setFormData((prev) => ({ ...prev, [field]: text }));
        // Clear error when user types
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        if (validate()) {
            // Prepare payload
            const payload = {
                ...formData,
                city: formData.city || "",
                state: formData.state || "",
                zipCode: formData.zipCode || "",
                drugLicenseNumber: formData.drugLicenseNumber || "",
                gst: formData.gst || "",
                password: formData.password || "",
            };
            await onSubmit(payload);
        }
    };

    const renderInput = (
        label: string,
        field: keyof typeof formData,
        placeholder: string,
        keyboardType: "default" | "email-address" | "phone-pad" = "default",
        multiline = false,
        secureTextEntry = false,
        required = false
    ) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.textArea,
                    errors[field] && styles.inputError,
                ]}
                value={formData[field]}
                onChangeText={(text) => handleInputChange(field, text)}
                placeholder={placeholder}
                placeholderTextColor={colors.textLight}
                keyboardType={keyboardType}
                multiline={multiline}
                autoCapitalize={field === "email" ? "none" : "words"}
                secureTextEntry={secureTextEntry}
            />
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                </View>

                {renderInput("Full Name", "ownerName", "Rahul Sharma", "default", false, false, true)}
                {renderInput("Shop Name", "shopName", "City Center Pharmacy", "default", false, false, true)}
                {renderInput("Email Address", "email", "rahul.sharma@example.com", "email-address", false, false, true)}
                {renderInput("Phone Number", "phone", "9876543210", "phone-pad", false, false, true)}
                {renderInput("Password", "password", "********", "default", false, true, !initialValues)}
            </View>

            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <Ionicons name="location-outline" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>Address & Legal</Text>
                </View>

                {renderInput("Address", "address", "Shop No. 12, Main Market", "default", true, false, true)}
                {renderInput("City", "city", "Gurgaon")}
                {renderInput("State", "state", "Haryana")}
                {renderInput("Zip Code", "zipCode", "122001", "phone-pad")}
                {renderInput("GST Number", "gst", "22AAAAA0000A1Z5")}
                {renderInput("Drug License No.", "drugLicenseNumber", "HR-2024-LIC-998877")}
            </View>

            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon}>
                        <Ionicons name="toggle-outline" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>Status</Text>
                </View>

                <View style={styles.statusContainer}>
                    <Text style={styles.label}>Account Status</Text>
                    <View style={styles.statusOptions}>
                        <TouchableOpacity
                            style={[
                                styles.statusButton,
                                formData.status === "active" && styles.statusButtonActive,
                            ]}
                            onPress={() => setFormData((prev) => ({ ...prev, status: "active" }))}
                        >
                            <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color={formData.status === "active" ? colors.white : colors.textLight}
                            />
                            <Text
                                style={[
                                    styles.statusText,
                                    formData.status === "active" && styles.statusTextActive,
                                ]}
                            >
                                Active
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.statusButton,
                                formData.status === "inactive" && styles.statusButtonInactive,
                            ]}
                            onPress={() => setFormData((prev) => ({ ...prev, status: "inactive" }))}
                        >
                            <Ionicons
                                name="ban"
                                size={20}
                                color={formData.status === "inactive" ? colors.white : colors.textLight}
                            />
                            <Text
                                style={[
                                    styles.statusText,
                                    formData.status === "inactive" && styles.statusTextActive,
                                ]}
                            >
                                Inactive
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={isSubmitting}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="save-outline" size={20} color={colors.white} />
                            <Text style={styles.submitButtonText}>
                                {initialValues ? "Update Retailer" : "Create Retailer"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: `${colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textDark,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
        marginBottom: 8,
    },
    required: {
        color: "#DC3545",
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: colors.textDark,
        borderWidth: 1,
        borderColor: "transparent",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    inputError: {
        borderColor: "#DC3545",
        backgroundColor: "#FFF5F5",
    },
    errorText: {
        color: "#DC3545",
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    statusContainer: {
        marginBottom: 8,
    },
    statusOptions: {
        flexDirection: "row",
        gap: 12,
    },
    statusButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: colors.background,
        gap: 8,
        borderWidth: 1,
        borderColor: "transparent",
    },
    statusButtonActive: {
        backgroundColor: "#28A745",
    },
    statusButtonInactive: {
        backgroundColor: "#DC3545",
    },
    statusText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textLight,
    },
    statusTextActive: {
        color: colors.white,
    },
    footer: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 20,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textLight,
    },
    submitButton: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: colors.primary,
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.white,
    },
});
