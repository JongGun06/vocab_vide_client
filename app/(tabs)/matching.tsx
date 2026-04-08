import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useStore } from "../../src/store/useStore";
import { THEMES } from "../../src/constants/themes";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { RefreshCw, Zap } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface GameItem {
  id: string;
  text: string;
  type: "word" | "translation";
  originalId: string;
}

export default function MatchingScreen() {
  const { words, theme } = useStore();
  const currentTheme = THEMES[theme] || THEMES.emerald;

  const [leftItems, setLeftItems] = useState<GameItem[]>([]);
  const [rightItems, setRightItems] = useState<GameItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(
    null,
  );
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  const initGame = useCallback(() => {
    if (words.length < 5) return;

    const dueWords = words.filter((w) => w.nextReview <= Date.now());

    const newWords = words.filter(
      (w) => w.level === 0 && !dueWords.some((d) => d.id === w.id),
    );

    let selection = [...dueWords].sort(() => 0.5 - Math.random()).slice(0, 5);

    if (selection.length < 5) {
      const needed = 5 - selection.length;
      const additionalNew = newWords
        .sort(() => 0.5 - Math.random())
        .slice(0, needed);
      selection = [...selection, ...additionalNew];
    }

    if (selection.length < 5) {
      const remaining = words.filter(
        (w) => !selection.some((s) => s.id === w.id),
      );
      const finalFill = remaining
        .sort(() => 0.5 - Math.random())
        .slice(0, 5 - selection.length);
      selection = [...selection, ...finalFill];
    }

    const left = selection
      .map((w) => ({
        id: `word-${w.id}`,
        text: w.word,
        type: "word" as const,
        originalId: w.id,
      }))
      .sort(() => 0.5 - Math.random());

    const right = selection
      .map((w) => ({
        id: `trans-${w.id}`,
        text: w.translation,
        type: "translation" as const,
        originalId: w.id,
      }))
      .sort(() => 0.5 - Math.random());

    setLeftItems(left);
    setRightItems(right);
    setSolvedIds([]);
    setSelectedWord(null);
    setSelectedTranslation(null);
  }, [words]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleSelect = (item: GameItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (item.type === "word") {
      if (selectedWord === item.id) setSelectedWord(null);
      else setSelectedWord(item.id);
    } else {
      if (selectedTranslation === item.id) setSelectedTranslation(null);
      else setSelectedTranslation(item.id);
    }
  };

  useEffect(() => {
    if (selectedWord && selectedTranslation) {
      const wordObj = leftItems.find((i) => i.id === selectedWord);
      const transObj = rightItems.find((i) => i.id === selectedTranslation);

      if (wordObj?.originalId === transObj?.originalId) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSolvedIds((prev) => [...prev, wordObj!.originalId]);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      const timer = setTimeout(() => {
        setSelectedWord(null);
        setSelectedTranslation(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedWord, selectedTranslation, leftItems, rightItems]);

  if (words.length < 5) {
    return (
      <View
        style={[styles.container, { backgroundColor: currentTheme.background }]}
      >
        <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
          Нужно хотя бы 5 слов для игры
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Match</Text>
        <TouchableOpacity onPress={initGame} style={styles.refreshBtn}>
          <RefreshCw size={24} color={currentTheme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.gameContainer}>
        <View style={styles.column}>
          {leftItems.map((item, index) => {
            const isSolved = solvedIds.includes(item.originalId);
            const isSelected = selectedWord === item.id;

            if (isSolved)
              return <View key={item.id} style={styles.placeholder} />;

            return (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 100)}
                layout={Layout.springify()}
              >
                <TouchableOpacity
                  style={[
                    styles.item,
                    {
                      backgroundColor: isSelected
                        ? currentTheme.primary
                        : currentTheme.card,
                      borderColor: isSelected
                        ? currentTheme.primary
                        : currentTheme.border,
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      { color: isSelected ? "#fff" : currentTheme.text },
                    ]}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.column}>
          {rightItems.map((item, index) => {
            const isSolved = solvedIds.includes(item.originalId);
            const isSelected = selectedTranslation === item.id;

            if (isSolved)
              return <View key={item.id} style={styles.placeholder} />;

            return (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 100 + 50)}
                layout={Layout.springify()}
              >
                <TouchableOpacity
                  style={[
                    styles.item,
                    {
                      backgroundColor: isSelected
                        ? currentTheme.primary
                        : currentTheme.card,
                      borderColor: isSelected
                        ? currentTheme.primary
                        : currentTheme.border,
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      { color: isSelected ? "#fff" : currentTheme.text },
                    ]}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {solvedIds.length === 5 && (
        <Animated.View entering={FadeInDown} style={styles.winContainer}>
          <Zap
            size={40}
            color={currentTheme.primary}
            fill={currentTheme.primary}
          />
          <Text style={[styles.winText, { color: currentTheme.text }]}>
            Все верно!
          </Text>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: currentTheme.primary }]}
            onPress={initGame}
          >
            <Text style={styles.nextBtnText}>Еще раз</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: {
    marginTop: 50,
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 36, fontWeight: "900" },
  refreshBtn: { padding: 10 },
  gameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  column: { width: "47%", gap: 15 },
  item: {
    height: 85,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  itemText: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  placeholder: { height: 85, marginBottom: 15 },
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    fontWeight: "600",
  },
  winContainer: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
    padding: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#333",
  },
  winText: { fontSize: 24, fontWeight: "800", marginVertical: 15 },
  nextBtn: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 20 },
  nextBtnText: { color: "#fff", fontWeight: "800", fontSize: 18 },
});
