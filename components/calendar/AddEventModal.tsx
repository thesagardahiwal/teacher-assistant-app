import { localEventService } from "@/services/local/localEvent.service";
import { useTheme } from "@/store/hooks/useTheme";
import { LocalEvent } from "@/types/local-event.type";
import { showAlert } from "@/utils/alert";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import uuid from 'react-native-uuid';

interface AddEventModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preSelectedDate?: string;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ visible, onClose, onSuccess, preSelectedDate }) => {
    const { isDark } = useTheme();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date(new Date().setHours(new Date().getHours() + 1))); // Default 1 hour later
    const [loading, setLoading] = useState(false);

    // Date/Time picker visibility states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // Initial setup when modal opens
    React.useEffect(() => {
        if (visible) {
            if (preSelectedDate) {
                // Ensure date string uses hyphens to avoid timezone issues with Date() constructor
                const [y, m, d] = preSelectedDate.split('-').map(Number);
                setDate(new Date(y, m - 1, d));
            } else {
                setDate(new Date());
            }
            // Reset other fields
            setTitle("");
            setDescription("");
            const now = new Date();
            setStartTime(now);
            setEndTime(new Date(now.getTime() + 60 * 60 * 1000));
        }
    }, [visible, preSelectedDate]);

    const handleSave = async () => {
        if (!title.trim()) {
            showAlert("Validation", "Please enter an event title");
            return;
        }

        try {
            setLoading(true);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const startStr = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;
            const endStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;

            const newEvent: LocalEvent = {
                id: uuid.v4() as string,
                title: title.trim(),
                description: description.trim(),
                date: dateStr,
                startTime: startStr,
                endTime: endStr,
                type: 'PERSONAL', // Default for now
                createdAt: new Date().toISOString()
            };

            await localEventService.addEvent(newEvent);
            showAlert("Success", "Event added to calendar");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            showAlert("Error", "Failed to save event");
        } finally {
            setLoading(false);
        }
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) setDate(selectedDate);
    };

    const onChangeStartTime = (event: any, selectedDate?: Date) => {
        setShowStartTimePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setStartTime(selectedDate);
            // Auto-adjust end time to be at least start time
            if (selectedDate > endTime) {
                setEndTime(new Date(selectedDate.getTime() + 60 * 60 * 1000));
            }
        }
    };

    const onChangeEndTime = (event: any, selectedDate?: Date) => {
        setShowEndTimePicker(Platform.OS === 'ios');
        if (selectedDate) setEndTime(selectedDate);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-end bg-black/50"
            >
                <View className={`rounded-t-3xl p-6 ${isDark ? "bg-gray-900" : "bg-white"}`} style={{ maxHeight: '90%' }}>
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            New Event
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Event Title</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Meeting with Principal"
                        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                        className={`p-4 rounded-xl border mb-4 ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                    />

                    {/* Date Picker */}
                    <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Date</Text>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className={`p-4 rounded-xl border mb-4 flex-row items-center ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                    >
                        <Ionicons name="calendar-outline" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        <Text className={`ml-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {date.toLocaleDateString()}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onChangeDate}
                            textColor={isDark ? "white" : "black"}
                        />
                    )}

                    {/* Time Pickers Row */}
                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Start Time</Text>
                            <TouchableOpacity
                                onPress={() => setShowStartTimePicker(true)}
                                className={`p-4 rounded-xl border flex-row items-center ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                            >
                                <Ionicons name="time-outline" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className={`ml-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>
                            {showStartTimePicker && (
                                <DateTimePicker
                                    value={startTime}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onChangeStartTime}
                                    textColor={isDark ? "white" : "black"}
                                />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>End Time</Text>
                            <TouchableOpacity
                                onPress={() => setShowEndTimePicker(true)}
                                className={`p-4 rounded-xl border flex-row items-center ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                            >
                                <Ionicons name="time-outline" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className={`ml-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>
                            {showEndTimePicker && (
                                <DateTimePicker
                                    value={endTime}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onChangeEndTime}
                                    textColor={isDark ? "white" : "black"}
                                />
                            )}
                        </View>
                    </View>

                    {/* Description */}
                    <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Description (Optional)</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add details..."
                        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                        multiline
                        numberOfLines={3}
                        className={`p-4 rounded-xl border mb-6 h-24 ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                        style={{ textAlignVertical: 'top' }}
                    />

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading}
                        className={`p-4 rounded-xl flex-row justify-center items-center ${isDark ? "bg-blue-600" : "bg-blue-600"}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={20} color="white" />
                                <Text className="ml-2 font-bold text-white">Save Event</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};
