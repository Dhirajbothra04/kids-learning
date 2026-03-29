# 📄 SpeakBuddy — Complete JavaScript Source Code

This document contains all JavaScript source files from the current web version. Use these as reference for migrating to Android.

---

## 1️⃣ speech.js (4.2 KB)

Handles voice recognition (speech-to-text) and text-to-speech synthesis.

```javascript
/**
 * SpeakBuddy — Speech Manager v7
 *
 * VOICE IMPROVEMENTS:
 * - Smarter voice selection: logs all available voices, picks the best possible
 * - Deliberately slow rates for kids (0.80–0.84)
 * - Tuned pitch per voice type for best naturalness
 * - Falls back gracefully across: Indian female → Indian → Google en-GB → Google en-US → any en
 * - speakWithBestVoice() tries voices in order until one sounds good
 *
 * RECOGNITION: Pause-tolerant continuous mode
 * - 4.5 second silence detection before finalizing speech
 * - Live interim transcription for visual feedback
 */

const Speech = {
  recognition:        null,
  synthesis:          window.speechSynthesis || null,
  isRecording:        false,
  isSpeaking:         false,
  _selectedVoice:     null,   // cached after first selection

  // Callbacks
  onResult:           null,
  onInterim:          null,
  onError:            null,
  onEnd:              null,

  // Pause-tolerance — 4.5 s silence before finalising (kids think slowly)
  _accumulatedText:   '',
  _pauseTimer:        null,
  _pauseMs:           4500,

  // Timer
  timerInterval:      null,
  timerSeconds:       0,

  // ─── Init Recognition ──────────────────────────────────────────────────
  init() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SR) { console.warn('SpeakBuddy: Web Speech API not supported.'); return false; }

    this.recognition = new SR();
    this.recognition.lang            = 'en-IN';
    this.recognition.interimResults  = true;
    this.recognition.maxAlternatives = 3;
    this.recognition.continuous      = true;

    this.recognition.onresult = (event) => {
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this._accumulatedText += (this._accumulatedText ? ' ' : '') + t.trim();
        } else {
          interimChunk += t;
        }
      }
      const live = this._accumulatedText + (interimChunk ? ' ' + interimChunk : '');
      if (live.trim() && this.onInterim) this.onInterim(live.trim());
      this._resetPauseTimer();
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech') { this._tryRestartRecognition(); return; }
      this._clearPauseTimer();
      this.stopTimer();
      this.isRecording = false;
      const msgs = {
        'audio-capture': 'Microphone not found. Please check your device.',
        'not-allowed':   'Please allow microphone access to talk with Priya.',
        'network':       'Network error. Please check your internet.',
        'aborted':       null,
      };
      const msg = msgs[event.error];
      if (msg && this.onError) this.onError(msg);
      if (this.onEnd) this.onEnd();
    };

    this.recognition.onend = () => {
      if (this.isRecording) { this._tryRestartRecognition(); }
      else { this.stopTimer(); if (this.onEnd) this.onEnd(); }
    };

    return true;
  },

  // ─── Voice Selection — best possible quality ───────────────────────
  /**
   * Priority order for a natural Indian female English voice:
   *
   * Tier 1 — Named Indian female voices (macOS / iOS)
   *   Veena (en-IN, macOS) ← best Indian female, warm and clear
   *   Lekha (en-IN, macOS)
   *   Aditi, Priya, Raveena, Kanya, Neerja, Tanvee (various)
   *
   * Tier 2 — Any en-IN voice (usually female on Android/Chrome)
   *   Google हिन्दी / Google English (India)
   *
   * Tier 3 — High-quality Google voices (clear, fast, natural)
   *   Google UK English Female  ← best fallback: clear, warm
   *   Google US English (Female) / Samantha / Karen
   *
   * Tier 4 — Any English
   */
  _selectVoice() {
    if (this._selectedVoice) return this._selectedVoice;

    const voices = this.synthesis.getVoices();

    // Log available voices in dev mode so you can see what's there
    if (voices.length > 0) {
      console.log('[SpeakBuddy] Available voices:', voices.map(v => `${v.name} (${v.lang})`).join(', '));
    }

    // ── Tier 1: Named Indian female voices ──────────────────────────────
    const indianFemaleNames = ['veena', 'lekha', 'aditi', 'priya', 'raveena', 'kanya', 'neerja', 'tanvee', 'pallavi'];
    const tier1 = voices.find(v =>
      indianFemaleNames.some(n => v.name.toLowerCase().includes(n))
    );
    if (tier1) { this._selectedVoice = tier1; return tier1; }

    // ── Tier 2: Any en-IN ────────────────────────────────────────────────
    const tier2 = voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN');
    if (tier2) { this._selectedVoice = tier2; return tier2; }

    // ── Tier 3a: Google UK English Female — best fallback ───────────────
    const ukFemale = voices.find(v =>
      v.name.toLowerCase().includes('google') &&
      (v.name.toLowerCase().includes('uk english female') || v.lang === 'en-GB')
    );
    if (ukFemale) { this._selectedVoice = ukFemale; return ukFemale; }

    // ── Tier 3b: Any Google English ─────────────────────────────────────
    const googleEn = voices.find(v =>
      v.name.toLowerCase().includes('google') && v.lang.startsWith('en')
    );
    if (googleEn) { this._selectedVoice = googleEn; return googleEn; }

    // ── Tier 3c: Known high-quality native voices ────────────────────────
    const niceVoices = ['samantha', 'karen', 'moira', 'tessa', 'fiona'];
    const niceNative = voices.find(v =>
      niceVoices.some(n => v.name.toLowerCase().includes(n))
    );
    if (niceNative) { this._selectedVoice = niceNative; return niceNative; }

    // ── Tier 4: Any English ──────────────────────────────────────────────
    const anyEn = voices.find(v => v.lang.startsWith('en'));
    this._selectedVoice = anyEn || null;
    return this._selectedVoice;
  },

  /**
   * Tune speech parameters based on which voice was selected.
   * Different voices need different rate/pitch to sound natural.
   */
  _tuneParams(voice, baseOptions = {}) {
    // All rates are deliberately slow so kids aged 5–12 can follow easily
    if (!voice) return { rate: 0.82, pitch: 1.0 };

    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();

    // Veena / Lekha — best Indian female voices, warm & clear
    if (name.includes('veena') || name.includes('lekha')) {
      return { rate: baseOptions.rate ?? 0.80, pitch: baseOptions.pitch ?? 1.05 };
    }

    // Other Indian en-IN voices
    if (lang.includes('en-in') || lang.includes('en_in')) {
      return { rate: baseOptions.rate ?? 0.80, pitch: baseOptions.pitch ?? 1.05 };
    }

    // Google UK English Female — slightly slower for clarity
    if (name.includes('google') && (name.includes('uk') || lang.includes('en-gb'))) {
      return { rate: baseOptions.rate ?? 0.84, pitch: baseOptions.pitch ?? 1.08 };
    }

    // Other Google voices
    if (name.includes('google')) {
      return { rate: baseOptions.rate ?? 0.84, pitch: baseOptions.pitch ?? 1.0 };
    }

    // Samantha, Karen etc.
    if (name.includes('samantha') || name.includes('karen')) {
      return { rate: baseOptions.rate ?? 0.82, pitch: baseOptions.pitch ?? 1.05 };
    }

    // Default — slow enough for any child
    return { rate: baseOptions.rate ?? 0.82, pitch: baseOptions.pitch ?? 1.0 };
  },

  // ─── Core speak() ──────────────────────────────────────────────────────
  speak(text, onDone = null, options = {}) {
    if (!this.synthesis) { if (onDone) onDone(); return; }

    const settings = Storage.getSettings();
    if (settings.buddyVoice === false) { if (onDone) onDone(); return; }

    this.synthesis.cancel();
    this.isSpeaking = true;

    // Clean text — strip HTML, emoji, markdown
    const clean = text
      .replace(/<[^>]+>/g, ' ')
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')   // emoji blocks
      .replace(/[\u2600-\u27BF]/gu, '')           // misc symbols
      .replace(/[*_#`→←•]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) { this.isSpeaking = false; if (onDone) onDone(); return; }

    const voice  = this._selectVoice();
    const params = this._tuneParams(voice, options);

    const utterance    = new SpeechSynthesisUtterance(clean);
    utterance.voice    = voice;
    utterance.lang     = voice?.lang || 'en-IN';
    utterance.rate     = params.rate;
    utterance.pitch    = params.pitch;
    utterance.volume   = options.volume ?? 1.0;

    utterance.onend    = () => { this.isSpeaking = false; if (onDone) onDone(); };
    utterance.onerror  = () => { this.isSpeaking = false; if (onDone) onDone(); };

    this.synthesis.speak(utterance);
  },

  speakTwoParts(part1, part2, onDone = null) {
    // 750ms natural pause between reaction and question — feels human
    this.speak(part1, () => {
      setTimeout(() => this.speak(part2, onDone), 750);
    });
  },

  stopSpeaking() {
    if (this.synthesis) this.synthesis.cancel();
    this.isSpeaking = false;
  },

  speakWord(word) {
    // Very slow and clear for vocabulary pronunciation
    this.speak(word, null, { rate: 0.68, pitch: 1.05 });
  },

  // ─── Voice warm-up — call after voices load ─────────────────────────────
  /**
   * Browsers load voices asynchronously. Call this after onvoiceschanged
   * to pre-select and cache the best voice.
   */
  warmUp() {
    this._selectedVoice = null; // reset cache so it re-evaluates
    const v = this._selectVoice();
    console.log('[SpeakBuddy] Selected voice:', v ? `${v.name} (${v.lang})` : 'none — will use default');
  },

  // ─── Start Listening ───────────────────────────────────────────────
  start(onResult, onInterim, onError, onEnd) {
    if (!this.recognition && !this.init()) {
      if (onError) onError('Speech not supported in this browser. Please type your answer.');
      return;
    }
    if (this.isSpeaking) return;

    this.onResult         = onResult;
    this.onInterim        = onInterim;
    this.onError          = onError;
    this.onEnd            = onEnd;
    this.isRecording      = true;
    this._accumulatedText = '';
    this.timerSeconds     = 0;
    this.startTimer();

    try { this.recognition.start(); }
    catch (e) { console.warn('Recognition already started:', e.message); }
  },

  stop() {
    this._clearPauseTimer();
    if (this.recognition && this.isRecording) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.stopTimer();
    this.isRecording = false;
    const text = this._accumulatedText.trim();
    this._accumulatedText = '';
    if (text && this.onResult) this.onResult(text);
  },

  abort() {
    this._clearPauseTimer();
    this._accumulatedText = '';
    this.onResult  = null;
    this.onInterim = null;
    if (this.recognition) { try { this.recognition.abort(); } catch (e) {} }
    this.stopTimer();
    this.isRecording = false;
  },

  // ─── Pause timer (silence detection) ──────────────────────────────
  _resetPauseTimer() {
    this._clearPauseTimer();
    this._pauseTimer = setTimeout(() => {
      const text = this._accumulatedText.trim();
      if (text) {
        this._accumulatedText = '';
        if (this.recognition) { try { this.recognition.stop(); } catch (e) {} }
        this.isRecording = false;
        this.stopTimer();
        if (this.onResult) this.onResult(text);
      }
    }, this._pauseMs);
  },

  _clearPauseTimer() {
    if (this._pauseTimer) { clearTimeout(this._pauseTimer); this._pauseTimer = null; }
  },

  _tryRestartRecognition() {
    if (!this.isRecording) return;
    setTimeout(() => {
      if (!this.isRecording) return;
      try { this.recognition.start(); } catch (e) {}
    }, 150);
  },

  // ─── Session Timer ────────────────────────────────────────────────
  startTimer() {
    this.timerSeconds = 0;
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      if (this.timerSeconds >= 60) this.stop();
    }, 1000);
  },

  stopTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  },

  isSupported() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },
};
```

---

## 2️⃣ storage.js (3.8 KB)

Data persistence layer — manages all data in browser localStorage.

```javascript
/**
 * SpeakBuddy — Storage Manager
 * Abstraction layer for browser localStorage
 */

