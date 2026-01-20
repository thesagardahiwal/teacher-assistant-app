export interface LocalEvent {
    id: string;
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    type: 'PERSONAL' | 'REMINDER';
    createdAt: string;
}
