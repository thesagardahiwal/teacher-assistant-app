import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Teachora",
    slug: "teachora",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "teachora",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.thesagardahiwal.teachora"
    },
    android: {
        adaptiveIcon: {
            backgroundColor: "#F9FAFB",
            foregroundImage: "./assets/images/android-icon-background.png",
            backgroundImage: "./assets/images/android-icon-background.png",
            monochromeImage: "./assets/images/android-icon-background.png"
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        package: "com.thesagardahiwal.teachora"
    },
    web: {
        output: "static",
        favicon: "./assets/images/favicon.png",
        bundler: "metro"
    },
    plugins: [
        "expo-router",
        [
            "expo-splash-screen",
            {
                image: "./assets/images/splash-icon.png",
                imageWidth: 200,
                resizeMode: "contain",
                backgroundColor: "#F9FAFB",
                dark: {
                    backgroundColor: "#F9FAFB"
                }
            }
        ],
        "@react-native-community/datetimepicker",
        "expo-font",
        "expo-build-properties"
    ],
    experiments: {
        typedRoutes: true,
        reactCompiler: true
    },
    extra: {
        router: {},
        eas: {
            projectId: "7e37d091-6d81-4044-a956-1d952dcb52f7"
        }
    }
});
