import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useTheme } from "../../store/hooks/useTheme";

interface SortOption {
    label: string;
    value: string;
}

interface FilterBarProps {
    onSearch: (query: string) => void;
    onSortChange?: (value: string, order: "asc" | "desc") => void;
    sortOptions?: SortOption[];
    placeholder?: string;
    initialSort?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    onSearch,
    onSortChange,
    sortOptions = [],
    placeholder = "Search...",
    initialSort,
}) => {
    const { isDark } = useTheme();
    const [query, setQuery] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [currentSort, setCurrentSort] = useState(initialSort || sortOptions[0]?.value);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearch(query);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleApplySort = (value: string) => {
        // If clicking the same sort field, toggle order
        let newOrder: "asc" | "desc" = "asc";
        if (value === currentSort) {
            newOrder = sortOrder === "asc" ? "desc" : "asc";
        }

        setCurrentSort(value);
        setSortOrder(newOrder);
        onSortChange?.(value, newOrder);
        setModalVisible(false);
    };

    return (
        <View className="mb-4">
            <View className="flex-row gap-2">
                {/* Search Input */}
                <View className={`flex-1 flex-row items-center px-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <Ionicons name="search" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                    <TextInput
                        className={`flex-1 ml-2 py-3 text-base ${isDark ? "text-white" : "text-gray-900"}`}
                        placeholder={placeholder}
                        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                        value={query}
                        onChangeText={setQuery}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery("")}>
                            <Ionicons name="close-circle" size={18} color={isDark ? "#6B7280" : "#9CA3AF"} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Sort Button */}
                {sortOptions.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className={`w-12 items-center justify-center rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                    >
                        <Ionicons name="filter" size={20} color={isDark ? "#ffffff" : "#374151"} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Sort Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View className="flex-1 justify-end bg-black/50">
                        <TouchableWithoutFeedback>
                            <View className={`rounded-t-3xl p-6 ${isDark ? "bg-gray-900" : "bg-white"}`}>
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        Sort By
                                    </Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                    </TouchableOpacity>
                                </View>

                                <View className="gap-2">
                                    {sortOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={() => handleApplySort(option.value)}
                                            className={`flex-row items-center justify-between p-4 rounded-xl ${currentSort === option.value
                                                    ? isDark ? "bg-blue-900/30" : "bg-blue-50"
                                                    : isDark ? "bg-gray-800" : "bg-gray-50"
                                                }`}
                                        >
                                            <View className="flex-row items-center">
                                                <Text className={`font-medium text-base ${currentSort === option.value
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : isDark ? "text-gray-300" : "text-gray-700"
                                                    }`}>
                                                    {option.label}
                                                </Text>
                                            </View>

                                            {currentSort === option.value && (
                                                <View className="flex-row items-center">
                                                    <Text className="text-xs mr-2 text-blue-600 dark:text-blue-400">
                                                        {sortOrder === "asc" ? "Ascending" : "Descending"}
                                                    </Text>
                                                    <Ionicons
                                                        name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
                                                        size={16}
                                                        color={isDark ? "#60A5FA" : "#2563EB"}
                                                    />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View className="h-4" />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};
