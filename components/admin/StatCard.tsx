import { Text, TouchableOpacity } from "react-native";

const StatCard = ({ title, value, onClick, className }: { title: string; value: string, onClick: () => void, className?: string }) => (
  <TouchableOpacity onPress={onClick} className={`bg-card dark:bg-dark-card rounded-2xl p-4 mb-4 border border-border dark:border-dark-border ${className || 'w-[48%]'}`}>
    <Text className="text-sm text-textSecondary dark:text-dark-textSecondary mb-1">
      {title}
    </Text>
    <Text className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">
      {value}
    </Text>
  </TouchableOpacity>
);

export default StatCard;
