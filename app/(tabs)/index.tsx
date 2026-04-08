import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  ScrollView,
} from "react-native";
import { useStore, Word } from "../../src/store/useStore"; // + Word
import { THEMES } from "../../src/constants/themes";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { BookOpen, X, Volume2 } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function CardsScreen() {
  const { words, theme, updateWordProgress, updateStreak } = useStore(); // + updateStreak
  const currentTheme = THEMES[theme] || THEMES.emerald;

  // Локальная очередь сессии (из doc 1)
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hint, setHint] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  const rotation = useSharedValue(0);

  useEffect(() => {
    const due = words.filter((w) => w.nextReview <= Date.now());
    setSessionWords(due);
    updateStreak();
  }, [words.length]);

  const currentWord = sessionWords[0]; 

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value}deg` }],
  }));

  const speak = (text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.speak(text, { language: "en-US", rate: 0.9 });
  };

  const handleFlip = () => {
    if (!currentWord) return;
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rotation.value = withSpring(flipped ? 0 : 180);
    setFlipped(!flipped);
  };

  const checkWord = () => {
    if (!currentWord || !userInput.trim()) return;
    const isCorrect =
      userInput.trim().toLowerCase() === currentWord.translation.toLowerCase();
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleAction(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setHint(currentWord.translation.substring(0, newAttempts));
      setUserInput("");
    }
  };

  const handleAction = (success: boolean) => {
    if (!currentWord) return;

    if (success) {
      updateWordProgress(currentWord.id, true);
      setSessionWords((prev) => prev.slice(1));
    } else {
      setSessionWords((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      updateWordProgress(currentWord.id, false);
    }

    rotation.value = 0;
    setFlipped(false);
    setUserInput("");
    setWrongAttempts(0);
    setHint("");
  };

  if (sessionWords.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: currentTheme.background }]}
      >
        <Text style={[styles.emptyText, { color: currentTheme.text }]}>
          Все выучено! 🔥
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <Text style={[styles.counter, { color: currentTheme.textSecondary }]}>
        Осталось: {sessionWords.length}
      </Text>

      <TouchableOpacity activeOpacity={1} onPress={handleFlip}>
        <Animated.View
          style={[
            styles.card,
            animatedStyle,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            },
          ]}
        >
          {!flipped ? (
            <View style={styles.cardContent}>
              <TouchableOpacity
                style={styles.speakIcon}
                onPress={() => speak(currentWord.word)}
              >
                <Volume2 size={28} color={currentTheme.primary} />
              </TouchableOpacity>
              <Text style={[styles.wordText, { color: currentTheme.text }]}>
                {currentWord.word}
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.transText,
                {
                  color: currentTheme.primary,
                  transform: [{ rotateY: "180deg" }],
                },
              ]}
            >
              {currentWord.translation}
            </Text>
          )}
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.uiContainer}>
        {!flipped ? (
          <View style={styles.inputSection}>
            {hint ? (
              <Text style={[styles.hintText, { color: currentTheme.primary }]}>
                {hint}...
              </Text>
            ) : null}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: currentTheme.card,
                  color: currentTheme.text,
                  borderColor:
                    wrongAttempts > 0 ? "#EF4444" : currentTheme.border,
                },
              ]}
              placeholder="Твой перевод..."
              placeholderTextColor={currentTheme.textSecondary}
              value={userInput}
              onChangeText={setUserInput}
              autoCapitalize="none"
              onSubmitEditing={checkWord}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.smallBtn,
                  {
                    backgroundColor: currentTheme.card,
                    borderColor: currentTheme.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={handleFlip}
              >
                <Text style={{ color: currentTheme.textSecondary }}>Забыл</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.checkBtn,
                  { backgroundColor: currentTheme.primary },
                ]}
                onPress={checkWord}
              >
                <Text style={styles.btnText}>Проверить</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.confirmSection}>
            <View style={styles.confirmRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#EF4444" }]}
                onPress={() => handleAction(false)}
              >
                <Text style={styles.btnText}>Не знал</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: currentTheme.primary },
                ]}
                onPress={() => handleAction(true)}
              >
                <Text style={styles.btnText}>Знал</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.extraButtons}>
              {currentWord.examples && currentWord.examples.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.exampleBtn,
                    { borderColor: currentTheme.primary },
                  ]}
                  onPress={() => setModalVisible(true)}
                >
                  <BookOpen size={20} color={currentTheme.primary} />
                  <Text
                    style={[
                      styles.exampleBtnText,
                      { color: currentTheme.primary },
                    ]}
                  >
                    Примеры
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Примеры для "{currentWord.word}"
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={currentTheme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {currentWord.examples?.map((ex, i) => (
                <View
                  key={i}
                  style={[
                    styles.exampleItem,
                    { borderBottomColor: currentTheme.border },
                  ]}
                >
                  <View style={styles.exRow}>
                    <Text
                      style={[styles.exSentence, { color: currentTheme.text }]}
                    >
                      {ex.sentence}
                    </Text>
                    <TouchableOpacity onPress={() => speak(ex.sentence)}>
                      <Volume2 size={18} color={currentTheme.primary} />
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={[
                      styles.exTrans,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    {ex.translation}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  counter: { position: "absolute", top: 60, fontSize: 16, fontWeight: "700" },
  card: {
    width: width * 0.88,
    height: width * 0.75,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  cardContent: { alignItems: "center", width: "100%" },
  speakIcon: { position: "absolute", top: -60 },
  wordText: { fontSize: 40, fontWeight: "900", textAlign: "center" },
  transText: { fontSize: 34, fontWeight: "700", textAlign: "center" },
  uiContainer: { width: "100%", minHeight: 180 },
  inputSection: { width: "100%", gap: 15 },
  input: {
    width: "100%",
    height: 75,
    borderRadius: 24,
    borderWidth: 2,
    paddingHorizontal: 25,
    fontSize: 22,
  },
  hintText: { fontSize: 18, fontWeight: "800" },
  buttonRow: { flexDirection: "row", gap: 12 },
  smallBtn: {
    flex: 1,
    height: 65,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  checkBtn: {
    flex: 1.5,
    height: 65,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmSection: { width: "100%", alignItems: "center", gap: 20 },
  confirmRow: { flexDirection: "row", gap: 15, width: "100%" },
  extraButtons: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    height: 70,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  exampleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  exampleBtnText: { fontWeight: "700", fontSize: 16 },
  btnText: { color: "white", fontSize: 18, fontWeight: "900" },
  emptyText: { fontSize: 24, fontWeight: "800" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: height * 0.6,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  exampleItem: { paddingVertical: 15, borderBottomWidth: 1 },
  exRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  exSentence: { fontSize: 17, fontWeight: "600", marginBottom: 5, flex: 1 },
  exTrans: { fontSize: 15 },
});