const Storage = {
  // ─── Parent ───────────────────────────────────────────────────────────
  saveParent(parent) {
    localStorage.setItem('speakbuddy_parent', JSON.stringify(parent));
  },
  getParent() {
    const data = localStorage.getItem('speakbuddy_parent');
    return data ? JSON.parse(data) : null;
  },

  // ─── Child ────────────────────────────────────────────────────────────
  saveChild(child) {
    localStorage.setItem('speakbuddy_child', JSON.stringify(child));
  },
  getChild() {
    const data = localStorage.getItem('speakbuddy_child');
    return data ? JSON.parse(data) : null;
  },

  isRegistered() {
    return !!this.getParent() && !!this.getChild();
  },

  // ─── Conversations ────────────────────────────────────────────────────
  saveConversation(session) {
    const conversations = this.getConversations();
    conversations.push(session);
    localStorage.setItem('speakbuddy_conversations', JSON.stringify(conversations));
  },
  getConversations() {
    const data = localStorage.getItem('speakbuddy_conversations');
    return data ? JSON.parse(data) : [];
  },
  getRecentConversations(limit = 10) {
    return this.getConversations().slice(-limit).reverse();
  },
  getTotalConversations() {
    return this.getConversations().length;
  },

  // ─── Progress ─────────────────────────────────────────────────────────
  saveProgress(entry) {
    const today = new Date().toISOString().split('T')[0];
    const progress = this.getAllProgress();
    const existing = progress.findIndex(p => p.date === today);
    if (existing >= 0) {
      progress[existing] = { ...progress[existing], date: today, ...entry };
    } else {
      progress.push({ ...entry, date: today });
    }
    localStorage.setItem('speakbuddy_progress', JSON.stringify(progress));
  },
  getAllProgress() {
    const data = localStorage.getItem('speakbuddy_progress');
    return data ? JSON.parse(data) : [];
  },
  getTodayProgress() {
    const today = new Date().toISOString().split('T')[0];
    const all = this.getAllProgress();
    return all.find(p => p.date === today) || {};
  },
  getWeeklyProgress() {
    const all = this.getAllProgress();
    const week = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const todayIdx = (today.getDay() + 6) % 7;

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (todayIdx - i));
      const dateStr = date.toISOString().split('T')[0];
      const entry = all.find(p => p.date === dateStr);
      week.push({
        day: dayNames[i][0],
        speakingTimeSeconds: entry?.speakingTimeSeconds || 0,
        conversationsCount: entry?.conversationsCount || 0,
        totalWords: entry?.totalWords || 0,
      });
    }
    return week;
  },

  // ─── Streak ───────────────────────────────────────────────────────────
  updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const streak = this.getStreak();
    if (streak.activeDays?.includes(today)) return; // Already counted today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const isConsecutive = streak.activeDays?.includes(yesterdayStr);
    const newStreak = isConsecutive ? (streak.currentStreak || 0) + 1 : 1;

    const activeDays = streak.activeDays || [];
    if (!activeDays.includes(today)) activeDays.push(today);

    const newStreak$ = {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak || 0),
      activeDays: activeDays.slice(-60), // Keep last 60 days
    };
    localStorage.setItem('speakbuddy_streak', JSON.stringify(newStreak$));
  },
  getStreak() {
    const data = localStorage.getItem('speakbuddy_streak');
    return data ? JSON.parse(data) : { currentStreak: 0, longestStreak: 0, activeDays: [] };
  },

  // ─── Vocabulary ───────────────────────────────────────────────────────
  addVocabulary(word, context) {
    const vocab = this.getVocabulary();
    const existing = vocab.find(v => v.word === word);
    if (existing) {
      existing.mastery = Math.min((existing.mastery || 1) + 1, 5);
      existing.learnedAt = Math.min(existing.learnedAt, Date.now());
    } else {
      vocab.push({
        word,
        context,
        mastery: 1,
        learnedAt: Date.now(),
      });
    }
    localStorage.setItem('speakbuddy_vocabulary', JSON.stringify(vocab));
  },
  getVocabulary() {
    const data = localStorage.getItem('speakbuddy_vocabulary');
    return data ? JSON.parse(data) : [];
  },
  getVocabularyCount() {
    return this.getVocabulary().length;
  },

  // ─── Total Word Count ─────────────────────────────────────────────────
  getTotalWordCount() {
    const progress = this.getAllProgress();
    return progress.reduce((sum, p) => sum + (p.totalWords || 0), 0);
  },

  // ─── Total Speaking Time ──────────────────────────────────────────────
  getTotalSpeakingTime() {
    const progress = this.getAllProgress();
    return progress.reduce((sum, p) => sum + (p.speakingTimeSeconds || 0), 0);
  },

  // ─── Average Scores ───────────────────────────────────────────────────
  getAverageScores() {
    const progress = this.getAllProgress();
    if (!progress.length) return { grammar: 0, vocab: 0, fluency: 0, creativity: 0 };
    const avg = (key) => progress.reduce((sum, p) => sum + (p[key] || 0), 0) / progress.length;
    return {
      grammar: avg('avgGrammar'),
      vocab: avg('avgVocab'),
      fluency: avg('avgFluency'),
      creativity: avg('avgCreativity'),
    };
  },

  // ─── Memories ─────────────────────────────────────────────────────────
  saveMemory(memory) {
    const memories = this.getMemories();
    const existing = memories.find(m => m.content === memory.content);
    if (!existing) memories.push(memory);
    localStorage.setItem('speakbuddy_memories', JSON.stringify(memories.slice(-20))); // Keep last 20
  },
  getMemories(type = null) {
    const data = localStorage.getItem('speakbuddy_memories');
    const all = data ? JSON.parse(data) : [];
    return type ? all.filter(m => m.type === type) : all;
  },

  // ─── Settings ──────────────────────────────────────────────────────────
  saveSettings(settings) {
    localStorage.setItem('speakbuddy_settings', JSON.stringify(settings));
  },
  getSettings() {
    const data = localStorage.getItem('speakbuddy_settings');
    return data ? JSON.parse(data) : { buddyVoice: true };
  },

  // ─── Clear All ─────────────────────────────────────────────────────────
  clearAll() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('speakbuddy_'));
    keys.forEach(k => localStorage.removeItem(k));
  },
};
```

---

## 3️⃣ ai-engine.js (Abridged)

Rule-based AI analysis + local fallback conversation engine. Due to length, showing key sections:

**Key method signatures:**
```javascript
AIEngine.analyzeSpeech(text, level) → AnalysisResult
AIEngine.generateFeedback(text, analysis, level) → Feedback
AIEngine.generateContextualResponse(text, analysis, child, mode, history, context) → Response
AIEngine.detectTopicLocal(text) → String (topic name)
AIEngine.extractMemories(text, child) → Memory[]
AIEngine.checkLevelUp(child) → Number (new level) or null
AIEngine.getLevelProgress(child) → Number (0–100%)
```

**Topic detection database (15+ topics):**
```javascript
topicFollowUps: {
  cricket: ["Who do you play with?", "What position?", ...],
  dogs: ["Dog's name?", "Games you play?", ...],
  school: ["Favourite subject?", ...],
  // ... etc
}
```

[Full code available in `/js/ai-engine.js`]

---

## 4️⃣ claude-ai.js

Claude API wrapper for contextual conversation generation.

**Key methods:**
```javascript
ClaudeAI.getApiKey() → String
ClaudeAI.saveApiKey(key)
ClaudeAI.removeApiKey()
ClaudeAI.isConfigured() → Boolean

