import { getUser } from "@/services/auth.service";
import { colors } from "@/styles/colors";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AppEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const user = await getUser();
      if (user) {
        if (user.role === "admin") {
          router.replace("/(admin)/orders");
        } else if (user.role === "retailer") {
          router.replace("/(retailer)/home");
        } else {
          router.replace("/(auth)/login");
        }
      } else {
        router.replace("/(auth)/login");
      }
    } catch (error) {
      console.error("Session check failed", error);
      router.replace("/(auth)/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return null;
}

