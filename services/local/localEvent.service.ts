import { LocalEvent } from '@/types/local-event.type';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EVENTS_KEY = 'teachora_local_events';

export const localEventService = {
    async getAll(): Promise<LocalEvent[]> {
        try {
            const json = await AsyncStorage.getItem(EVENTS_KEY);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            console.error("Failed to load local events", error);
            return [];
        }
    },

    async addEvent(event: LocalEvent): Promise<void> {
        try {
            const events = await this.getAll();
            events.push(event);
            await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
        } catch (error) {
            console.error("Failed to add local event", error);
            throw error;
        }
    },

    async deleteEvent(id: string): Promise<void> {
        try {
            const events = await this.getAll();
            const filtered = events.filter(e => e.id !== id);
            await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error("Failed to delete local event", error);
            throw error;
        }
    },

    /**
    * Returns events for a specific date (YYYY-MM-DD)
    */
    async getEventsByDate(date: string): Promise<LocalEvent[]> {
        const events = await this.getAll();
        return events.filter(e => e.date === date);
    }
};
