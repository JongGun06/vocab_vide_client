import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useStore } from "../../src/store/useStore";
import { THEMES, ThemeType } from "../../src/constants/themes";
import {
  Palette,
  Download,
  Trash2,
  CheckCircle2,
  Copy,
  PlusCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

export default function SettingsScreen() {
  const { theme, setTheme, addWords, words, resetWords } = useStore();
  const currentTheme = THEMES[theme] || THEMES.emerald;

  const [jsonInput, setJsonInput] = useState("");

  const [manualWord, setManualWord] = useState("");
  const [manualTranslation, setManualTranslation] = useState("");
  const [manualExamples, setManualExamples] = useState("");

  const handleImport = () => {
    try {
      if (!jsonInput.trim()) return;
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        addWords(parsed);
        setJsonInput("");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Успех", `Добавлено слов: ${parsed.length}`);
      }
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Ошибка", "JSON кривой");
    }
  };

  const handleManualAdd = () => {
    if (!manualWord.trim() || !manualTranslation.trim()) {
      Alert.alert("Эй", "Слово и перевод обязательны");
      return;
    }

    const examplesArray = manualExamples
      .split(";")
      .filter((ex) => ex.trim() !== "")
      .map((ex) => {
        const [eng, rus] = ex.split("-");
        return {
          sentence: eng ? eng.trim() : "",
          translation: rus ? rus.trim() : "",
        };
      });

    const newWord = [
      {
        word: manualWord.trim(),
        translation: manualTranslation.trim(),
        examples: examplesArray,
      },
    ];

    addWords(newWord);

    setManualWord("");
    setManualTranslation("");
    setManualExamples("");

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Готово", "Слово с примерами добавлено!");
  };

  const handleCopy = async () => {
    if (words.length === 0) return;
    const jsonString = JSON.stringify(words, null, 2);
    await Clipboard.setStringAsync(jsonString);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Готово", "База в буфере обмена");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          Настройки
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <PlusCircle size={20} color={currentTheme.primary} />
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Быстрое добавление
          </Text>
        </View>

        <View style={styles.manualRow}>
          <TextInput
            style={[
              styles.inputSmall,
              {
                backgroundColor: currentTheme.card,
                color: currentTheme.text,
                borderColor: currentTheme.border,
              },
            ]}
            placeholder="Слово"
            placeholderTextColor={currentTheme.textSecondary}
            value={manualWord}
            onChangeText={setManualWord}
          />
          <TextInput
            style={[
              styles.inputSmall,
              {
                backgroundColor: currentTheme.card,
                color: currentTheme.text,
                borderColor: currentTheme.border,
              },
            ]}
            placeholder="Перевод"
            placeholderTextColor={currentTheme.textSecondary}
            value={manualTranslation}
            onChangeText={setManualTranslation}
          />
        </View>

        <TextInput
          multiline
          style={[
            styles.inputExample,
            {
              backgroundColor: currentTheme.card,
              color: currentTheme.text,
              borderColor: currentTheme.border,
            },
          ]}
          placeholder="Примеры: English - Перевод; Next sentence - Перевод;" // Обновленный плейсхолдер
          placeholderTextColor={currentTheme.textSecondary}
          value={manualExamples}
          onChangeText={setManualExamples}
        />

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: currentTheme.primary }]}
          onPress={handleManualAdd}
        >
          <Text style={[styles.btnText, { color: "#fff" }]}>
            Добавить слово
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Download size={20} color={currentTheme.primary} />
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Импорт/Экспорт JSON
          </Text>
        </View>
        <TextInput
          multiline
          style={[
            styles.input,
            {
              backgroundColor: currentTheme.card,
              color: currentTheme.text,
              borderColor: currentTheme.border,
            },
          ]}
          placeholder="Вставь массив JSON..."
          placeholderTextColor={currentTheme.textSecondary}
          value={jsonInput}
          onChangeText={setJsonInput}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: currentTheme.primary },
            ]}
            onPress={handleImport}
          >
            <Text style={[styles.btnText, { color: "#fff" }]}>Импорт</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: currentTheme.card,
                borderWidth: 1,
                borderColor: currentTheme.border,
              },
            ]}
            onPress={handleCopy}
          >
            <Copy size={18} color={currentTheme.text} />
            <Text style={[styles.btnText, { color: currentTheme.text }]}>
              Копия всей базы
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.resetBtn, { marginTop: 15 }]}
          onPress={() => resetWords()}
        >
          <Trash2 size={18} color="#EF4444" />
          <Text style={{ color: "#EF4444", fontWeight: "700" }}>
            Удалить всё ({words.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Palette size={20} color={currentTheme.primary} />
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Выбор темы
          </Text>
        </View>
        <View style={styles.themeGrid}>
          {(Object.keys(THEMES) as ThemeType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.themeCard,
                {
                  backgroundColor: THEMES[t].card,
                  borderColor:
                    theme === t ? THEMES[t].primary : THEMES[t].border,
                },
              ]}
              onPress={() => {
                setTheme(t);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View
                style={[
                  styles.colorCircle,
                  { backgroundColor: THEMES[t].primary },
                ]}
              />
              <Text
                numberOfLines={1}
                style={[styles.themeName, { color: THEMES[t].text }]}
              >
                {THEMES[t].name}
              </Text>
              {theme === t && (
                <CheckCircle2 size={14} color={THEMES[t].primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 70, marginBottom: 30 },
  title: { fontSize: 36, fontWeight: "900" },
  section: { marginBottom: 40 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  themeCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  colorCircle: { width: 10, height: 10, borderRadius: 5 },
  themeName: { flex: 1, fontSize: 13, fontWeight: "600" },
  manualRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  inputSmall: {
    flex: 1,
    height: 55,
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
  },
  inputExample: {
    height: 80,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  saveBtn: {
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 100,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  buttonRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnText: { fontWeight: "800" },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 15,
  },
});
