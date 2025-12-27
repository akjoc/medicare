import { Stack } from "expo-router";

export default function RetailersLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "transparent" },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="create" />
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
