import { Stack } from "expo-router";

export default function AccountLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#fff" }
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="app-settings" />
        </Stack>
    );
}
