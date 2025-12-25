import { APP_CONFIG } from "@/constants/app";
import { loginAs } from "@/services/auth.service";
import { colors } from "@/styles/colors";
import { spacing } from "@/styles/spacing";
import { typography } from "@/styles/typography";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<null | "admin" | "retailer">(null);

  async function handleLogin(role: "admin" | "retailer") {
    if (loading) return;

    setLoading(role);

    try {
      const user = await loginAs(role);

      if (user.role === "admin") {
        router.replace("/(admin)/orders");
      } else {
        router.replace("/(retailer)/home");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        {/* BRANDING */}
        <View style={styles.header}>
          <Text style={styles.appName}>{APP_CONFIG.NAME}</Text>
          <Text style={styles.tagline}>{APP_CONFIG.TAGLINE}</Text>
        </View>

        {/* LOGIN CARD */}
        <View style={styles.card}>
          <Text style={styles.loginTitle}>Login</Text>

          <TextInput
            placeholder="Email"
            style={styles.input}
            placeholderTextColor={colors.textLight}
          />

          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              placeholderTextColor={colors.textLight}
            />

            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.textLight}
              />
            </Pressable>
          </View>

          <Pressable
            onPress={() => handleLogin("retailer")}
            disabled={loading !== null}
            style={[
              styles.primaryButton,
              loading && styles.disabledButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {loading === "retailer" ? "Logging in..." : "Login as Retailer"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleLogin("admin")}
            disabled={loading !== null}
            style={[
              styles.secondaryButton,
              loading && styles.disabledButton,
            ]}
          >
            <Text style={styles.secondaryButtonText}>
              {loading === "admin" ? "Logging in..." : "Login as Admin"}
            </Text>
          </Pressable>

        </View>
      </View>

      {/* SUPPORT */}
      <View style={styles.footer}>
        <Text style={styles.supportText}>Need help? Contact support</Text>
      </View>
    </SafeAreaView >
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  appName: {
    color: colors.white,
    ...typography.title,
  },
  tagline: {
    color: colors.white,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
  },
  loginTitle: {
    ...typography.label,
    marginBottom: spacing.md,
    color: colors.textDark,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    color: colors.textDark,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    color: colors.white,
    textAlign: "center",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#6C757D",
    padding: spacing.sm,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: colors.white,
    textAlign: "center",
  },
  footer: {
    marginTop: "auto",
    marginBottom: spacing.md,
    alignItems: "center",
  },
  supportText: {
    color: colors.white,
    fontSize: 12,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    color: colors.textDark,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
