import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface ListItemProps {
  title: string;
  subtitle?: string;
  href: string;
}

export const ListItem = ({ title, subtitle, href }: ListItemProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {}}
      className="flex-row items-center justify-between py-4 border-b border-border dark:border-dark-border"
    >
      <View>
        <Text className="text-base font-medium text-textPrimary dark:text-dark-textPrimary">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-textSecondary dark:text-dark-textSecondary">
            {subtitle}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
    </TouchableOpacity>
  );
};
