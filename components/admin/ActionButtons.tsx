import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

interface ActionButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onClick?: () => void;
}

const ActionButton = ({ label, icon, onClick }: ActionButtonProps) => {
  return (
    <TouchableOpacity onPress={onClick} className="py-3 flex-row items-center gap-4 border-b border-border dark:border-dark-border">
        <Ionicons
            name={icon}
            size={22}
            color="#1A73E8"
        />
      <Text className="text-base text-primary dark:text-dark-primary font-medium">
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default ActionButton;
