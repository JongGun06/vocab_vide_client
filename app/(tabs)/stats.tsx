import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useStore } from '../../src/store/useStore';
import { THEMES } from '../../src/constants/themes';
import { BarChart3, Target, CheckCircle, Brain, History, Flame, Calendar } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Константы для Heatmap
const WEEKS = 18; // Сколько недель показывать
const DAYS_IN_WEEK = 7;

export default function StatsScreen() {
  const { words, theme, streak } = useStore();
  const currentTheme = THEMES[theme] || THEMES.emerald;

  const stats = useMemo(() => {
    const total = words.length;
    const mastered = words.filter(w => w.level >= 3).length;
    const inProgress = words.filter(w => w.level > 0 && w.level < 3).length;
    const newWords = words.filter(w => w.level === 0).length;

    // Считаем общую активность по истории
    const activityMap: { [key: string]: number } = {};
    let allReviews = 0;
    let successfulReviews = 0;

    words.forEach(word => {
      word.history.forEach(h => {
        allReviews++;
        if (h.state === 'easy') successfulReviews++;
        
        // Группируем по датам для Heatmap
        const dateKey = new Date(h.date).toISOString().split('T')[0];
        activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
      });
    });

    const accuracy = allReviews > 0 ? Math.round((successfulReviews / allReviews) * 100) : 0;

    return { total, mastered, inProgress, newWords, accuracy, activityMap };
  }, [words]);

  // Генерация данных для Heatmap (последние 18 недель)
  const heatmapData = useMemo(() => {
    const cells = [];
    const today = new Date();
    
    for (let i = WEEKS * DAYS_IN_WEEK - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      cells.push({
        date: key,
        count: stats.activityMap[key] || 0
      });
    }
    return cells;
  }, [stats.activityMap]);

  const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
    <Animated.View 
      entering={FadeInDown.delay(delay)} 
      style={[styles.statCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Icon size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: currentTheme.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: currentTheme.textSecondary }]}>{title}</Text>
    </Animated.View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Прогресс</Text>
        <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>Твой путь к мастерству</Text>
      </View>

      <Animated.View 
        entering={FadeInDown.delay(50)} 
        style={[styles.streakCard, { backgroundColor: currentTheme.card, borderColor: '#FF4500' }]}
      >
        <Flame size={32} color="#FF4500" fill="#FF4500" />
        <View>
          <Text style={[styles.streakValue, { color: currentTheme.text }]}>{streak} дней</Text>
          <Text style={[styles.streakTitle, { color: currentTheme.textSecondary }]}>Ударная серия</Text>
        </View>
      </Animated.View>

      <View style={styles.grid}>
        <StatCard title="Всего слов" value={stats.total} icon={BarChart3} color={currentTheme.primary} delay={100} />
        <StatCard title="Точность" value={`${stats.accuracy}%`} icon={Target} color="#A855F7" delay={200} />
        <StatCard title="Выучено" value={stats.mastered} icon={CheckCircle} color="#10B981" delay={300} />
        <StatCard title="В процессе" value={stats.inProgress} icon={Brain} color="#3B82F6" delay={400} />
      </View>

      {/* НОВЫЙ БЛОК: HEATMAP */}
      <Animated.View entering={FadeInDown.delay(450)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color={currentTheme.primary} />
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Активность</Text>
        </View>
        <View style={[styles.heatmapBox, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <View style={styles.heatmapGrid}>
            {heatmapData.map((cell, index) => {
              // Логика яркости квадратика
              let opacity = 0.1;
              if (cell.count > 0) opacity = 0.3;
              if (cell.count > 3) opacity = 0.6;
              if (cell.count > 7) opacity = 1;

              return (
                <View 
                  key={index} 
                  style={[
                    styles.heatCell, 
                    { 
                      backgroundColor: currentTheme.primary, 
                      opacity: opacity 
                    }
                  ]} 
                />
              );
            })}
          </View>
          <Text style={[styles.heatHint, { color: currentTheme.textSecondary }]}>
            Последние 4 месяца активности
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <History size={20} color={currentTheme.primary} />
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Уровни</Text>
        </View>
        <View style={[styles.levelBox, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          {[
            { label: 'Новые', count: stats.newWords, color: currentTheme.textSecondary },
            { label: 'Уровень 1', count: words.filter(w => w.level === 1).length, color: '#3B82F6' },
            { label: 'Уровень 2', count: words.filter(w => w.level === 2).length, color: '#A855F7' },
            { label: 'Мастер', count: stats.mastered, color: '#10B981' },
          ].map((lvl, i) => (
            <View key={i} style={styles.levelRow}>
              <View style={styles.levelLabelBox}>
                <View style={[styles.dot, { backgroundColor: lvl.color }]} />
                <Text style={[styles.levelLabel, { color: currentTheme.text }]}>{lvl.label}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { backgroundColor: lvl.color, width: stats.total > 0 ? `${(lvl.count / stats.total) * 100}%` : '0%' }]} />
              </View>
              <Text style={[styles.levelCount, { color: currentTheme.textSecondary }]}>{lvl.count}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 70, marginBottom: 25 },
  title: { fontSize: 36, fontWeight: '900' },
  subtitle: { fontSize: 16, fontWeight: '600' },
  streakCard: { padding: 20, borderRadius: 28, borderWidth: 2, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  streakValue: { fontSize: 24, fontWeight: '900' },
  streakTitle: { fontSize: 14, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  statCard: { width: (width - 55) / 2, padding: 20, borderRadius: 28, borderWidth: 1 },
  iconBox: { padding: 10, borderRadius: 14, marginBottom: 15, alignSelf: 'flex-start' },
  statValue: { fontSize: 28, fontWeight: '800' },
  statTitle: { fontSize: 14, fontWeight: '600' },
  section: { marginTop: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  
  // Стили для Heatmap
  heatmapBox: { padding: 15, borderRadius: 28, borderWidth: 1, alignItems: 'center' },
  heatmapGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    width: '100%', 
    gap: 4, 
    justifyContent: 'center' 
  },
  heatCell: { 
    width: (width - 120) / 18, // Рассчитываем размер квадратика под экран
    height: (width - 120) / 18, 
    borderRadius: 3 
  },
  heatHint: { fontSize: 11, fontWeight: '600', marginTop: 12, opacity: 0.7 },

  levelBox: { padding: 20, borderRadius: 28, borderWidth: 1, gap: 15 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  levelLabelBox: { width: 85, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  levelLabel: { fontSize: 12, fontWeight: '700' },
  progressTrack: { flex: 1, height: 8, backgroundColor: '#1F2937', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  levelCount: { width: 25, textAlign: 'right', fontSize: 12, fontWeight: '700' },
});