/**
 * SpeakBuddy — Main Application Controller v5
 *
 * KEY FEATURES:
 * 1. Pure seamless voice conversation — Buddy talks like a real person (no feedback cards mid-chat)
 * 2. Session timer in chat header
 * 3. Beautiful end-of-session report card when student ends chat
 * 4. Indian female voice (Priya/Veena)
 * 5. Grammar corrections shown as tiny chips only — never interrupt spoken flow
 */

const App = {
  // ─── State ────────────────────────────────────────────────────────────────
  currentScreen:      'splash-screen',
  currentMode:        'daily_chat',
  registerStep:       1,
  selectedAvatar:     '🦊',
  selectedInterests:  [],
  currentSession:     null,
  isProcessing:       false,
  conversationActive: false,
  interimMsgId:       null,

  // Topic-tracking context — passed to Claude every turn so it stays on the same subject
  conversationContext: null,

  // Timer
  sessionTimerInterval: null,
  sessionSeconds:       0,

  // ─── Boot ─────────────────────────────────────────────────────────────────
  init() {
    setTimeout(() => {
      if (Storage.isRegistered()) {
        this.showScreen('home-screen');
        document.getElementById('bottom-nav').style.display = 'flex';
      } else {
        this.showScreen('welcome-screen');
      }
    }, 2200);

    document.querySelectorAll('.interest-tag').forEach(btn =>
      btn.addEventListener('click', () => this.toggleInterest(btn))
    );

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => Speech.init();
      window.speechSynthesis.getVoices();
    }

    this.updateAIBadge();
  },

  updateAIBadge() {
    const badge = document.getElementById('ai-status-badge');
    if (!badge) return;
    badge.textContent = ClaudeAI.isConfigured() ? '✨ Claude AI' : '⚡ Smart Mode';
    badge.className   = ClaudeAI.isConfigured() ? 'ai-badge ai-badge-on' : 'ai-badge ai-badge-off';
  },

  // ─── Screen Navigation ────────────────────────────────────────────────────
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      // Reset scroll position completely
      window.scrollTo(0, 0);
      target.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    this.currentScreen = screenId;

    const navScreens = ['home-screen','progress-screen','dashboard-screen','settings-screen','badges-screen'];
    const nav = document.getElementById('bottom-nav');
    if (nav) nav.style.display = navScreens.includes(screenId) ? 'flex' : 'none';

    document.querySelectorAll('.nav-item').forEach(item =>
      item.classList.toggle('active', item.dataset.screen === screenId)
    );

    ({
      'home-screen':      () => this.setupHome(),
      'progress-screen':  () => this.setupProgress(),
      'dashboard-screen': () => this.setupDashboard(),
      'settings-screen':  () => this.setupSettings(),
      'badges-screen':    () => this.setupBadges(),
    })[screenId]?.();
  },

  navigate(btn) { if (btn.dataset.screen) this.showScreen(btn.dataset.screen); },

  // ─── Auth ─────────────────────────────────────────────────────────────────
  handleLogin() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (!email || !password) { this.showToast('Please enter email and password.', 'error'); return; }
    const parent = Storage.getParent();
    if (!parent || parent.email !== email || parent.password !== password) {
      this.showToast('Incorrect email or password.', 'error'); return;
    }
    this.showScreen('home-screen');
    document.getElementById('bottom-nav').style.display = 'flex';
    this.showToast('Welcome back!');
  },

  logout() {
    this.stopConversationLoop();
    this.stopSessionTimer();
    this.showScreen('welcome-screen');
    document.getElementById('bottom-nav').style.display = 'none';
    this.showToast('See you soon! 👋');
  },

  // ─── Registration ─────────────────────────────────────────────────────────
  nextRegisterStep() {
    if (this.registerStep === 1) {
      const name = document.getElementById('reg-parent-name').value.trim();
      const email = document.getElementById('reg-parent-email').value.trim();
      const password = document.getElementById('reg-parent-password').value.trim();
      if (!name || !email || !password) { this.showToast('Please fill in all fields.', 'error'); return; }
      if (password.length < 6) { this.showToast('Password must be at least 6 characters.', 'error'); return; }
    }
    if (this.registerStep === 2) {
      const childName = document.getElementById('reg-child-name').value.trim();
      const age = document.getElementById('reg-child-age').value;
      const cls = document.getElementById('reg-child-class').value;
      if (!childName || !age || !cls) { this.showToast("Please fill in your child's details.", 'error'); return; }
    }
    if (this.registerStep < 3) {
      document.getElementById(`register-step-${this.registerStep}`).classList.remove('active');
      this.registerStep++;
      document.getElementById(`register-step-${this.registerStep}`).classList.add('active');
      this.updateProgressDots();
    }
  },

  prevRegisterStep() {
    if (this.registerStep > 1) {
      document.getElementById(`register-step-${this.registerStep}`).classList.remove('active');
      this.registerStep--;
      document.getElementById(`register-step-${this.registerStep}`).classList.add('active');
      this.updateProgressDots();
    } else { this.showScreen('welcome-screen'); }
  },

  handleRegisterBack() {
    this.registerStep === 1 ? this.showScreen('welcome-screen') : this.prevRegisterStep();
  },

  updateProgressDots() {
    document.querySelectorAll('.progress-dot').forEach((dot, i) =>
      dot.classList.toggle('active', i < this.registerStep)
    );
  },

  toggleInterest(btn) {
    const interest = btn.dataset.interest;
    if (this.selectedInterests.includes(interest)) {
      this.selectedInterests = this.selectedInterests.filter(i => i !== interest);
      btn.classList.remove('selected');
    } else {
      this.selectedInterests.push(interest);
      btn.classList.add('selected');
    }
  },

  selectAvatar(el) {
    document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
    el.classList.add('selected');
    this.selectedAvatar = el.dataset.avatar;
  },

  completeRegistration() {
    if (this.selectedInterests.length < 3) { this.showToast('Please pick at least 3 interests!', 'error'); return; }
    Storage.saveParent({
      name:      document.getElementById('reg-parent-name').value.trim(),
      email:     document.getElementById('reg-parent-email').value.trim(),
      password:  document.getElementById('reg-parent-password').value.trim(),
      createdAt: new Date().toISOString(),
    });
    Storage.saveChild({
      name:         document.getElementById('reg-child-name').value.trim(),
      age:          parseInt(document.getElementById('reg-child-age').value),
      class:        document.getElementById('reg-child-class').value,
      school:       document.getElementById('reg-child-school').value.trim() || 'My School',
      city:         document.getElementById('reg-child-city').value.trim() || 'India',
      interests:    this.selectedInterests,
      avatar:       this.selectedAvatar,
      currentLevel: 1,
      createdAt:    new Date().toISOString(),
    });
    this.showConfetti();
    this.showToast('Welcome to SpeakBuddy! 🎉');
    setTimeout(() => {
      this.showScreen('home-screen');
      document.getElementById('bottom-nav').style.display = 'flex';
    }, 1200);
  },

  // ─── Home Screen ──────────────────────────────────────────────────────────
  setupHome() {
    const child = Storage.getChild();
    if (!child) return;

    const hour     = new Date().getHours();
    const greet    = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const greetMsg = hour < 12 ? 'Ready to start learning? ☀️' :
                     hour < 17 ? 'Time for some English fun! 🌈' : 'Evening practice time! 🌙';

    document.getElementById('home-avatar').textContent        = child.avatar || '🦊';
    document.getElementById('home-greeting-name').textContent = `${greet}, ${child.name}!`;
    document.getElementById('home-greeting-msg').textContent  = greetMsg;

    const streak = Storage.getStreak();
    document.getElementById('stat-streak').textContent = streak.currentStreak;
    document.getElementById('stat-words').textContent  = Storage.getTotalWordCount();
    document.getElementById('stat-level').textContent  = child.currentLevel || 1;

    this.renderStreakDays(streak);
    this.renderWordOfDay();
    this.renderDailyChallenge();
    this.renderRecentActivity();
    this.updateAIBadge();
  },

  renderStreakDays(streak) {
    const el = document.getElementById('streak-days');
    if (!el) return;
    const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const today    = new Date();
    const todayIdx = (today.getDay() + 6) % 7;
    el.innerHTML = dayNames.map((d, i) => {
      const date    = new Date(today);
      date.setDate(today.getDate() - (todayIdx - i));
      const dateStr = date.toISOString().split('T')[0];
      const active  = streak.activeDays?.includes(dateStr);
      const isToday = i === todayIdx;
      return `<div class="streak-day${active?' active':''}${isToday?' today':''}">${d[0]}</div>`;
    }).join('');
    document.getElementById('streak-title').textContent    = streak.currentStreak >= 1 ? `${streak.currentStreak} Day Streak! 🔥` : 'Start Your Streak!';
    document.getElementById('streak-subtitle').textContent = streak.currentStreak >= 1 ? 'Ekdum perfect! Keep going!' : 'Practice today to begin!';
  },

  renderWordOfDay() {
    const el = document.getElementById('word-of-day');
    if (!el) return;
    const word = DailyLearning.getWordOfDay();
    el.innerHTML = `
      <div class="wod-header"><span class="wod-label">📖 Word of the Day</span><span class="wod-emoji">${word.emoji}</span></div>
      <div class="wod-word">${word.word}</div>
      <div class="wod-meaning">${word.meaning}</div>
      <div class="wod-example">"${word.example}"</div>
      <button class="wod-speak-btn" onclick="Speech.speakWord('${word.word}')">🔊 Hear it</button>`;
  },

  renderDailyChallenge() {
    const el   = document.getElementById('daily-challenge');
    if (!el) return;
    const ch   = DailyLearning.getDailyChallenge();
    const done = DailyLearning.isChallengeComplete();
    el.innerHTML = `
      <div class="challenge-header"><span class="challenge-label">⚡ Daily Challenge</span><span class="challenge-xp">+${ch.xp} XP</span></div>
      <div class="challenge-content${done?' challenge-done':''}">
        <span class="challenge-icon">${ch.icon}</span>
        <div class="challenge-info"><div class="challenge-title">${ch.title}</div><div class="challenge-desc">${ch.desc}</div></div>
        ${done ? '<span class="challenge-check">✅</span>' : `<button class="challenge-btn" onclick="App.startChat('${ch.mode||'daily_chat'}')">Go!</button>`}
      </div>`;
  },

  renderRecentActivity() {
    const el = document.getElementById('recent-activity');
    if (!el) return;
    const convos = Storage.getRecentConversations(3);
    if (!convos.length) {
      el.innerHTML = `<div class="empty-state" style="padding:var(--space-xl);">
        <div style="font-size:40px;margin-bottom:var(--space-sm);">🎤</div>
        <p style="font-size:var(--font-size-sm);">No conversations yet. Start talking!</p>
      </div>`;
      return;
    }
    el.innerHTML = convos.map(c => {
      const m   = Prompts.MODE_INFO[c.mode] || { name: 'Chat', icon: '💬' };
      const d   = new Date(c.startedAt).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' });
      const dur = c.durationSeconds ? `${Math.round(c.durationSeconds / 60)}m` : '';
      return `<div class="history-item" onclick="App.startChat('${c.mode}')">
        <div class="history-item-icon">${m.icon}</div>
        <div class="history-item-info">
          <div class="history-item-title">${m.name}</div>
          <div class="history-item-meta">${d}${dur?' · '+dur:''}</div>
        </div>
        <div style="color:var(--color-text-secondary);">→</div>
      </div>`;
    }).join('');
  },

  // ══════════════════════════════════════════════════════════════════
  //  SESSION TIMER
  // ══════════════════════════════════════════════════════════════════

  startSessionTimer() {
    this.sessionSeconds = 0;
    this.updateTimerDisplay();
    this.sessionTimerInterval = setInterval(() => {
      this.sessionSeconds++;
      this.updateTimerDisplay();
    }, 1000);
  },

  stopSessionTimer() {
    if (this.sessionTimerInterval) {
      clearInterval(this.sessionTimerInterval);
      this.sessionTimerInterval = null;
    }
  },

  updateTimerDisplay() {
    const el = document.getElementById('session-timer');
    if (!el) return;
    const m = Math.floor(this.sessionSeconds / 60);
    const s = this.sessionSeconds % 60;
    el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  },

  // ══════════════════════════════════════════════════════════════════
  //  SEAMLESS CONVERSATION ENGINE
  // ══════════════════════════════════════════════════════════════════

  async startChat(mode) {
    this.currentMode        = mode || 'daily_chat';
    this.conversationActive = true;
    this.isProcessing       = false;
    this.interimMsgId       = null;

    const modeInfo = Prompts.MODE_INFO[this.currentMode] || { name: 'Chat', icon: '💬' };
    const child    = Storage.getChild();

    this.currentSession = {
      id:             Date.now().toString(),
      mode:           this.currentMode,
      startedAt:      new Date().toISOString(),
      messages:       [],
      wordCount:      0,
      analysisScores: [],
    };

    // Reset topic-tracking context for each new session
    this.conversationContext = {
      currentTopic:    null,
      entities:        [],
      turnsOnTopic:    0,
      topicChangeTurn: Math.floor(Math.random() * 3) + 3, // 3–5 turns per topic
    };

    // Setup chat UI
    const label = document.getElementById('chat-mode-label');
    if (label) label.textContent = modeInfo.icon + ' ' + modeInfo.name;

    const avatarEl = document.getElementById('chat-mentor-avatar-el');
    if (avatarEl && child) avatarEl.textContent = child.avatar || '🦊';

    document.getElementById('chat-messages').innerHTML = '';
    this.showScreen('chat-screen');
    document.getElementById('bottom-nav').style.display = 'none';

    if (!child) return;

    this.startSessionTimer();
    this.setMicState('buddy-thinking');

    // Get opening message
    const typingId = this.addTypingIndicator();
    let openingText = null;
    if (ClaudeAI.isConfigured()) {
      openingText = await ClaudeAI.generateOpeningGreeting(child, this.currentMode);
    }
    this.removeTypingIndicator(typingId);

    if (!openingText) {
      const greeting = Prompts.getGreeting(child);
      const question = Prompts.getUniquePrompt(child.currentLevel || 1, this.currentMode, []);
      openingText    = `${greeting}\n\n${question}`;
    }

    this.addMentorMessage(openingText);
    this.currentSession.messages.push({ role: 'mentor', content: openingText, timestamp: new Date().toISOString() });

    // Speak, then auto-listen
    const lines = openingText.split('\n\n');
    const questionPart = lines[lines.length - 1] || openingText;
    this.setMicState('buddy-speaking');
    Speech.speak(questionPart, () => {
      if (this.conversationActive) this.startListening();
    });
  },

  // ─── Listening ────────────────────────────────────────────────────────────
  startListening() {
    if (!this.conversationActive || this.isProcessing) return;
    if (!Speech.isSupported()) return;

    this.setMicState('listening');
    Speech.start(
      (transcript) => {
        this.removeInterimMessage();
        if (transcript.trim() && this.conversationActive) {
          this.processChildInput(transcript.trim());
        } else if (this.conversationActive) {
          setTimeout(() => this.startListening(), 400);
        }
      },
      (interim) => this.updateInterimMessage(interim),
      (errMsg) => {
        this.removeInterimMessage();
        if (errMsg) this.showChatStatus(errMsg, 'error');
        if (this.conversationActive && !this.isProcessing) {
          setTimeout(() => this.startListening(), 1500);
        }
      },
      () => this.setMicState('idle')
    );
  },

  stopConversationLoop() {
    this.conversationActive = false;
    this.isProcessing       = false;
    Speech.abort();
    Speech.stopSpeaking();
    this.removeInterimMessage();
    this.setMicState('idle');
  },

  // ─── Mic states ───────────────────────────────────────────────────────────
  setMicState(state) {
    const btn    = document.getElementById('voice-record-btn');
    const status = document.getElementById('chat-status-bar');
    if (!btn) return;

    btn.className = 'voice-record-btn state-' + state;

    const labels = {
      'idle':           '',
      'listening':      '🎤 Listening...',
      'buddy-speaking': '🔊 Priya is speaking...',
      'buddy-thinking': '⏳ Thinking...',
    };
    const icons = { 'idle':'🎤', 'listening':'⏹', 'buddy-speaking':'🔊', 'buddy-thinking':'⏳' };

    if (status) {
      status.textContent = labels[state] || '';
      status.className   = 'chat-status-bar' + (labels[state] ? ' visible' : '');
    }
    btn.textContent = icons[state] || '🎤';
  },

  updateInterimMessage(text) {
    const c = document.getElementById('chat-messages');
    if (!c) return;
    if (!this.interimMsgId) {
      const id  = 'interim-' + Date.now();
      const div = document.createElement('div');
      div.className = 'message message-child message-interim';
      div.id        = id;
      div.innerHTML = `<div class="message-bubble interim-bubble">${this.escapeHtml(text)}</div>`;
      c.appendChild(div);
      this.interimMsgId = id;
    } else {
      const el = document.getElementById(this.interimMsgId);
      if (el) el.querySelector('.message-bubble').textContent = text;
    }
    this.scrollToBottom();
  },

  removeInterimMessage() {
    if (this.interimMsgId) { document.getElementById(this.interimMsgId)?.remove(); this.interimMsgId = null; }
  },

  toggleMic() {
    if (Speech.isRecording) {
      Speech.stop(); this.setMicState('idle');
    } else if (Speech.isSpeaking) {
      Speech.stopSpeaking();
      if (this.conversationActive) setTimeout(() => this.startListening(), 200);
    } else {
      this.startListening();
    }
  },

  sendTextMessage() {
    const input = document.getElementById('chat-text-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    Speech.abort();
    this.removeInterimMessage();
    this.processChildInput(text);
  },

  // ─── Core AI Pipeline — NATURAL CONVERSATION (no feedback cards) ──────────
  async processChildInput(text) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.setMicState('buddy-thinking');

    const child = Storage.getChild();
    if (!child) { this.isProcessing = false; return; }

    // Show what kid said
    this.addChildMessage(text);
    this.currentSession.messages.push({ role: 'child', content: text, timestamp: new Date().toISOString() });
    this.currentSession.wordCount += text.split(/\s+/).filter(w => w.length > 0).length;

    // Analyse
    const analysis = AIEngine.analyzeSpeech(text, child.currentLevel || 1);
    this.currentSession.analysisScores.push(analysis);
    analysis.vocabulary.newWords?.forEach(w => Storage.addVocabulary(w, text));
    AIEngine.extractMemories(text, child).forEach(m => Storage.saveMemory(m));
    const longBadge = Badges.checkLongAnswer(text.split(/\s+/).length);
    if (longBadge) setTimeout(() => this.showBadgeToast(longBadge), 500);

    // Typing dots
    const typingId = this.addTypingIndicator();

    // Get AI response — pass conversation context so Claude stays on topic
    let response = null;
    if (ClaudeAI.isConfigured()) {
      response = await ClaudeAI.generateMentorResponse(
        text, analysis, child, this.currentMode,
        this.currentSession.messages, this.conversationContext
      );
    }
    if (!response) {
      await this.delay(400 + Math.random() * 400);
      const local = AIEngine.generateContextualResponse(
        text, analysis, child, this.currentMode,
        this.currentSession.messages, this.conversationContext
      );
      response = { ...local, reaction: local.feedback.title, source: 'local' };
    }

    // Update conversation context from Claude's response
    if (response && this.conversationContext) {
      const topicNew = response.topicDetected;
      const ctx      = this.conversationContext;

      if (topicNew && topicNew !== ctx.currentTopic) {
        // New topic detected — reset turn counter
        ctx.currentTopic    = topicNew;
        ctx.entities        = response.entitiesDetected || [];
        ctx.turnsOnTopic    = 1;
        ctx.topicChangeTurn = Math.floor(Math.random() * 3) + 3; // stay 3–5 turns
      } else {
        // Same topic — increment turns and merge any new entities
        ctx.turnsOnTopic++;
        if (response.entitiesDetected?.length) {
          ctx.entities = [...new Set([...ctx.entities, ...response.entitiesDetected])].slice(0, 10);
        }
      }
    }

    this.removeTypingIndicator(typingId);

    // ── NATURAL RESPONSE: reaction + optional gentle correction + question ──────
    let reaction  = response.reaction || response.feedback?.title || 'Very good!';
    const question  = response.followUpQuestion;

    // If there's an error correction, gently model the correct usage in the response
    if (response.correctionIntegration) {
      const correction = response.correctionIntegration;
      // Add a gentle hint that models the correct form naturally
      const modeledCorrection = `${reaction} So you like ${correction.correction}.`;
      this.addMentorMessage(modeledCorrection);
      reaction = modeledCorrection; // Update for speech
    } else {
      // Show chat bubble for reaction
      this.addMentorMessage(reaction);
    }

    // Tiny correction chip (visual only, optional, NOT spoken)
    if (response.feedback?.correction && response.feedback?.correction?.gentle) {
      // Only show if it's marked as gentle - helps reinforce learning
      setTimeout(() => this.addCorrectionChip(response.feedback.correction), 800);
    }

    this.addMentorMessage(question);

    this.currentSession.messages.push({
      role: 'mentor',
      content: reaction,
      followUpQuestion: question,
      timestamp: new Date().toISOString(),
    });

    // Speak naturally: reaction → pause → question → auto-listen
    this.setMicState('buddy-speaking');
    Speech.speakTwoParts(reaction, question, () => {
      this.isProcessing = false;
      if (this.conversationActive) setTimeout(() => this.startListening(), 350);
    });

    // Level-up check
    const newLevel = AIEngine.checkLevelUp(child);
    if (newLevel && newLevel > (child.currentLevel || 1)) {
      child.currentLevel = newLevel;
      Storage.saveChild(child);
      setTimeout(() => this.showLevelUp(newLevel), 2500);
    }
  },

  // Tiny visual correction chip — doesn't interrupt conversation
  addCorrectionChip(correction) {
    const c = document.getElementById('chat-messages');
    if (!c) return;
    const div = document.createElement('div');
    div.className = 'message message-mentor';
    div.innerHTML = `
      <div class="message-avatar priya-avatar">👩‍🏫</div>
      <div class="correction-chip">
        <span class="correction-chip-label">💡 Quick tip</span>
        <div class="correction-chip-original">You said: <em>"${this.escapeHtml(correction.original)}"</em></div>
        <div class="correction-chip-better">Try: <strong>"${this.escapeHtml(correction.corrected)}"</strong></div>
      </div>`;
    c.appendChild(div);
    this.scrollToBottom();
  },

  // ══════════════════════════════════════════════════════════════════
  //  END CHAT → SESSION REPORT CARD
  // ══════════════════════════════════════════════════════════════════

  async endChat() {
    this.stopConversationLoop();
    this.stopSessionTimer();

    const session = this.currentSession;
    if (!session || session.messages.length < 2) {
      this.showScreen('home-screen');
      document.getElementById('bottom-nav').style.display = 'flex';
      return;
    }

    const child  = Storage.getChild();
    const durSec = Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000);

    // Save progress
    Storage.saveConversation({ ...session, endedAt: new Date().toISOString(), durationSeconds: durSec });

    if (session.analysisScores.length > 0) {
      const avg    = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
      const scores = session.analysisScores;
      const today  = Storage.getTodayProgress();
      Storage.saveProgress({
        conversationsCount:  (today.conversationsCount  || 0) + 1,
        totalWords:          (today.totalWords          || 0) + session.wordCount,
        speakingTimeSeconds: (today.speakingTimeSeconds || 0) + durSec,
        avgGrammar:    avg(scores.map(s => s.grammar.score)),
        avgVocab:      avg(scores.map(s => s.vocabulary.score)),
        avgFluency:    avg(scores.map(s => s.fluency.score)),
        avgCreativity: avg(scores.map(s => s.creativity.score)),
      });
      Storage.updateStreak();

      const newBadges = Badges.checkAndAward();
      newBadges.forEach(b => setTimeout(() => this.showBadgeToast(b), 2500));

      const ch = DailyLearning.getDailyChallenge();
      if (!DailyLearning.isChallengeComplete() && (!ch.mode || ch.mode === session.mode)) {
        DailyLearning.markChallengeComplete();
      }
    }

    // Show the report card
    await this.showSessionReport(child, session, durSec);
  },

  // ─── Session Report Card ─────────────────────────────────────────────────
  async showSessionReport(child, session, durSec) {
    const modal = document.getElementById('session-report-modal');
    const backdrop = document.getElementById('session-report-backdrop');
    if (!modal) {
      // Fallback: just go home
      this.showScreen('home-screen');
      document.getElementById('bottom-nav').style.display = 'flex';
      return;
    }

    // Show modal with loading state first
    backdrop.classList.add('active');
    modal.classList.add('active');
    document.getElementById('report-content').innerHTML = this._buildReportLoading();

    // Compute local scores while Claude generates
    const avg    = arr => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length * 100) : 0;
    const scores = session.analysisScores;
    const grammar    = avg(scores.map(s => s.grammar?.score    || 0));
    const vocab      = avg(scores.map(s => s.vocabulary?.score || 0));
    const fluency    = avg(scores.map(s => s.fluency?.score    || 0));
    const creativity = avg(scores.map(s => s.creativity?.score || 0));
    const mins       = Math.floor(durSec / 60);
    const secs       = durSec % 60;
    const modeInfo   = Prompts.MODE_INFO[session.mode] || { name: 'Chat', icon: '💬' };

    // Try Claude summary
    let summary = null;
    if (ClaudeAI.isConfigured()) {
      summary = await ClaudeAI.generateSessionSummary(child, session.mode, session.messages, scores, durSec);
    }

    // Build local fallback if Claude not available
    if (!summary) {
      const overallAvg = Math.round((grammar + vocab + fluency + creativity) / 4);
      summary = {
        headline:       overallAvg >= 75 ? `Wah, shabash ${child.name}! Outstanding session!` :
                        overallAvg >= 50 ? `Great effort, ${child.name}! You did really well!` :
                                           `Good job, ${child.name}! Keep practising!`,
        starMoment:     'You had a great conversation today!',
        praise:         ['You spoke with confidence!', 'You tried your best throughout!', 'Your English is improving every day!'],
        tipForNext:     'Try to speak in full sentences next time — it will make your English even stronger!',
        parentNote:     `${child.name} completed a ${Math.round(durSec/60)}-minute English practice session. Great effort shown throughout!`,
        overallRating:  overallAvg >= 75 ? 'superstar' : overallAvg >= 50 ? 'great' : overallAvg >= 30 ? 'good' : 'keep-going',
        spokenSummary:  `Wah, ${child.name}! That was a wonderful session. You spoke so well today! Keep practising every day and you will become an English superstar!`,
      };
    }

    // Render the report
    document.getElementById('report-content').innerHTML = this._buildReportHTML(
      child, summary, grammar, vocab, fluency, creativity,
      mins, secs, session.wordCount, modeInfo
    );

    this.showConfetti();

    // Speak the summary aloud
    if (summary.spokenSummary) {
      setTimeout(() => Speech.speak(summary.spokenSummary), 800);
    }
  },

  _buildReportLoading() {
    return `<div class="report-loading">
      <div class="report-loading-spinner"></div>
      <p>Priya is preparing your report...</p>
    </div>`;
  },

  _buildReportHTML(child, summary, grammar, vocab, fluency, creativity, mins, secs, wordCount, modeInfo) {
    const ratingConfig = {
      'superstar':  { emoji: '🌟', label: 'Superstar!',  color: '#FECA57', bg: 'rgba(254,202,87,0.12)' },
      'great':      { emoji: '🎉', label: 'Great Job!',  color: '#00D2D3', bg: 'rgba(0,210,211,0.10)' },
      'good':       { emoji: '👍', label: 'Well Done!',  color: '#6C5CE7', bg: 'rgba(108,92,231,0.10)' },
      'keep-going': { emoji: '💪', label: 'Keep Going!', color: '#FF9F43', bg: 'rgba(255,159,67,0.10)' },
    };
    const rating = ratingConfig[summary.overallRating] || ratingConfig['good'];

    const scoreBar = (val, color) =>
      `<div class="report-score-bar-wrap"><div class="report-score-bar" style="width:${val}%;background:${color}"></div></div>`;

    const praiseItems = (summary.praise || []).slice(0, 3)
      .map(p => `<div class="report-praise-item">✅ ${this.escapeHtml(p)}</div>`).join('');

    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    return `
      <!-- Header -->
      <div class="report-header" style="background:${rating.bg}">
        <div class="report-rating-emoji">${rating.emoji}</div>
        <div class="report-rating-label" style="color:${rating.color}">${rating.label}</div>
        <div class="report-headline">${this.escapeHtml(summary.headline)}</div>
        <div class="report-meta">${modeInfo.icon} ${modeInfo.name} · ${timeStr} · ${wordCount} words</div>
      </div>

      <!-- Star Moment -->
      <div class="report-section">
        <div class="report-section-title">⭐ Best Moment</div>
        <div class="report-star-moment">"${this.escapeHtml(summary.starMoment)}"</div>
      </div>

      <!-- What you did well -->
      <div class="report-section">
        <div class="report-section-title">🎯 What you did well</div>
        ${praiseItems}
      </div>

      <!-- Scores -->
      <div class="report-section">
        <div class="report-section-title">📊 Your Scores</div>
        <div class="report-scores">
          <div class="report-score-row"><span class="report-score-label">Grammar</span>${scoreBar(grammar,'#6C5CE7')}<span class="report-score-val">${grammar}%</span></div>
          <div class="report-score-row"><span class="report-score-label">Vocabulary</span>${scoreBar(vocab,'#00D2D3')}<span class="report-score-val">${vocab}%</span></div>
          <div class="report-score-row"><span class="report-score-label">Fluency</span>${scoreBar(fluency,'#FF9F43')}<span class="report-score-val">${fluency}%</span></div>
          <div class="report-score-row"><span class="report-score-label">Creativity</span>${scoreBar(creativity,'#FF6B6B')}<span class="report-score-val">${creativity}%</span></div>
        </div>
      </div>

      <!-- Tip for next time -->
      <div class="report-section report-tip">
        <div class="report-section-title">💡 Next time, try this</div>
        <p>${this.escapeHtml(summary.tipForNext)}</p>
      </div>

      <!-- Parent note (collapsible) -->
      <div class="report-section report-parent-note">
        <div class="report-section-title">👨‍👩‍👧 Note for Parents</div>
        <p>${this.escapeHtml(summary.parentNote)}</p>
      </div>

      <!-- CTA buttons -->
      <div class="report-actions">
        <button class="btn btn-primary btn-large" onclick="App.dismissReport(true)">Practice Again! 🎤</button>
        <button class="btn btn-secondary" onclick="App.dismissReport(false)">Go Home 🏠</button>
      </div>`;
  },

  dismissReport(practiceAgain) {
    document.getElementById('session-report-modal')?.classList.remove('active');
    document.getElementById('session-report-backdrop')?.classList.remove('active');
    Speech.stopSpeaking();

    if (practiceAgain) {
      setTimeout(() => this.startChat(this.currentMode), 300);
    } else {
      this.showScreen('home-screen');
      document.getElementById('bottom-nav').style.display = 'flex';
    }
  },

  // ─── Chat Status Bar ──────────────────────────────────────────────────────
  showChatStatus(msg, type = 'info') {
    const el = document.getElementById('chat-status-bar');
    if (!el) return;
    el.textContent = msg;
    el.className   = `chat-status-bar visible status-${type}`;
    setTimeout(() => { el.className = 'chat-status-bar'; }, 3000);
  },

  // ─── Message Rendering ────────────────────────────────────────────────────
  addChildMessage(text) {
    const c = document.getElementById('chat-messages');
    if (!c) return;
    const div = document.createElement('div');
    div.className = 'message message-child';
    div.innerHTML = `<div class="message-bubble">${this.escapeHtml(text)}</div>`;
    c.appendChild(div); this.scrollToBottom();
  },

  addMentorMessage(text) {
    const c = document.getElementById('chat-messages');
    if (!c) return;
    const div = document.createElement('div');
    div.className = 'message message-mentor';
    const html = this.escapeHtml(text).replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
    // Priya always shows her own avatar — 👩‍🏫 (not the child's avatar)
    div.innerHTML = `<div class="message-avatar priya-avatar">👩‍🏫</div><div class="message-bubble">${html}</div>`;
    c.appendChild(div); this.scrollToBottom();
  },

  addTypingIndicator() {
    const c = document.getElementById('chat-messages');
    if (!c) return null;
    const id  = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'message message-mentor'; div.id = id;
    div.innerHTML = `<div class="message-avatar priya-avatar">👩‍🏫</div><div class="message-bubble typing-indicator"><span></span><span></span><span></span></div>`;
    c.appendChild(div); this.scrollToBottom();
    return id;
  },

  removeTypingIndicator(id) { if (id) document.getElementById(id)?.remove(); },

  scrollToBottom() {
    const c = document.getElementById('chat-messages');
    if (c) requestAnimationFrame(() => { c.scrollTop = c.scrollHeight; });
  },

  // ─── Progress Screen ──────────────────────────────────────────────────────
  setupProgress() {
    const child = Storage.getChild();
    if (!child) return;

    const level   = child.currentLevel || 1;
    const names   = { 1:'Beginner', 2:'Basic Speaker', 3:'Intermediate', 4:'Advanced Communicator' };
    const classes = { 1:'level-1', 2:'level-2', 3:'level-3', 4:'level-4' };

    document.getElementById('progress-level-title').textContent = `Level ${level} — ${names[level]}`;
    document.getElementById('progress-level-badge').textContent = `⭐ Lv.${level}`;
    document.getElementById('progress-level-badge').className   = `level-badge ${classes[level]}`;

    const pct = AIEngine.getLevelProgress(child);
    document.getElementById('progress-level-bar').style.width  = pct + '%';
    document.getElementById('progress-level-text').textContent =
      pct >= 90 ? 'Almost at the next level! 🚀' : pct >= 60 ? 'Great progress! Keep going! 💪' :
      pct >= 30 ? 'Keep practising every day! 🌟' : 'Start talking to level up! 🎤';

    const avg  = Storage.getAverageScores();
    const pct1 = v => parseFloat(v) > 0 ? Math.round(parseFloat(v) * 100) : 0;
    this.renderScoreRing('ring-grammar',    pct1(avg.grammar));
    this.renderScoreRing('ring-vocab',      pct1(avg.vocab));
    this.renderScoreRing('ring-fluency',    pct1(avg.fluency));
    this.renderScoreRing('ring-creativity', pct1(avg.creativity));

    const bs = Badges.getSummary();
    const bsEl = document.getElementById('progress-badge-summary');
    if (bsEl) bsEl.innerHTML = `
      <div class="badge-summary-row">
        <span>${bs.xpLevel.emoji} ${bs.xpLevel.tier}</span>
        <span>${bs.earned}/${bs.total} badges · ${bs.xp} XP</span>
      </div>
      <div class="badge-mini-row">${bs.recent.map(b=>`<span title="${b.name}">${b.emoji}</span>`).join('')}</div>`;

    const vocabList = document.getElementById('vocab-list');
    const vocab     = Storage.getVocabulary().slice(0, 24);
    vocabList.innerHTML = vocab.length === 0
      ? `<div class="empty-state" style="padding:var(--space-lg);"><p style="font-size:var(--font-size-sm);">Start talking to build your vocabulary!</p></div>`
      : vocab.map(v => `<div class="vocab-item"><span class="vocab-word">${this.escapeHtml(v.word)}</span><span class="vocab-mastery">${'⭐'.repeat(Math.min(v.mastery,5))}</span></div>`).join('');

    this.renderModeBreakdown();
  },

  renderScoreRing(id, pct) {
    const el = document.getElementById(id);
    if (!el) return;
    const r = 28, circ = 2*Math.PI*r, off = circ - (pct/100)*circ;
    el.innerHTML = `<svg viewBox="0 0 70 70" style="width:70px;height:70px;">
      <circle cx="35" cy="35" r="${r}" fill="none" stroke="var(--color-border)" stroke-width="6"/>
      <circle cx="35" cy="35" r="${r}" fill="none" stroke="var(--color-primary)" stroke-width="6"
              stroke-dasharray="${circ}" stroke-dashoffset="${off}" stroke-linecap="round"
              transform="rotate(-90 35 35)" style="transition:stroke-dashoffset 1s ease"/>
      <text x="35" y="39" text-anchor="middle" font-size="13" font-weight="800" fill="var(--color-text)"
            font-family="var(--font-primary)">${pct>0?pct+'%':'--'}</text>
    </svg>`;
  },

  renderModeBreakdown() {
    const el = document.getElementById('mode-breakdown');
    if (!el) return;
    const convos = Storage.getConversations();
    if (!convos.length) { el.innerHTML = '<p style="font-size:var(--font-size-sm);color:var(--color-text-secondary);text-align:center;padding:var(--space-md);">No sessions yet</p>'; return; }
    const counts = {};
    convos.forEach(c => { counts[c.mode] = (counts[c.mode]||0)+1; });
    const total = convos.length;
    el.innerHTML = Object.entries(Prompts.MODE_INFO).map(([key,info]) => {
      const count = counts[key]||0;
      const pct   = total>0 ? Math.round((count/total)*100) : 0;
      return `<div class="mode-stat-row"><span class="mode-stat-icon">${info.icon}</span><div class="mode-stat-info"><div class="mode-stat-name">${info.name}</div><div class="mode-stat-bar-wrap"><div class="mode-stat-bar" style="width:${pct}%;background:${info.color}"></div></div></div><span class="mode-stat-count">${count}</span></div>`;
    }).join('');
  },

  // ─── Badges Screen ────────────────────────────────────────────────────────
  setupBadges() {
    const summary = Badges.getSummary();
    const earned  = new Set(Badges.getEarned().map(e => e.id));
    const xpLevel = summary.xpLevel;
    const headerEl = document.getElementById('badges-header-info');
    if (headerEl) {
      const xp = summary.xp, next = xpLevel.next;
      const pct = next ? Math.round(((xp-xpLevel.min)/(next-xpLevel.min))*100) : 100;
      headerEl.innerHTML = `
        <div class="xp-level-badge">${xpLevel.emoji} ${xpLevel.tier}</div>
        <div class="xp-bar-wrap"><div class="xp-bar" style="width:${pct}%"></div></div>
        <div class="xp-label">${xp} XP${next?' / '+next+' XP to '+this._nextTier(xpLevel.tier):' — Max Level!'}</div>
        <div class="badges-count">${summary.earned}/${summary.total} badges earned</div>`;
    }
    const grid = document.getElementById('badges-grid');
    if (!grid) return;
    const cats = { milestone:'🏁 Milestones',streak:'🔥 Streaks',practice:'💬 Practice',vocab:'📚 Vocabulary',mode:'🎭 Modes',level:'⭐ Levels',time:'⏱️ Speaking Time',quality:'✅ Quality',special:'🎉 Special' };
    let html = '';
    for (const [cat,label] of Object.entries(cats)) {
      const cb = Badges.ALL.filter(b=>b.category===cat);
      if (!cb.length) continue;
      html += `<div class="badge-category-title">${label}</div><div class="badges-row">`;
      cb.forEach(b => {
        const ok = earned.has(b.id);
        html += `<div class="badge-item${ok?' earned':' locked'}"><div class="badge-emoji">${ok?b.emoji:'🔒'}</div><div class="badge-name">${b.name}</div><div class="badge-xp">+${b.xp} XP</div>${ok?'':`<div class="badge-desc">${b.desc}</div>`}</div>`;
      });
      html += `</div>`;
    }
    grid.innerHTML = html;
  },

  _nextTier(t) { return {'Starter':'Bronze','Bronze':'Silver','Silver':'Gold'}[t]||''; },

  // ─── Dashboard ────────────────────────────────────────────────────────────
  setupDashboard() {
    const child = Storage.getChild();
    if (child) document.getElementById('dashboard-child-name').textContent = `Tracking progress for ${child.name}`;
    const sec = Storage.getTotalSpeakingTime();
    document.getElementById('dash-speaking-time').textContent = sec<60?sec+'s':Math.round(sec/60)+'m';
    document.getElementById('dash-conversations').textContent = Storage.getTotalConversations();
    document.getElementById('dash-words-learned').textContent = Storage.getVocabularyCount();
    document.getElementById('dash-level').textContent         = child?.currentLevel||1;
    this.renderWeeklyChart();
    const histEl = document.getElementById('conversation-history');
    const convos = Storage.getRecentConversations(10);
    histEl.innerHTML = convos.length===0
      ? `<div class="empty-state" style="padding:var(--space-lg);"><p style="font-size:var(--font-size-sm);">No conversations yet</p></div>`
      : convos.map(c=>{
          const m=Prompts.MODE_INFO[c.mode]||{name:'Chat',icon:'💬'};
          const d=new Date(c.startedAt).toLocaleDateString('en',{weekday:'short',day:'numeric',month:'short'});
          const dur=c.durationSeconds?Math.round(c.durationSeconds/60)+' min':'';
          const wc=c.wordCount?c.wordCount+' words':'';
          return `<div class="history-item"><div class="history-item-icon">${m.icon}</div><div class="history-item-info"><div class="history-item-title">${m.name}</div><div class="history-item-meta">${d}${dur?' · '+dur:''}${wc?' · '+wc:''}</div></div></div>`;
        }).join('');
  },

  renderWeeklyChart() {
    const data=Storage.getWeeklyProgress(),el=document.getElementById('weekly-chart');
    if(!el)return;
    const max=Math.max(...data.map(d=>d.speakingTimeSeconds),1);
    el.innerHTML=data.map(d=>{
      const pct=Math.max(5,Math.round((d.speakingTimeSeconds/max)*100));
      const min=d.speakingTimeSeconds>0?Math.round(d.speakingTimeSeconds/60)+'m':'';
      return `<div class="chart-bar-wrap"><div class="chart-bar" style="height:${pct}%" title="${min}"></div><div class="chart-bar-label">${d.day}</div></div>`;
    }).join('');
  },

  // ─── Settings ─────────────────────────────────────────────────────────────
  setupSettings() {
    const child=Storage.getChild();if(!child)return;
    const names={1:'Beginner',2:'Basic Speaker',3:'Intermediate',4:'Advanced Communicator'};
    document.getElementById('settings-avatar').textContent=child.avatar||'🦊';
    document.getElementById('settings-name').textContent=child.name;
    document.getElementById('settings-level').textContent=`Level ${child.currentLevel||1} — ${names[child.currentLevel||1]}`;
    const aiEl=document.getElementById('settings-ai-status');
    if(aiEl){aiEl.textContent=ClaudeAI.isConfigured()?'✅ Claude AI Active':'⚡ Smart Mode (local)';aiEl.style.color=ClaudeAI.isConfigured()?'#00D2D3':'var(--color-text-secondary)';}
  },

  saveApiKey(){const i=document.getElementById('settings-api-key-raw');if(!i)return;const k=i.value.trim();if(!k){this.showToast('Please enter an API key.','error');return;}if(!k.startsWith('sk-ant-')){this.showToast('Invalid key — should start with sk-ant-','error');return;}ClaudeAI.saveApiKey(k);i.value='';this.showToast('Claude AI key saved! ✨');this.setupSettings();this.updateAIBadge();},
  async testApiKey(){if(!ClaudeAI.isConfigured()){this.showToast('No API key configured.','error');return;}this.showToast('Testing...','info');const r=await ClaudeAI.testConnection();r.ok?this.showToast('Claude AI connected! 🎉'):this.showToast('Failed: '+r.error,'error');},
  removeApiKey(){ClaudeAI.removeApiKey();this.showToast('API key removed.');this.setupSettings();this.updateAIBadge();},
  clearAllData(){if(!confirm('Delete ALL progress? Are you sure?'))return;Storage.clearAll();ClaudeAI.removeApiKey();localStorage.removeItem('speakbuddy_badges');localStorage.removeItem('speakbuddy_xp');this.showScreen('welcome-screen');document.getElementById('bottom-nav').style.display='none';this.showToast('All data cleared.');},

  // ─── Level Up ─────────────────────────────────────────────────────────────
  showLevelUp(newLevel) {
    const names={2:'Basic Speaker',3:'Intermediate',4:'Advanced Communicator'};
    document.getElementById('level-up-title').textContent=`Level ${newLevel} Unlocked! 🎉`;
    document.getElementById('level-up-text').textContent=`Wah, shabash! You've reached Level ${newLevel} — ${names[newLevel]||'Expert'}!`;
    document.getElementById('level-up-modal').classList.add('active');
    document.getElementById('level-up-backdrop').classList.add('active');
    this.showConfetti();
    Speech.speak(`Wah shabash! Amazing! You have reached Level ${newLevel}! You are doing so well!`);
  },
  dismissLevelUp(){document.getElementById('level-up-modal').classList.remove('active');document.getElementById('level-up-backdrop').classList.remove('active');},

  // ─── Badge Toast ──────────────────────────────────────────────────────────
  showBadgeToast(badge){const c=document.getElementById('toast-container');if(!c)return;const t=document.createElement('div');t.className='toast toast-badge';t.innerHTML=`<span style="font-size:22px">${badge.emoji}</span><div><strong>${badge.name}</strong><br><small>${badge.desc}</small></div>`;c.appendChild(t);requestAnimationFrame(()=>t.classList.add('visible'));setTimeout(()=>{t.classList.remove('visible');setTimeout(()=>t.remove(),400);},4000);},

  // ─── Toast ────────────────────────────────────────────────────────────────
  showToast(message,type='success'){const c=document.getElementById('toast-container');if(!c)return;const t=document.createElement('div');t.className=`toast toast-${type}`;t.textContent=message;c.appendChild(t);requestAnimationFrame(()=>t.classList.add('visible'));setTimeout(()=>{t.classList.remove('visible');setTimeout(()=>t.remove(),400);},3000);},

  // ─── Confetti ─────────────────────────────────────────────────────────────
  showConfetti(){const c=document.getElementById('confetti-container');if(!c)return;const colors=['#6C5CE7','#FF6B6B','#FECA57','#00D2D3','#FF9FF3','#48DBFB','#FF9F43'];for(let i=0;i<70;i++){const p=document.createElement('div');p.className='confetti-piece';p.style.left=Math.random()*100+'vw';p.style.background=colors[Math.floor(Math.random()*colors.length)];p.style.animationDelay=Math.random()*1.8+'s';p.style.width=(Math.random()*9+5)+'px';p.style.height=(Math.random()*9+5)+'px';p.style.borderRadius=Math.random()>.5?'50%':'2px';c.appendChild(p);setTimeout(()=>p.remove(),4500);}},

  // ─── Utils ────────────────────────────────────────────────────────────────
  delay(ms){return new Promise(r=>setTimeout(r,ms));},
  escapeHtml(text){if(typeof text!=='string')return'';const d=document.createElement('div');d.appendChild(document.createTextNode(text));return d.innerHTML;},
};

document.addEventListener('DOMContentLoaded', () => App.init());
