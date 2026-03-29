/**
 * SpeakBuddy - Local Storage Manager
 * Handles all data persistence using localStorage
 */

const Storage = {
  KEYS: {
    PARENT: 'speakbuddy_parent',
    CHILD: 'speakbuddy_child',
    CONVERSATIONS: 'speakbuddy_conversations',
    PROGRESS: 'speakbuddy_progress',
    VOCABULARY: 'speakbuddy_vocabulary',
    SETTINGS: 'speakbuddy_settings',
    STREAK: 'speakbuddy_streak',
  },

  // === Parent ===
  saveParent(parent) {
    localStorage.setItem(this.KEYS.PARENT, JSON.stringify(parent));
  },

  getParent() {
    const data = localStorage.getItem(this.KEYS.PARENT);
    return data ? JSON.parse(data) : null;
  },

  // === Child Profile ===
  saveChild(child) {
    localStorage.setItem(this.KEYS.CHILD, JSON.stringify(child));
  },

  getChild() {
    const data = localStorage.getItem(this.KEYS.CHILD);
    return data ? JSON.parse(data) : null;
  },

  // === Conversations ===
  saveConversation(conversation) {
    const conversations = this.getConversations();
    conversations.push(conversation);
    localStorage.setItem(this.KEYS.CONVERSATIONS, JSON.stringify(conversations));
  },

  getConversations() {
    const data = localStorage.getItem(this.KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  },

  getRecentConversations(limit = 5) {
    const convos = this.getConversations();
    return convos.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)).slice(0, limit);
  },

  // === Learning Progress ===
  saveProgress(progress) {
    const allProgress = this.getAllProgress();
    const today = new Date().toISOString().split('T')[0];
    const existingIndex = allProgress.findIndex(p => p.date === today);
    if (existingIndex >= 0) {
      allProgress[existingIndex] = { ...allProgress[existingIndex], ...progress, date: today };
    } else {
      allProgress.push({ ...progress, date: today });
    }
    localStorage.setItem(this.KEYS.PROGRESS, JSON.stringify(allProgress));
  },

  getAllProgress() {
    const data = localStorage.getItem(this.KEYS.PROGRESS);
    return data ? JSON.parse(data) : [];
  },

  getTodayProgress() {
    const today = new Date().toISOString().split('T')[0];
    const all = this.getAllProgress();
    return all.find(p => p.date === today) || {
      date: today,
      conversationsCount: 0,
      totalWords: 0,
      speakingTimeSeconds: 0,
      avgGrammar: 0,
      avgVocab: 0,
      avgFluency: 0,
      avgCreativity: 0,
    };
  },

  getWeeklyProgress() {
    const all = this.getAllProgress();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayProgress = all.find(p => p.date === dateStr);
      days.push({
        date: dateStr,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        ...dayProgress,
        speakingTimeSeconds: dayProgress?.speakingTimeSeconds || 0,
        conversationsCount: dayProgress?.conversationsCount || 0,
      });
    }
    return days;
  },

  // === Vocabulary ===
  addVocabulary(word, context) {
    const vocab = this.getVocabulary();
    const existing = vocab.find(v => v.word.toLowerCase() === word.toLowerCase());
    if (existing) {
      existing.timesUsed += 1;
      existing.lastUsed = new Date().toISOString();
      if (existing.timesUsed >= 10) existing.mastery = 5;
      else if (existing.timesUsed >= 7) existing.mastery = 4;
      else if (existing.timesUsed >= 4) existing.mastery = 3;
      else if (existing.timesUsed >= 2) existing.mastery = 2;
    } else {
      vocab.push({
        word: word.toLowerCase(),
        timesUsed: 1,
        mastery: 1,
        context,
        firstUsed: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      });
    }
    localStorage.setItem(this.KEYS.VOCABULARY, JSON.stringify(vocab));
  },

  getVocabulary() {
    const data = localStorage.getItem(this.KEYS.VOCABULARY);
    return data ? JSON.parse(data) : [];
  },

  getVocabularyCount() {
    return this.getVocabulary().length;
  },

  // === Streak ===
  updateStreak() {
    const streak = this.getStreak();
    const today = new Date().toISOString().split('T')[0];
    
    if (streak.lastActiveDate === today) return streak;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (streak.lastActiveDate === yesterdayStr) {
      streak.currentStreak += 1;
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    } else if (streak.lastActiveDate !== today) {
      streak.currentStreak = 1;
    }
    
    streak.lastActiveDate = today;
    if (!streak.activeDays) streak.activeDays = [];
    if (!streak.activeDays.includes(today)) {
      streak.activeDays.push(today);
    }
    // Keep only last 30 days
    streak.activeDays = streak.activeDays.slice(-30);
    
    localStorage.setItem(this.KEYS.STREAK, JSON.stringify(streak));
    return streak;
  },

  getStreak() {
    const data = localStorage.getItem(this.KEYS.STREAK);
    return data ? JSON.parse(data) : {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      activeDays: [],
    };
  },

  // === Settings ===
  saveSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
  },

  getSettings() {
    const data = localStorage.getItem(this.KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      soundEffects: true,
      buddyVoice: true,
      reminders: false,
    };
  },

  // === Utilities ===
  isRegistered() {
    return this.getChild() !== null && this.getParent() !== null;
  },

  clearAll() {
    Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
  },

  // === Analytics Helpers ===
  getTotalSpeakingTime() {
    const all = this.getAllProgress();
    return all.reduce((sum, p) => sum + (p.speakingTimeSeconds || 0), 0);
  },

  getTotalConversations() {
    return this.getConversations().length;
  },

  getTotalWordCount() {
    const all = this.getAllProgress();
    return all.reduce((sum, p) => sum + (p.totalWords || 0), 0);
  },

  getAverageScores() {
    const all = this.getAllProgress().filter(p => p.avgGrammar > 0);
    if (all.length === 0) return { grammar: 0, vocab: 0, fluency: 0, creativity: 0 };
    return {
      grammar: (all.reduce((s, p) => s + (p.avgGrammar || 0), 0) / all.length).toFixed(1),
      vocab: (all.reduce((s, p) => s + (p.avgVocab || 0), 0) / all.length).toFixed(1),
      fluency: (all.reduce((s, p) => s + (p.avgFluency || 0), 0) / all.length).toFixed(1),
      creativity: (all.reduce((s, p) => s + (p.avgCreativity || 0), 0) / all.length).toFixed(1),
    };
  },

  // === Memory System (for conversation personalization) ===
  saveMemory(memory) {
    const memories = this.getMemories();
    memories.push({
      ...memory,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    // Keep last 100 memories
    if (memories.length > 100) memories.splice(0, memories.length - 100);
    localStorage.setItem('speakbuddy_memories', JSON.stringify(memories));
  },

  getMemories(type = null) {
    const data = localStorage.getItem('speakbuddy_memories');
    const memories = data ? JSON.parse(data) : [];
    if (type) return memories.filter(m => m.type === type);
    return memories;
  },

  getRelevantMemories(topic) {
    const memories = this.getMemories();
    const topicWords = topic.toLowerCase().split(/\s+/);
    return memories.filter(m => {
      const memWords = m.content.toLowerCase();
      return topicWords.some(w => w.length > 3 && memWords.includes(w));
    }).slice(-5);
  },
};