ClaudeAI.buildSystemPrompt(child, mode, context) → String
  // Dynamically builds system prompt including child profile, level, mode, context

ClaudeAI.generateMentorResponse(childText, analysis, child, mode, history, context) → Response
  // Calls Claude API, returns { reaction, followUpQuestion, topicDetected, ... }

ClaudeAI.generateOpeningGreeting(child, mode) → String
  // First message of conversation

ClaudeAI.generateSessionSummary(child, mode, messages, scores, duration) → Summary
  // End-of-session report

ClaudeAI.testConnection() → { ok: Boolean, error?: String }
```

**System prompt template (includes context):**
```
You are Priya — warm, patient AI mentor for Indian children.

CURRENT CONVERSATION CONTEXT:
- Current topic: cricket
- Entities heard: friend, park
- Turns on this topic: 2
- Should change topic after turn: 5

CONVERSATIONAL RULES:
1. STAY ON TOPIC — ask about what child JUST said
2. DEEP DIVE 3–6 turns per topic
3. NATURAL TRANSITIONS — use child's own words as bridge
4. SHORT REACTIONS — one sentence max, then one follow-up question
5. ADAPT TO LEVEL — simpler for Level 1, more complex for Level 4
6. TONE — warm, encouraging, Indian English

MODE CONTEXT: [Mode-specific instructions]

