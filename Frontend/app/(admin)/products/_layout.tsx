import { Stack } from "expo-router";

export default function ProductsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="create" />
            <Stack.Screen name="[id]" />
            <Stack.Screen name="categories/index" />
            <Stack.Screen name="categories/create" />
            <Stack.Screen name="categories/[id]" />
            <Stack.Screen name="companies/index" />
            <Stack.Screen name="companies/create" />
            <Stack.Screen name="companies/[id]" />
        </Stack>
    );
}
