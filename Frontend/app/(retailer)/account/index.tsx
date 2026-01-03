import * as authService from "@/services/auth.service";
import { colors } from "@/styles/colors";
import { spacing } from "@/styles/spacing";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
    return (
        <SafeAreaView>
            <Text>Account</Text>
            <Pressable
                style={styles.logoutButton}
                onPress={async () => {
                    try {
                        await authService.logout();
                        router.replace("/(auth)/login");
                    } catch (error) {
                        console.error("Logout failed", error);
                    }
                }}
            >
                <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    logoutButton: {
        backgroundColor: colors.primary,
        padding: spacing.sm,
        borderRadius: 8,
        marginBottom: spacing.sm,
        alignItems: "center",
    },
    logoutButtonText: {
        color: colors.white,
        fontWeight: "600",
    },
});