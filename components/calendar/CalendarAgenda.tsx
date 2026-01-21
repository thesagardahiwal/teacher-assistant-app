import { Assessment } from "@/types/assessment.type";
import { LocalEvent } from "@/types/local-event.type";
import { ClassSchedule } from "@/types/schedule.type";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useTheme } from "../../store/hooks/useTheme";

interface CalendarAgendaProps {
    schedules: ClassSchedule[];
    assessments: Assessment[];
    localEvents?: LocalEvent[];
    role: "TEACHER" | "STUDENT" | "PRINCIPAL" | "ADMIN";
    refreshing?: boolean;
    onRefresh?: () => void;
    onDateSelected?: (date: string) => void;
}

const DAYS_MAP: Record<string, number> = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
};

export const CalendarAgenda: React.FC<CalendarAgendaProps> = ({ schedules, assessments, localEvents = [], role, refreshing, onRefresh, onDateSelected }) => {
    const { isDark } = useTheme();

    // Get local today string
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const [selectedDate, setSelectedDate] = useState(today);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // ... (rest of the component)



    // Helper to get all dates for a specific day of the week in a given month
    const getDatesForDayOfWeek = (dayStr: string, year: number, month: number) => {
        const dates: string[] = [];

        // Normalize day string (e.g. "Monday" -> "MON")
        const normalizedDay = dayStr.toUpperCase().substring(0, 3);
        const dayIndex = DAYS_MAP[normalizedDay];

        if (dayIndex === undefined) return dates;

        const date = new Date(year, month, 1);
        // Find first occurrence
        while (date.getDay() !== dayIndex) {
            date.setDate(date.getDate() + 1);
        }

        while (date.getMonth() === month) {
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            dates.push(dateStr);
            date.setDate(date.getDate() + 7);
        }
        return dates;
    };

    // Compute marked dates
    const markedDates = useMemo(() => {
        const marks: any = {};

        // Calculate for prev, current, next month to handle navigation smoothly
        const monthsToProcess = [
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
            new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        ];

        monthsToProcess.forEach(m => {
            const year = m.getFullYear();
            const month = m.getMonth();

            // 1. Mark Recurring Schedules
            schedules.forEach((sch) => {
                if (!sch.dayOfWeek) return;
                const days = getDatesForDayOfWeek(sch.dayOfWeek, year, month);
                days.forEach((date) => {
                    if (!marks[date]) marks[date] = { dots: [] };
                    // Avoid duplicate dots for same type
                    if (!marks[date].dots.find((d: any) => d.key === 'class')) {
                        marks[date].dots.push({ key: 'class', color: '#3B82F6', selectedDotColor: 'white' });
                    }
                });
            });
        });

        // 2. Mark Assessments (independent of month, direct dates)
        assessments.forEach((ass) => {
            if (ass.dueDate) {
                // Parse ISO string to Date, then format to local YYYY-MM-DD
                const d = new Date(ass.dueDate);
                const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                if (!marks[date]) marks[date] = { dots: [] };
                if (!marks[date].dots.find((d: any) => d.key === 'test')) {
                    marks[date].dots.push({ key: 'test', color: '#EF4444', selectedDotColor: 'white' });
                }
            }
        });

        // 3. Mark Local Events
        localEvents.forEach(evt => {
            const date = evt.date;
            if (!marks[date]) marks[date] = { dots: [] };
            if (!marks[date].dots.find((d: any) => d.key === 'event')) {
                marks[date].dots.push({ key: 'event', color: '#10B981', selectedDotColor: 'white' });
            }
        });

        // 3. Mark Selected Date
        if (marks[selectedDate]) {
            marks[selectedDate].selected = true;
            marks[selectedDate].selectedColor = '#2563EB';
        } else {
            marks[selectedDate] = { selected: true, selectedColor: '#2563EB', dots: [] };
        }

        return marks;
    }, [schedules, assessments, localEvents, currentMonth, selectedDate]);

    // Filter items for selected day
    const selectedItems = useMemo(() => {
        // Construct date locally from selectedDate string (YYYY-MM-DD)
        const [y, m, d] = selectedDate.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);

        const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase().substring(0, 3);

        // Find schedules for this day
        const daySchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek || s.dayOfWeek?.substring(0, 3).toUpperCase() === dayOfWeek).map(s => ({
            type: 'CLASS',
            data: s,
            time: s.startTime
        }));

        // Find assessments for this date
        const dayAssessments = assessments.filter(a => {
            if (!a.dueDate) return false;
            const ad = new Date(a.dueDate);
            const localAD = `${ad.getFullYear()}-${String(ad.getMonth() + 1).padStart(2, '0')}-${String(ad.getDate()).padStart(2, '0')}`;
            return localAD === selectedDate;
        }).map(a => ({
            type: 'TEST',
            data: a,
            time: 'Due Date'
        }));

        // Find local events for this date
        const dayLocalEvents = localEvents.filter(e => e.date === selectedDate).map(e => ({
            type: 'EVENT',
            data: e,
            time: e.startTime
        }));

        // Combine and sort by time
        return [...daySchedules, ...dayAssessments, ...dayLocalEvents].sort((a, b) => a.time.localeCompare(b.time));
    }, [selectedDate, schedules, assessments, localEvents]);

    const renderItem = ({ item }: { item: any }) => {
        const isClass = item.type === 'CLASS';
        return (
            <View className={`p-4 mb-3 rounded-xl border flex-row items-center border-l-4 ${isClass
                ? (isDark ? "bg-gray-800 border-gray-700 border-l-blue-500" : "bg-white border-gray-100 border-l-blue-500")
                : item.type === 'EVENT'
                    ? (isDark ? "bg-gray-800 border-gray-700 border-l-green-500" : "bg-white border-gray-100 border-l-green-500")
                    : (isDark ? "bg-gray-800 border-gray-700 border-l-red-500" : "bg-white border-gray-100 border-l-red-500")
                }`}>
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <View className={`px-2 py-0.5 rounded mr-2 ${isClass ? "bg-blue-100 dark:bg-blue-900/30" :
                            item.type === 'EVENT' ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                            }`}>
                            <Text className={`text-xs font-bold ${isClass ? "text-blue-700 dark:text-blue-300" :
                                item.type === 'EVENT' ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                                }`}>
                                {isClass ? "CLASS" : item.type === 'EVENT' ? "REMINDER" : item.data.type}
                            </Text>
                        </View>
                        <Text className={`text-base font-bold flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {isClass ? item.data.subject?.name : item.type === 'EVENT' ? item.data.title : "Assessment"}
                        </Text>
                    </View>

                    <Text className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {isClass ? `Class ${item.data.class?.name}` : item.type === 'EVENT' ? item.data.description : item.data.title}
                        {role === 'TEACHER' && !isClass && item.type !== 'EVENT' && ` • ${item.data.class?.name}`}
                        {role === 'STUDENT' && isClass && ` • ${item.data.teacher?.name}`}
                    </Text>

                    <View className="flex-row items-center mt-1">
                        <Ionicons name="time-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        <Text className={`text-xs ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {isClass
                                ? `${item.data.startTime} - ${item.data.endTime}`
                                : item.type === 'EVENT'
                                    ? `${item.data.startTime} - ${item.data.endTime}`
                                    : `Due: ${new Date(item.data.dueDate).toLocaleDateString()}`
                            }
                        </Text>
                    </View>
                </View>

                {isClass && (
                    <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center dark:bg-blue-900/20">
                        <MaterialCommunityIcons name="calendar-clock" size={18} color="#3B82F6" />
                    </View>
                )}
                {!isClass && item.type !== 'EVENT' && (
                    <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center dark:bg-red-900/20">
                        <MaterialCommunityIcons name="clipboard-text" size={18} color="#EF4444" />
                    </View>
                )}
                {item.type === 'EVENT' && (
                    <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center dark:bg-green-900/20">
                        <MaterialCommunityIcons name="bell-ring" size={18} color="#10B981" />
                    </View>
                )}
            </View>
        );
    };

    return (
        <View className="flex-1">
            <Calendar
                theme={{
                    calendarBackground: isDark ? "#111827" : "#FFFFFF",
                    textSectionTitleColor: isDark ? "#9CA3AF" : "#6B7280",
                    dayTextColor: isDark ? "#E5E7EB" : "#2D333A",
                    todayTextColor: "#2563EB",
                    selectedDayBackgroundColor: "#2563EB",
                    selectedDayTextColor: "#ffffff",
                    monthTextColor: isDark ? "#E5E7EB" : "#2D333A",
                    arrowColor: "#2563EB",
                    dotStyle: { width: 5, height: 5, borderRadius: 2.5 }
                }}
                onDayPress={(day: DateData) => {
                    setSelectedDate(day.dateString);
                    if (onDateSelected) onDateSelected(day.dateString);
                }}
                onMonthChange={(month: DateData) => {
                    setCurrentMonth(new Date(month.dateString));
                }}
                markedDates={markedDates}
                markingType={'multi-dot'}
                enableSwipeMonths={true}
            />

            <View className="flex-1 px-4 mt-4">
                <Text className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Queue for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </Text>

                <FlatList
                    data={selectedItems}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={
                        onRefresh ? <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} /> : undefined
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-10">
                            <Text className={`text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                No events for this day.
                            </Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
};