RESPONSE FORMAT (JSON ONLY):
{
  "reaction": "...",
  "followUpQuestion": "...",
  "topicDetected": "...",
  "entitiesDetected": ["..."],
  "shouldChangeTopic": false,
  "correction": null
}
```

[Full code available in `/js/claude-ai.js`]

---

## 5️⃣ prompts.js (200+ Prompts)

Conversation prompt database — 50 prompts per level (1–4) × 5 modes.

**Structure:**
```javascript
Prompts.MODE_INFO = {
  daily_chat: { name: 'Daily Chat', icon: '💬', color: '#6C5CE7' },
  story_builder: { name: 'Story Builder', icon: '📖', color: '#FF9FF3' },
  role_play: { name: 'Role Play', icon: '🎭', color: '#48DBFB' },
  vocabulary_quest: { name: 'Vocab Quest', icon: '🏆', color: '#FECA57' },
  opinion_mode: { name: 'Share Ideas', icon: '🤔', color: '#FF6B6B' },
}

Prompts.database = {
  1: {  // Level 1 — Beginner
    daily_chat: ["What is your name?", "How old are you?", ...],
    story_builder: ["Once upon a time, there was a little cat...", ...],
    ...
  },
  2: { ... },  // Level 2
  3: { ... },  // Level 3
  4: { ... },  // Level 4
}

