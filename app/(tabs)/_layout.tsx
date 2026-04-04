import React from "react";
import { Tabs } from "expo-router";
import { useStore } from "../../src/store/useStore";
import { THEMES } from "../../src/constants/themes";
import {
  Layers,
  Gamepad2,
  BarChart3,
  Settings,
  Book,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { theme } = useStore();
  const currentTheme = THEMES[theme] || THEMES.emerald;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: currentTheme.primary,
        tabBarInactiveTintColor: currentTheme.textSecondary,
        tabBarStyle: {
          backgroundColor: currentTheme.card,
          borderTopColor: currentTheme.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          elevation: 0,
          //@ts-ignore
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Карточки",
          tabBarIcon: ({ color }) => <Layers size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="matching"
        options={{
          title: "Игра",
          tabBarIcon: ({ color }) => <Gamepad2 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Статистика",
          tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: 'Слова',
          tabBarIcon: ({ color }) => <Book size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Настройки",
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
