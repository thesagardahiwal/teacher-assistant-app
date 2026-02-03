import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Image,
    Platform,
    Pressable,
    ScrollView,
    Text,
    useColorScheme,
    useWindowDimensions,
    View
} from "react-native";
import Animated, {
    FadeInDown,
    FadeInUp
} from "react-native-reanimated";

export default function WebLanding() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const logoSource = isDark
        ? require("../../assets/images/DarkMode.png")
        : require("../../assets/images/LightMode.png");

    // Premium Background Logic
    const backgroundStyle = Platform.OS === 'web' ? {
        backgroundImage: isDark
            ? "radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 70%)"
            : "radial-gradient(circle at 50% 0%, #f1f5f9 0%, #ffffff 70%)",
        backgroundAttachment: 'fixed'
    } : {};

    const dotPattern = Platform.OS === 'web' ? {
        backgroundImage: isDark
            ? "radial-gradient(#334155 1px, transparent 1px)"
            : "radial-gradient(#e2e8f0 1.5px, transparent 1.5px)",
        backgroundSize: "40px 40px",
        opacity: 0.4
    } : {};

    return (
        <ScrollView
            className="flex-1 bg-white dark:bg-[#020617]"
            contentContainerStyle={Platform.OS === 'web' ? { flexGrow: 1 } : undefined}
            showsVerticalScrollIndicator={false}
        >
            <View style={backgroundStyle} className="flex-1 relative overflow-hidden">
                {/* Dotted Overlay */}
                <View style={dotPattern} className="absolute inset-0 pointer-events-none" />

                {/* Glow Orbs */}
                <View className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />
                <View className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] opacity-30 pointer-events-none" />

                {/* ================= NAVBAR ================= */}
                <Animated.View
                    entering={FadeInDown.duration(800)}
                    className="w-full px-4 md:px-8 mb-10"
                >
                    <View className="max-w-5xl p-4 mx-auto w-full">
                        <View className="flex-row items-center justify-between px-6 py-3 rounded-full bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-white/10 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl">
                            <View className="flex-row items-center gap-3">
                                <Image
                                    source={logoSource}
                                    style={{ width: 32, height: 32 }}
                                    resizeMode="contain"
                                />
                                <Text className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Teachora
                                </Text>
                            </View>

                            <View className="flex-row items-center gap-4">
                                <Pressable
                                    onPress={() => router.push("/(auth)/login")}
                                    className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 px-5 py-2 rounded-full transition-all active:scale-95"
                                >
                                    <Text className="text-white dark:text-slate-900 font-semibold text-sm">Get Started</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* ================= HERO ================= */}
                <View className="flex items-center justify-center px-6 pt-10 pb-32">
                    <Animated.View
                        entering={FadeInUp.duration(1000).springify().damping(20)}
                        className="max-w-4xl w-full text-center items-center"
                    >
                        {/* New Badge */}
                        <View className="inline-flex flex-row items-center gap-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full mb-8 backdrop-blur-sm shadow-sm">
                            <View className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <Text className="text-slate-600 dark:text-slate-300 font-medium text-xs tracking-wide">
                                v2.0 is now live
                            </Text>
                        </View>

                        <Text className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1] md:leading-[1.1]">
                            Manage your college{"\n"}
                            <Text className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-secondary">
                                like a pro.
                            </Text>
                        </Text>

                        <Text className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
                            The all-in-one platform for modern education. Streamline attendance, grading, and communication in one beautiful interface.
                        </Text>

                        <View className="flex-row flex-wrap justify-center gap-4">
                            <PremiumButton
                                label="Start for free"
                                icon="arrow-forward"
                                primary
                                onPress={() => router.push("/(auth)/login")}
                            />
                            <PremiumButton
                                label="Download App"
                                icon="cloud-download-outline"
                                onPress={() => {
                                    if (typeof window !== "undefined") {
                                        window.open("https://expo.dev/artifacts/eas/5P1bXbhFNXz3RsToZ2K6F2.apk", "_blank");
                                    }
                                }}
                            />
                        </View>

                        {/* Social Proof / Trusted By */}
                        <View className="mt-16 opacity-60">
                            <Text className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 font-semibold">
                                Trusted by forward-thinking institutes
                            </Text>
                            {/* Placeholder for logos - implementing as simple text for now */}
                            <View className="flex-row gap-8 justify-center items-center grayscale opacity-70">
                                <Ionicons name="school" size={24} color={isDark ? "white" : "black"} />
                                <Ionicons name="business" size={24} color={isDark ? "white" : "black"} />
                                <Ionicons name="library" size={24} color={isDark ? "white" : "black"} />
                                <Ionicons name="globe" size={24} color={isDark ? "white" : "black"} />
                            </View>
                        </View>
                    </Animated.View>
                </View>

                {/* ================= BENTO GRID FEATURES ================= */}
                <View className="py-24 px-6 md:px-12 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                    <View className="max-w-6xl mx-auto">
                        <View className="mb-20">
                            <Text className="text-primary font-bold tracking-wider uppercase text-sm mb-2">Features</Text>
                            <Text className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Everything you need to run a school.
                            </Text>
                        </View>

                        <View className="flex-row flex-wrap -m-3">
                            {/* Large Card 1 */}
                            <BentoCard
                                boxClassName="w-full md:w-2/3 p-3"
                                className="h-[400px] bg-white dark:bg-slate-900"
                                title="Smart Scheduling"
                                desc="Automated conflict resolution for complex timetables. Drag and drop interface."
                                icon="calendar"
                                gradient="from-blue-500/10 to-indigo-500/10"
                            >
                                {/* Visualization Mockup */}
                                <View className="absolute bottom-6 right-6 left-6 h-40 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 opacity-50 overflow-hidden">
                                    <View className="grid grid-cols-4 gap-2 p-2">
                                        {[1, 2, 3, 4].map(i => <View key={i} className="h-8 bg-blue-500/20 rounded md:h-20" />)}
                                    </View>
                                </View>
                            </BentoCard>

                            {/* Small Card 1 */}
                            <BentoCard
                                boxClassName="w-full md:w-1/3 p-3"
                                className="h-[400px] bg-white dark:bg-slate-900"
                                title="Live Analytics"
                                desc="Real-time insights into student performance."
                                icon="stats-chart"
                                gradient="from-emerald-500/10 to-teal-500/10"
                            >
                                <View className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <View className="w-12 h-12 rounded-full bg-emerald-500/40" />
                                </View>
                            </BentoCard>

                            {/* Small Card 2 */}
                            <BentoCard
                                boxClassName="w-full md:w-1/3 p-3"
                                className="h-[350px] bg-white dark:bg-slate-900"
                                title="Secure Vault"
                                desc="Bank-grade encryption for all study materials."
                                icon="lock-closed"
                                gradient="from-orange-500/10 to-red-500/10"
                            />

                            {/* Large Card 2 */}
                            <BentoCard
                                boxClassName="w-full md:w-2/3 p-3"
                                className="h-[350px] bg-white dark:bg-slate-900"
                                title="Seamless Communication"
                                desc="Built-in chat, announcements, and parent notifications directly in the app."
                                icon="chatbubbles"
                                gradient="from-purple-500/10 to-pink-500/10"
                            >
                                <View className="absolute bottom-6 right-6 left-1/3 h-24 bg-slate-50 dark:bg-slate-800 rounded-t-lg border-t border-x border-slate-200 dark:border-slate-700 shadow-sm p-4 flex-row gap-3">
                                    <View className="w-8 h-8 rounded-full bg-purple-500/20" />
                                    <View className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded full" />
                                </View>
                            </BentoCard>
                        </View>
                    </View>
                </View>

                {/* ================= ROLES ================= */}
                <View className="py-24 px-6 md:px-12">
                    <View className="max-w-6xl mx-auto">
                        <Text className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white tracking-tight mb-16">
                            Tailored for every role
                        </Text>

                        <View className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <RoleItem
                                icon="shield-checkmark"
                                title="Admin"
                                desc="Full governance and financial oversight."
                                onPress={() => router.push("/(auth)/login?type=admin")}
                            />
                            <RoleItem
                                icon="easel"
                                title="Teacher"
                                desc="Classroom management made effortless."
                                onPress={() => router.push("/(auth)/login?type=teacher")}
                                active
                            />
                            <RoleItem
                                icon="school"
                                title="Student"
                                desc="Track progress and access materials."
                                onPress={() => router.push("/(auth)/login?type=student")}
                            />
                        </View>
                    </View>
                </View>

                {/* ================= FOOTER ================= */}
                <View className="py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <View className="max-w-5xl mx-auto px-6 text-center">
                        <Text className="text-slate-400 font-medium">© 2026 Teachora Inc.</Text>
                    </View>
                </View>

            </View>
        </ScrollView>
    );
}

