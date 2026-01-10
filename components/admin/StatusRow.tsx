import { Text, View } from "react-native";

const StatusRow = ({
  label,
  status,
}: {
  label: string;
  status: string;
}) => (
  <View className="flex-row justify-between py-2">
    <Text className="text-textSecondary dark:text-dark-textSecondary">
      {label}
    </Text>
    <Text className="text-success font-semibold">
      {status}
    </Text>
  </View>
);


export default StatusRow;