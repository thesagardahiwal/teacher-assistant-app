import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Sidebar, SidebarItem } from "./Sidebar";

interface ResponsiveSidebarProps {
  items: SidebarItem[];
  header?: React.ReactNode;
}

export const ResponsiveSidebar = ({ items, header }: ResponsiveSidebarProps) => {
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // 🖥 Desktop → always visible
  if (!isMobile) {
    return (
      <View className={isTablet ? "w-20" : "w-64"}>
        <Sidebar
          items={items}
          header={!isTablet ? header : undefined}
          compact={isTablet}
        />
      </View>
    );
  }

  // 📱 Mobile → Drawer
  return (
    <>
      {/* Hamburger */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="p-2"
      >
        <Ionicons
          name="menu"
          size={26}
          color={isDark ? "#fff" : "#000"}
        />
      </TouchableOpacity>

      {open && (
        <View className="absolute inset-0 z-50">
          {/* Overlay */}
          <TouchableOpacity
            className="absolute inset-0 bg-black/40"
            onPress={() => setOpen(false)}
          />

          {/* Drawer */}
          <View className={`absolute left-0 top-0 bottom-0 w-64 ${isDark ? "bg-gray-900" : "bg-white"}`}>
            <Sidebar
              items={items}
              header={header}
              onNavigate={() => setOpen(false)}
            />
          </View>
        </View>
      )}
    </>
  );
};
