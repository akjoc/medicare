import { APP_CONFIG } from "@/constants/app";
import { login } from "@/services/auth.service";
import { colors } from "@/styles/colors";
import { spacing } from "@/styles/spacing";
import { typography } from "@/styles/typography";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === "admin") {
        router.replace("/(admin)/orders"); // Redirect to admin products
      } else if (user.role === "retailer") {
        router.replace("/(retailer)/home"); // Redirect to retailer categories
      } else {
        Alert.alert("Error", "Unknown user role");
      }
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Login failed. Please check your credentials.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
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
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={setPassword}
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
            onPress={handleLogin}
            disabled={loading}
            style={[
              styles.primaryButton,
              loading && styles.disabledButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Logging in..." : "Login"}
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
