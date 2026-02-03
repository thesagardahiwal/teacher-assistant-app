import { useTheme } from "@/store/hooks/useTheme";
import { Assessment } from "@/types/assessment.type";
import { LocalEvent } from "@/types/local-event.type";
import { ClassSchedule } from "@/types/schedule.type";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";

// Configure calendar locale if needed (optional)
LocaleConfig.locales['en'] = LocaleConfig.locales[''];
LocaleConfig.defaultLocale = 'en';

interface EnhancedCalendarProps {
    schedules: ClassSchedule[];
    assessments: Assessment[];
    localEvents?: LocalEvent[];
    role: "TEACHER" | "STUDENT" | "PRINCIPAL" | "ADMIN";
    refreshing?: boolean;
    onRefresh?: () => void;
    onDateSelected?: (date: string) => void;
}

const DAYS_MAP: Record<string, number> = {
    SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

export const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
    schedules,
    assessments,
    localEvents = [],
    role,
    refreshing,
    onRefresh,
    onDateSelected,
}) => {
    const { isDark, colors } = useTheme();
    // State
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [currentMonth, setCurrentMonth] = useState(todayStr);

    // Helpers
    const getDatesForDayOfWeek = (dayStr: string, year: number, month: number) => {
        const dates: string[] = [];
        const normalizedDay = dayStr.toUpperCase().substring(0, 3);
        const dayIndex = DAYS_MAP[normalizedDay];
        if (dayIndex === undefined) return dates;

        const date = new Date(year, month, 1);
        while (date.getDay() !== dayIndex) date.setDate(date.getDate() + 1);

        while (date.getMonth() === month) {
            dates.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
            date.setDate(date.getDate() + 7);
        }
        return dates;
    };

    // Memoized Marked Dates
    const markedDates = useMemo(() => {
        const marks: any = {};
        const dateObj = new Date(currentMonth);
        const monthsToProcess = [
            new Date(dateObj.getFullYear(), dateObj.getMonth() - 1, 1),
            new Date(dateObj.getFullYear(), dateObj.getMonth(), 1),
            new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 1)
        ];

        monthsToProcess.forEach(m => {
            const y = m.getFullYear();
            const mo = m.getMonth();

            // Schedules
            schedules.forEach(s => {
                if (s.dayOfWeek) {
                    getDatesForDayOfWeek(s.dayOfWeek, y, mo).forEach(date => {
                        if (!marks[date]) marks[date] = { dots: [] };
                        if (!marks[date].dots.some((d: any) => d.key === 'class')) {
                            marks[date].dots.push({ key: 'class', color: '#3B82F6' });
                        }
                    });
                }
            });
        });

        // Assessments
        assessments.forEach(a => {
            if (a.dueDate) {
                const d = new Date(a.dueDate);
                const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                if (!marks[date]) marks[date] = { dots: [] };
                if (!marks[date].dots.some((d: any) => d.key === 'test')) {
                    marks[date].dots.push({ key: 'test', color: '#EF4444' });
                }
            }
        });

        // Local Events
        localEvents.forEach(e => {
            if (!marks[e.date]) marks[e.date] = { dots: [] };
            if (!marks[e.date].dots.some((d: any) => d.key === 'event')) {
                marks[e.date].dots.push({ key: 'event', color: '#10B981' });
            }
        });

        // Selected Date Styling
        marks[selectedDate] = {
            ...(marks[selectedDate] || {}),
            selected: true,
            selectedColor: '#2563EB',
            selectedTextColor: '#ffffff'
        };

        return marks;
    }, [schedules, assessments, localEvents, currentMonth, selectedDate]);

    // Filter Items
    const selectedItems = useMemo(() => {
        const [y, m, d] = selectedDate.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

        const daySchedules = schedules
            .filter(s => s.dayOfWeek?.substring(0, 3).toUpperCase() === dayOfWeek)
            .map(s => ({ type: 'CLASS', data: s, time: s.startTime }));

        const dayAssessments = assessments
            .filter(a => {
                if (!a.dueDate) return false;
                const ad = new Date(a.dueDate);
                return `${ad.getFullYear()}-${String(ad.getMonth() + 1).padStart(2, '0')}-${String(ad.getDate()).padStart(2, '0')}` === selectedDate;
            })
            .map(a => ({ type: 'TEST', data: a, time: 'Due Date' }));

        const dayEvents = localEvents
            .filter(e => e.date === selectedDate)
            .map(e => ({ type: 'EVENT', data: e, time: e.startTime }));

        return [...daySchedules, ...dayAssessments, ...dayEvents].sort((a, b) => a.time.localeCompare(b.time));
    }, [selectedDate, schedules, assessments, localEvents]);

    // Handlers
    const handleDayPress = (day: DateData) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedDate(day.dateString);
        if (onDateSelected) onDateSelected(day.dateString);
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const isClass = item.type === 'CLASS';
        const isEvent = item.type === 'EVENT';
        const isTest = item.type === 'TEST';

        let borderColor = isClass ? "border-l-blue-500" : isEvent ? "border-l-green-500" : "border-l-red-500";
        let iconName = isClass ? "calendar-clock" : isEvent ? "bell-ring" : "clipboard-text";
        let iconColor = isClass ? "#3B82F6" : isEvent ? "#10B981" : "#EF4444";
        let bgColor = isClass ? "bg-blue-50 dark:bg-blue-900/20" : isEvent ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20";
        let badgeBg = isClass ? "bg-blue-100 dark:bg-blue-900/30" : isEvent ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30";
        let badgeText = isClass ? "text-blue-700 dark:text-blue-300" : isEvent ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300";

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 100).springify()}
                layout={Layout.springify()}
            >
                <TouchableOpacity
                    activeOpacity={0.7}
                    className={`p-4 mb-3 rounded-2xl border-l-4 shadow-sm ${borderColor} ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                >
                    <View className="flex-row">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-2">
                                <View className={`px-2 py-0.5 rounded mr-2 ${badgeBg}`}>
                                    <Text className={`text-[10px] font-bold tracking-wider ${badgeText}`}>
                                        {isClass ? "CLASS" : isEvent ? "EVENT" : "EXAM"}
                                    </Text>
                                </View>
                                <Text className={`text-base font-bold flex-1 ${isDark ? "text-white" : "text-gray-900"}`} numberOfLines={1}>
                                    {isClass ? item.data.subject?.name : isEvent ? item.data.title : "Assessment"}
                                </Text>
                            </View>

                            <Text className={`text-sm mb-2 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                {isClass ? `Class ${item.data.class?.name}` : isEvent ? item.data.description : item.data.title}
                                {role === 'TEACHER' && !isClass && !isEvent && ` • ${item.data.class?.name}`}
                                {role === 'STUDENT' && isClass && ` • ${item.data.teacher?.name}`}
                            </Text>

                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className={`text-xs ml-1 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {isClass ? `${item.data.startTime} - ${item.data.endTime}`
                                        : isEvent ? `${item.data.startTime} - ${item.data.endTime}`
                                            : `Due: ${new Date(item.data.dueDate).toLocaleDateString()}`}
                                </Text>
                            </View>
                        </View>

                        <View className={`w-10 h-10 rounded-full items-center justify-center ml-3 ${bgColor}`}>
                            <MaterialCommunityIcons name={iconName as any} size={20} color={iconColor} />
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View className="flex-1">
            <View className={`mx-4 mt-2 mb-4 rounded-3xl overflow-hidden shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}>
                <Calendar
                    key={isDark ? 'dark' : 'light'}
                    theme={{
                        calendarBackground: colors.background,
                        textSectionTitleColor: isDark ? "#9CA3AF" : "#6B7280",
                        dayTextColor: isDark ? "#E5E7EB" : "#1F2937",
                        todayTextColor: "#2563EB",
                        selectedDayBackgroundColor: "#2563EB",
                        selectedDayTextColor: "#FFFFFF",
                        monthTextColor: isDark ? "#E5E7EB" : "#111827",
                        textMonthFontWeight: 'bold',
                        textDayFontWeight: '500',
                        arrowColor: "#2563EB",
                        dotStyle: { width: 6, height: 6, borderRadius: 3, marginTop: 2 }
                    }}
                    onDayPress={handleDayPress}
                    onMonthChange={(month: DateData) => setCurrentMonth(month.dateString)}
                    markedDates={markedDates}
                    markingType={'multi-dot'}
                    enableSwipeMonths={true}
                    hideExtraDays={false}
                />
            </View>

            <View className="flex-1 px-5">
                <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Queue for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </Text>

                <FlatList
                    data={selectedItems}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${item.type}-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={onRefresh ? <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} tintColor={isDark ? "#FFF" : "#2563EB"} /> : undefined}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-12 opacity-80">
                            <MaterialCommunityIcons name="calendar-blank-outline" size={64} color={isDark ? "#374151" : "#D1D5DB"} />
                            <Text className={`mt-4 text-base font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                No events scheduled
                            </Text>
                            <Text className={`text-xs mt-1 ${isDark ? "text-gray-600" : "text-gray-500"}`}>
                                Enjoy your free time!
                            </Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
};
