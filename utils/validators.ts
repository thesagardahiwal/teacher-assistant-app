export const validators = {
    isRequired: (value: any): boolean => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'boolean') return true; // Boolean false is valid contextually, but usually required check means "truthy" or "present". For checkbox "i agree", we might need true.
        // For general "required" field, just non-empty logic:
        return true;
    },

    isValidEmail: (email: string): boolean => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    isValidPhone: (phone: string): boolean => {
        // Basic check: 10 digits, optional country code.
        // Allowing + chars, spaces, dashes for flexibility, but ensuring at least 10 digits.
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
    },

    isNumber: (value: any): boolean => {
        if (typeof value === 'number') return !isNaN(value);
        if (typeof value === 'string') return !isNaN(parseFloat(value)) && isFinite(Number(value));
        return false;
    },

    isValidTimeFormat: (time: string): boolean => {
        // HH:MM format (24 hour)
        const re = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return re.test(time);
    },

    isTimeRangeValid: (startTime: string, endTime: string): boolean => {
        if (!startTime || !endTime) return false;
        // Assume HH:MM string comparison works lexicographically for 24h format
        // validation ensures HH:MM
        return startTime < endTime;
    },

    // Validates YYYY-YYYY format where second year is first year + 1
    isValidAcademicYear: (year: string): boolean => {
        const parts = year.split('-');
        if (parts.length !== 2) return false;
        const start = parseInt(parts[0]);
        const end = parseInt(parts[1]);
        if (isNaN(start) || isNaN(end)) return false;
        if (start < 1900 || start > 2100) return false;
        return end === start + 1;
    }
};

export const getErrorMessage = (type: string, fieldName: string) => {
    switch (type) {
        case 'required': return `${fieldName} is required`;
        case 'email': return `Please enter a valid email address`;
        case 'phone': return `Please enter a valid phone number`;
        case 'number': return `${fieldName} must be a number`;
        case 'time': return `${fieldName} must be in HH:MM format`;
        case 'timeRange': return `Start time must be before end time`;
        case 'academicYear': return `Academic year must be YYYY-YYYY (consecutive years)`;
        default: return `Invalid ${fieldName}`;
    }
};
