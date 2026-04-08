import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { fetchRandomCurse } from "../../src/api/api";
import { useStore } from "../../src/store/useStore";
import { THEMES } from "../../src/constants/themes";
import { Swords, RotateCcw, Heart } from "lucide-react-native";

const { width } = Dimensions.get("window");

const SUCCESS_MSGS = [
  "Чистая победа! Сукуна нервно курит в сторонке. 🚬",
  "Проклятие изгнано! Магический колледж гордится тобой. 🏫",
  "Legendary! Ты буквально стер это зло из реальности. ✨",
];

const FAIL_MSGS = [
  "Тебя поглотила тьма... Попробуй еще раз, шаман. 🌑",
  "Твоей энергии не хватило. Проклятие смеется тебе в лицо. 👹",
  "Поражение. Твой английский — твоя главная слабость сегодня. 📚",
];

export default function BattleScreen() {
  const { words, theme } = useStore();
  const currentTheme = THEMES[theme] || THEMES.emerald;

  const [curse, setCurse] = useState<any>(null);
  const [battleWords, setBattleWords] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [curseHp, setCurseHp] = useState(100);
  const [playerLives, setPlayerLives] = useState(3);
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  const curseScale = useSharedValue(1);
  const curseTranslateX = useSharedValue(0);
  const hpWidth = useSharedValue(100);

  useEffect(() => {
    initBattle();
  }, [words]);

  const initBattle = async () => {
    const data = await fetchRandomCurse();
    setCurse(data);
    setCurseHp(100);
    setPlayerLives(3);
    hpWidth.value = withTiming(100);
    setCurrentIndex(0);
    setShowModal(false);
    setInput("");

    if (words?.length) {
      const selected = [...words]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.ceil(words.length / 2));
      setBattleWords(selected);
    }
  };

  const checkAnswer = () => {
    const currentWord = battleWords[currentIndex];
    const isCorrect =
      input.toLowerCase().trim() ===
      currentWord.translation.toLowerCase().trim();

    if (isCorrect) {
      const damage = 100 / battleWords.length;
      const newHp = Math.max(0, curseHp - damage);
      setCurseHp(newHp);
      hpWidth.value = withSpring(newHp);

      curseScale.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withSpring(1),
      );
      curseTranslateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );

      if (currentIndex < battleWords.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setInput("");
      } else {
        finishGame(true);
      }
    } else {
      const newLives = playerLives - 1;
      setPlayerLives(newLives);
      setInput("");

      if (newLives <= 0) {
        finishGame(false);
      }
    }
  };

  const finishGame = (win: boolean) => {
    const msgs = win ? SUCCESS_MSGS : FAIL_MSGS;
    setResultMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    setShowModal(true);
  };

  const animatedCurseStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: curseScale.value },
      { translateX: curseTranslateX.value },
    ],
  }));

  const animatedHpStyle = useAnimatedStyle(() => ({
    width: `${hpWidth.value}%`,
    backgroundColor: curseHp < 30 ? "#ef4444" : currentTheme.primary,
  }));

  if (!curse || battleWords.length === 0)
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={{ color: currentTheme.text }}>Призыв духа...</Text>
      </View>
    );

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <View style={styles.topBar}>
        <View style={styles.livesContainer}>
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              size={24}
              color={i < playerLives ? "#ef4444" : currentTheme.border}
              fill={i < playerLives ? "#ef4444" : "transparent"}
            />
          ))}
        </View>
        <View style={styles.hpWrapper}>
          <View
            style={[styles.hpBackground, { borderColor: currentTheme.border }]}
          >
            <Animated.View style={[styles.hpFill, animatedHpStyle]} />
          </View>
        </View>
      </View>

      <Animated.View style={[styles.imageContainer, animatedCurseStyle]}>
        <Image
          source={{ uri: curse.url }}
          style={styles.curseImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={[styles.curseName, { color: currentTheme.textSecondary }]}>
        {curse.name?.toUpperCase() || "UNKNOWN ENTITY"}
      </Text>

      <View
        style={[
          styles.inputCard,
          {
            backgroundColor: currentTheme.card,
            borderTopColor: currentTheme.border,
          },
        ]}
      >
        <Text style={[styles.wordText, { color: currentTheme.text }]}>
          {battleWords[currentIndex]?.word}
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: currentTheme.text,
              borderBottomColor: currentTheme.primary,
            },
          ]}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={checkAnswer}
          placeholder="Твой перевод..."
          placeholderTextColor={currentTheme.textSecondary}
          autoFocus
          returnKeyType="send"
        />

        <TouchableOpacity
          style={[styles.attackBtn, { backgroundColor: currentTheme.primary }]}
          onPress={checkAnswer}
        >
          <Swords size={20} color={currentTheme.background} />
          <Text
            style={[styles.attackBtnText, { color: currentTheme.background }]}
          >
            УДАР
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.progressBadge,
            { backgroundColor: currentTheme.background },
          ]}
        >
          <Text style={[styles.progressText, { color: currentTheme.primary }]}>
            {currentIndex + 1} / {battleWords.length}
          </Text>
        </View>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <Text style={styles.modalEmoji}>
              {playerLives > 0 ? "🏆" : "💀"}
            </Text>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              {playerLives > 0 ? "ИЗГНАНО!" : "ТЫ ПАЛ..."}
            </Text>
            <Text
              style={[styles.modalMsg, { color: currentTheme.textSecondary }]}
            >
              {resultMsg}
            </Text>

            <TouchableOpacity
              style={[
                styles.retryBtn,
                { backgroundColor: currentTheme.primary },
              ]}
              onPress={initBattle}
            >
              <RotateCcw size={20} color={currentTheme.background} />
              <Text
                style={[styles.btnText, { color: currentTheme.background }]}
              >
                ПОПРОБОВАТЬ СНОВА
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    width: width - 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  livesContainer: { flexDirection: "row", gap: 5 },
  hpWrapper: { width: "60%" },
  hpBackground: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
  },
  hpFill: { height: "100%" },
  imageContainer: {
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  curseImage: { width: "100%", height: "100%" },
  curseName: {
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 15,
    fontWeight: "bold",
  },
  inputCard: {
    width: width,
    padding: 30,
    borderRadius: 30,
    marginTop: "auto",
    borderTopWidth: 1,
    alignItems: "center",
  },
  wordText: { fontSize: 32, fontWeight: "900", marginBottom: 20 },
  input: {
    width: "100%",
    borderBottomWidth: 2,
    fontSize: 20,
    paddingVertical: 10,
    textAlign: "center",
    marginBottom: 20,
  },
  attackBtn: {
    flexDirection: "row",
    width: "100%",
    padding: 15,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  attackBtnText: { fontWeight: "900", fontSize: 16 },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 20,
  },
  progressText: { fontSize: 11, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width - 60,
    borderRadius: 30,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
  },
  modalEmoji: { fontSize: 50, marginBottom: 15 },
  modalTitle: { fontSize: 24, fontWeight: "900", marginBottom: 10 },
  modalMsg: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  retryBtn: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    gap: 10,
  },
  btnText: { fontWeight: "900", fontSize: 14 },
});