// Methods:
Prompts.getPrompt(level, mode) → String
Prompts.getUniquePrompt(level, mode, usedList) → String
Prompts.getPersonalizedPrompt(child, mode) → String
Prompts.getGreeting(child) → String
```

[Full prompt database available in `/js/prompts.js` — 200+ entries]

---

## 6️⃣ badges.js

Gamification system — 50 badges, XP tiers, achievements.

**Key methods:**
```javascript
Badges.checkAndAward() → Badge[]
Badges.checkLongAnswer(wordCount) → Badge|null
Badges.getSummary() → { xpLevel, earned, total, xp, recent }
Badges.getEarned() → Badge[]

Badges.ALL = [
  { id: 'first_chat', name: 'First Chat', category: 'milestone', emoji: '🎤', xp: 50, ... },
  { id: '7day_streak', name: '7-Day Streak', category: 'streak', emoji: '🔥', xp: 100, ... },
  // ... 50+ badges
]
```

[Full code available in `/js/badges.js`]

---

## 7️⃣ daily-learning.js

Word of the Day, Daily Challenge system.

**Key methods:**
```javascript
DailyLearning.getWordOfDay() → { word, meaning, example, emoji }
DailyLearning.getDailyChallenge() → { mode, title, desc, icon, xp }
DailyLearning.isChallengeComplete() → Boolean
DailyLearning.markChallengeComplete()
```

---

## 8️⃣ app.js (Excerpt)

Main application controller — 1000+ lines. Shows key flow:

```javascript
const App = {
  // ─── INITIALIZATION ───────────────────────────────────────────────
  init() {
    // Auto-route to home or welcome based on registration
    if (Storage.isRegistered()) {
      this.showScreen('home-screen');
    } else {
      this.showScreen('welcome-screen');
    }
    // Initialize voice synthesis voices
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => Speech.warmUp();
    }
  },

  // ─── SEAMLESS CONVERSATION LOOP ───────────────────────────────────
  async startChat(mode) {
    // 1. Initialize session & context
    this.currentSession = { mode, messages: [], analysisScores: [] };
    this.conversationContext = { currentTopic: null, entities: [], turnsOnTopic: 0 };

    // 2. Get opening message (Claude or Prompts)
    let openingText = await ClaudeAI.generateOpeningGreeting(child, mode);
    if (!openingText) openingText = Prompts.getGreeting(child) + "\n\n" + Prompts.getPrompt(child.currentLevel, mode);

    // 3. Add message to chat
    this.addMentorMessage(openingText);

    // 4. Speak question
    this.setMicState('buddy-speaking');
    Speech.speak(questionPart, () => {
      if (this.conversationActive) this.startListening();  // Auto-listen
    });
  },

  async processChildInput(text) {
    // 1. Show child's message
    this.addChildMessage(text);

    // 2. Analyze speech
    const analysis = AIEngine.analyzeSpeech(text, child.currentLevel);
    this.currentSession.analysisScores.push(analysis);

    // 3. Get AI response (Claude first, fallback to local)
    let response = null;
    if (ClaudeAI.isConfigured()) {
      response = await ClaudeAI.generateMentorResponse(
        text, analysis, child, this.currentMode,
        this.currentSession.messages, this.conversationContext
      );
    }
    if (!response) {
      const local = AIEngine.generateContextualResponse(...);
      response = { ...local, source: 'local' };
    }

    // 4. Update conversation context
    if (response.topicDetected !== this.conversationContext.currentTopic) {
      this.conversationContext.currentTopic = response.topicDetected;
      this.conversationContext.turnsOnTopic = 1;
    } else {
      this.conversationContext.turnsOnTopic++;
    }

    // 5. Show Priya's response (reaction + correction + question)
    this.addMentorMessage(response.reaction);
    if (response.feedback?.correction) this.addCorrectionChip(response.feedback.correction);
    this.addMentorMessage(response.followUpQuestion);

    // 6. Speak naturally (reaction → 750ms → question → auto-listen)
    this.setMicState('buddy-speaking');
    Speech.speakTwoParts(response.reaction, response.followUpQuestion, () => {
      if (this.conversationActive) this.startListening();  // Loop repeats
    });
  },

  async endChat() {
    // 1. Stop voice loop
    this.stopConversationLoop();

    // 2. Save conversation & compute scores
    Storage.saveConversation(this.currentSession);
    Storage.saveProgress({ ...averages });

    // 3. Generate session summary (Claude or local)
    let summary = await ClaudeAI.generateSessionSummary(...);
    if (!summary) summary = { /* local fallback */ };

    // 4. Show beautiful report modal
    this.showSessionReport(child, summary);

    // 5. Speak summary aloud
    Speech.speak(summary.spokenSummary);
  },

  // ... 50+ more methods for UI, navigation, animations, etc.
};
```

---

## Summary: Migration Checklist

| Component | File | Size | Complexity | Android Equivalent |
|-----------|------|------|------------|-------------------|
| Voice I/O | speech.js | 4.2KB | Medium | SpeechManager.kt (SpeechRecognizer + TextToSpeech) |
| Data Store | storage.js | 3.8KB | Low | DataRepository.kt (Room + SharedPreferences) |
| AI Analysis | ai-engine.js | 8.5KB | Medium | AIEngine.kt (copy logic) |
| Claude API | claude-ai.js | 7.2KB | Medium | ClaudeAIManager.kt (Retrofit + Coroutines) |
| Prompts | prompts.js | 4.1KB | Low | PromptsDatabase.kt (data structures) |
| Badges | badges.js | 2.8KB | Low | BadgesManager.kt |
| Daily Learning | daily-learning.js | 1.2KB | Low | DailyLearningManager.kt |
| Main Controller | app.js | 30KB | HIGH | ChatViewModel.kt + 10 @Composables |

**Total LOC to migrate**: ~1200 lines of logic + ~800 lines of UI → ~3000 lines of Kotlin + Compose

---

*Last updated: March 30, 2026*
*Ready for Android implementation*
