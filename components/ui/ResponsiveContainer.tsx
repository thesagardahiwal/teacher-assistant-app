import React from "react";
import { View, ViewProps } from "react-native";

interface ResponsiveContainerProps extends ViewProps {
    children: React.ReactNode;
}

/**
 * A wrapper component that centers content with a max-width on large screens.
 * Use this as the root view for screens that need to be centered on web/desktop.
 */
export const ResponsiveContainer = ({ children, className, style, ...props }: ResponsiveContainerProps) => {
    return (
        <View
            className={`flex-1 w-full items-center ${className || ''}`}
            style={style} // Pass style correctly
            {...props}
        >
            <View
                className="flex-1 w-full"
            >
                {children}
            </View>
        </View>
    );
};
