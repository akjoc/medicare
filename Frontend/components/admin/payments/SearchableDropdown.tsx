import { colors } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface SearchableDropdownProps<T> {
    data: T[];
    value: string;
    onSelect: (id: string) => void;
    placeholder: string;
    label: string;
    getItemId: (item: T) => string;
    getItemLabel: (item: T) => string;
    allowAll?: boolean;
    // Optional API search
    onSearch?: (query: string) => Promise<T[]>;
    debounceMs?: number;
}

export function SearchableDropdown<T>({
    data,
    value,
    onSelect,
    placeholder,
    label,
    getItemId,
    getItemLabel,
    allowAll = true,
    onSearch,
    debounceMs = 500
}: SearchableDropdownProps<T>) {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<T[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];

    // Use search results if API search is active, otherwise filter local data
    const displayData = onSearch && searchQuery.length > 0 ? searchResults : safeData;

    const filteredData = onSearch
        ? displayData // API search already filtered
        : displayData.filter(item =>
            getItemLabel(item).toLowerCase().includes(searchQuery.toLowerCase())
        );

    const selectedItem = safeData.find(item => getItemId(item) === value);
    const displayText = value ? (selectedItem ? getItemLabel(selectedItem) : "Unknown") : "All";

    // Debounced search effect
    useEffect(() => {
        if (!onSearch || searchQuery.length === 0) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        setIsSearching(true);

        // Set new timer
        debounceTimerRef.current = setTimeout(async () => {
            try {
                const results = await onSearch(searchQuery);
                setSearchResults(results);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, debounceMs);

        // Cleanup
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchQuery, onSearch, debounceMs]);

    const handleSelect = (id: string) => {
        onSelect(id);
        setModalVisible(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
                    {displayText}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {placeholder}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textDark} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color={colors.textLight} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={`Search ${placeholder.toLowerCase()}...`}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                            {isSearching ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : searchQuery.length > 0 ? (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <Ionicons name="close-circle" size={20} color={colors.textLight} />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <FlatList
                            data={filteredData}
                            keyExtractor={(item) => getItemId(item)}
                            ListHeaderComponent={
                                allowAll ? (
                                    <TouchableOpacity
                                        style={[
                                            styles.listItem,
                                            !value && styles.listItemSelected
                                        ]}
                                        onPress={() => handleSelect("")}
                                    >
                                        <Text style={[
                                            styles.listItemText,
                                            !value && styles.listItemTextSelected
                                        ]}>
                                            All
                                        </Text>
                                        {!value && (
                                            <Ionicons name="checkmark" size={20} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ) : null
                            }
                            renderItem={({ item }) => {
                                const itemId = getItemId(item);
                                const isSelected = value === itemId;
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.listItem,
                                            isSelected && styles.listItemSelected
                                        ]}
                                        onPress={() => handleSelect(itemId)}
                                    >
                                        <Text style={[
                                            styles.listItemText,
                                            isSelected && styles.listItemTextSelected
                                        ]}>
                                            {getItemLabel(item)}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={20} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>
                                        No {placeholder.toLowerCase()} found
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textDark,
    },
    dropdownButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.white,
    },
    dropdownText: {
        fontSize: 16,
        color: colors.textDark,
    },
    placeholderText: {
        color: colors.textLight,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "80%",
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textDark,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        margin: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.textDark,
    },
    listItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    listItemSelected: {
        backgroundColor: colors.background,
    },
    listItemText: {
        fontSize: 16,
        color: colors.textDark,
    },
    listItemTextSelected: {
        fontWeight: "600",
        color: colors.primary,
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
        color: colors.textLight,
    },
});