/* ================= COMPONENT DEFINITIONS ================= */

const NavButton = ({ label }: { label: string }) => (
    <Pressable className="hover:opacity-70 transition-opacity">
        <Text className="text-slate-600 dark:text-slate-300 font-medium text-sm">{label}</Text>
    </Pressable>
);

const PremiumButton = ({ label, icon, primary, onPress }: any) => {
    return (
        <Pressable
            onPress={onPress}
            className={`group px-6 py-3.5 rounded-full flex-row items-center gap-2 border transition-all active:scale-95 ${primary
                ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white shadow-lg shadow-slate-900/20'
                : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
        >
            <Text className={`font-bold text-base ${primary ? 'text-white dark:text-slate-900' : 'text-slate-700 dark:text-white'}`}>
                {label}
            </Text>
            {icon && <Ionicons name={icon} size={18} color={primary ? (Platform.OS === 'web' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'black' : 'white') : '#64748b'} style={{ opacity: 0.9 }} />}
            {/* Note: Icon color logic is simplified here, ideally uses context */}
        </Pressable>
    )
}

const BentoCard = ({ boxClassName, className, title, desc, icon, gradient, children }: any) => {
    return (
        <View className={boxClassName}>
            <Animated.View
                entering={FadeInUp.duration(600).delay(100)}
                className={`relative w-full h-full rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors ${className}`}
            >
                {/* Gradient Background */}
                <View className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <View className="p-8 relative z-10">
                    <View className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                        <Ionicons name={icon} size={24} color="#334155" />
                    </View>
                    <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</Text>
                    <Text className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</Text>
                </View>

                {children}
            </Animated.View>
        </View>
    )
}

const RoleItem = ({ icon, title, desc, active, onPress }: any) => (
    <Pressable
        onPress={onPress}
        className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${active ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
    >
        <View className="flex-row items-center justify-between mb-4">
            <Ionicons name={icon} size={28} color={active ? '#94a3b8' : '#64748b'} />
            <Ionicons name="arrow-forward" size={20} color={active ? 'white' : '#64748b'} className={active ? 'dark:text-slate-900' : ''} />
        </View>
        <Text className={`text-xl font-bold mb-1 ${active ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>{title}</Text>
        <Text className={`font-medium ${active ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500'}`}>{desc}</Text>
    </Pressable>
)