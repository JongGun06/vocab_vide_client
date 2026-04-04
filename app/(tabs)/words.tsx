import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { THEMES } from '../../src/constants/themes';
import { Search, Trash2, GraduationCap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function WordsScreen() {
  const { words, theme, deleteWord } = useStore();
  const currentTheme = THEMES[theme] || THEMES.emerald;
  const [search, setSearch] = useState('');

  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(search.toLowerCase()) || 
    w.translation.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = (id: string, word: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Удалить слово?', `Удалить "${word}" из базы?`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => deleteWord(id) }
    ]);
  };

  const getLevelColor = (level: number) => {
    if (level === 0) return currentTheme.textSecondary;
    if (level >= 3) return '#10B981';
    return currentTheme.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Мои слова</Text>
        <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>Всего в базе: {words.length}</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
        <Search size={20} color={currentTheme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: currentTheme.text }]}
          placeholder="Поиск по словам..."
          placeholderTextColor={currentTheme.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={[styles.wordCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            <View style={styles.wordInfo}>
              <Text style={[styles.wordName, { color: currentTheme.text }]}>{item.word}</Text>
              <Text style={[styles.wordTrans, { color: currentTheme.textSecondary }]}>{item.translation}</Text>
              <View style={styles.levelBadge}>
                <GraduationCap size={14} color={getLevelColor(item.level)} />
                <Text style={[styles.levelText, { color: getLevelColor(item.level) }]}>
                  Level {item.level}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => confirmDelete(item.id, item.word)} style={styles.deleteBtn}>
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
            {search ? 'Ничего не найдено' : 'В базе пока нет слов'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 70, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900' },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    height: 55, 
    borderRadius: 18, 
    borderWidth: 1, 
    marginBottom: 20 
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '600' },
  wordCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    marginBottom: 12 
  },
  wordInfo: { flex: 1, gap: 4 },
  wordName: { fontSize: 18, fontWeight: '800' },
  wordTrans: { fontSize: 15, fontWeight: '500' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  levelText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  deleteBtn: { padding: 10, marginLeft: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, fontWeight: '600' }
});