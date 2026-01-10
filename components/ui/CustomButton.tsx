import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

const CustomButton = ({ onPress, isLoading, title }: { onPress: () => void; isLoading: boolean; title: string }) => {
  return (
      <TouchableOpacity
          onPress={onPress}
          disabled={isLoading}
          className="bg-primary dark:bg-dark-primary rounded-xl py-4 items-center mt-2"
      >
          {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
          ) : (
              <Text className="text-white font-semibold text-base">
                  {title}
              </Text>
          )}
      </TouchableOpacity>
  )
}

export default CustomButton