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
                onPress={() => {
                    router.replace("/(auth)/login");
                }}
            >
                <Text>Logout</Text>
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
    },
});
