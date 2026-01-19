import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import "@testing-library/jest-native/extend-expect";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

// Mock fonts
jest.mock('expo-font', () => ({
    isLoaded: jest.fn().mockReturnValue(true),
    loadAsync: jest.fn(),
    useFonts: jest.fn().mockReturnValue([true, null]),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    })),
    useSearchParams: jest.fn(() => ({})),
    useSegments: jest.fn(() => []),
    Stack: {
        Screen: jest.fn(() => null),
    },
    Tabs: {
        Screen: jest.fn(() => null),
    },
    Slot: jest.fn(() => null),
    Link: jest.fn(() => null),
}));
