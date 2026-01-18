import { Stack } from "expo-router";

export default function RetailerAccountLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#fff" }
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="security" />
        </Stack>
    );
}
