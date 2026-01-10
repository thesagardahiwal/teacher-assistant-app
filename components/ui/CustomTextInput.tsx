import React from 'react';
import { TextInput } from 'react-native';

const CustomTextInput = ({ placeholder, secureTextEntry, value, onChangeText }: { placeholder: string; secureTextEntry?: boolean; value: string; onChangeText: (text: string) => void }) => {
    return (
        <TextInput
            className="bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 mb-3 text-textPrimary dark:text-dark-textPrimary"
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            secureTextEntry={secureTextEntry}
            value={value}
            onChangeText={onChangeText}
        />
    )
}

export default CustomTextInput;