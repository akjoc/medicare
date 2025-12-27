import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export default function SearchBar({
    value,
    onChangeText,
    placeholder = "Search...",
}: SearchBarProps) {
    return (
        <View style={styles.container}>
            <Ionicons name="search-outline" size={20} color={colors.textLight} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textLight}
                autoCapitalize="none"
                autoCorrect={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.textDark,
        padding: 0,
    },
});
