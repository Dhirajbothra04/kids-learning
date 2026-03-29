/**
 * SpeakBuddy — Badges & Achievements System
 * Tracks and unlocks achievements for Indian kids learning English.
 */

const Badges = {

  // ─── Badge Definitions ────────────────────────────────────────────────────
  ALL: [
    // Starter badges
    { id: 'first_words',   emoji: '🗣️',  name: 'First Words',      desc: 'Completed your very first conversation!',       xp: 50,  category: 'milestone' },
    { id: 'three_days',    emoji: '🔥',  name: 'Hat-Trick!',        desc: 'Practised 3 days in a row. Shabash!',           xp: 75,  category: 'streak'    },
    { id: 'seven_days',    emoji: '🏆',  name: 'Week Champion',     desc: '7-day streak! You are a true champion!',        xp: 150, category: 'streak'    },
    { id: 'thirty_days',   emoji: '👑',  name: 'Monthly Maestro',   desc: '30-day streak! Incredible dedication!',         xp: 400, category: 'streak'    },

    // Conversation badges
    { id: 'chat_5',        emoji: '💬',  name: 'Chatterbox',        desc: 'Had 5 conversations with Buddy!',               xp: 60,  category: 'practice'  },
    { id: 'chat_25',       emoji: '🎙️',  name: 'Speaker Star',      desc: '25 conversations — you love to talk!',          xp: 120, category: 'practice'  },
    { id: 'chat_100',      emoji: '🌟',  name: 'Conversation King', desc: '100 conversations! Legendary!',                 xp: 500, category: 'practice'  },

    // Word badges
    { id: 'words_50',      emoji: '📚',  name: 'Word Collector',    desc: 'Learned 50 new English words!',                 xp: 80,  category: 'vocab'     },
    { id: 'words_100',     emoji: '📖',  name: 'Word Master',       desc: '100 words in your vocabulary!',                 xp: 200, category: 'vocab'     },
    { id: 'words_200',     emoji: '🎓',  name: 'Vocabulary Wizard', desc: '200 words — you are a word wizard!',            xp: 400, category: 'vocab'     },

    // Mode badges
    { id: 'story_5',       emoji: '📝',  name: 'Story Teller',      desc: 'Built 5 stories with Buddy!',                   xp: 70,  category: 'mode'      },
    { id: 'roleplay_5',    emoji: '🎭',  name: 'Actor Star',        desc: 'Completed 5 Role Play sessions!',               xp: 70,  category: 'mode'      },
    { id: 'vocab_5',       emoji: '🔤',  name: 'Quest Hero',        desc: 'Completed 5 Vocabulary Quest sessions!',        xp: 70,  category: 'mode'      },
    { id: 'opinion_5',     emoji: '💡',  name: 'Big Thinker',       desc: 'Shared opinions in 5 sessions!',                xp: 70,  category: 'mode'      },
    { id: 'all_modes',     emoji: '🌈',  name: 'Explorer',          desc: 'Tried all 5 conversation modes!',               xp: 100, category: 'mode'      },

    // Level badges
    { id: 'level_2',       emoji: '⭐',  name: 'Rising Star',       desc: 'Reached Level 2 — Basic Speaker!',             xp: 100, category: 'level'     },
    { id: 'level_3',       emoji: '🌟',  name: 'Growing Strong',    desc: 'Reached Level 3 — Intermediate!',              xp: 200, category: 'level'     },
    { id: 'level_4',       emoji: '🏅',  name: 'Advanced Speaker',  desc: 'Reached Level 4 — Advanced Communicator!',     xp: 400, category: 'level'     },

    // Speaking time badges
    { id: 'speak_30min',   emoji: '⏱️',  name: 'Half Hour Hero',    desc: 'Spoken English for 30 minutes total!',          xp: 80,  category: 'time'      },
    { id: 'speak_2hr',     emoji: '🕐',  name: 'Two Hour Titan',    desc: '2 hours of English speaking practice!',         xp: 180, category: 'time'      },
    { id: 'speak_10hr',    emoji: '🌙',  name: 'English Expert',    desc: '10 hours of speaking — wow!',                   xp: 500, category: 'time'      },

    // Quality badges
    { id: 'perfect_gram',  emoji: '✅',  name: 'Grammar Guru',      desc: 'Got perfect grammar in a session!',             xp: 90,  category: 'quality'   },
    { id: 'creative_3',    emoji: '🎨',  name: 'Creative Mind',     desc: 'Used creative words 3 sessions in a row!',      xp: 90,  category: 'quality'   },
    { id: 'long_answer',   emoji: '💪',  name: 'Big Talker',        desc: 'Gave a 30+ word answer in one go!',             xp: 80,  category: 'quality'   },

    // Fun / Special
    { id: 'morning_bird',  emoji: '🌅',  name: 'Morning Bird',      desc: 'Practised before 9 AM!',                        xp: 50,  category: 'special'   },
    { id: 'night_owl',     emoji: '🦉',  name: 'Night Owl',         desc: 'Practised after 9 PM!',                         xp: 50,  category: 'special'   },
    { id: 'weekend_hero',  emoji: '🎉',  name: 'Weekend Hero',      desc: 'Practised on a Saturday AND Sunday!',           xp: 60,  category: 'special'   },
  ],

  // ─── Get a badge by ID ────────────────────────────────────────────────────
  get(id) {
    return this.ALL.find(b => b.id === id) || null;
  },

  // ─── Load / Save earned badges ────────────────────────────────────────────
  getEarned() {
    const data = localStorage.getItem('speakbuddy_badges');
    return data ? JSON.parse(data) : [];
  },

  hasEarned(id) {
    return this.getEarned().some(b => b.id === id);
  },

  award(id) {
    const badge = this.get(id);
    if (!badge || this.hasEarned(id)) return null;

    const earned = this.getEarned();
    const record = { id, earnedAt: new Date().toISOString() };
    earned.push(record);
    localStorage.setItem('speakbuddy_badges', JSON.stringify(earned));

    // Add XP
    this._addXP(badge.xp);

    return badge;
  },

  // ─── XP System ────────────────────────────────────────────────────────────
  getXP() {
    return parseInt(localStorage.getItem('speakbuddy_xp') || '0', 10);
  },

  _addXP(amount) {
    const current = this.getXP();
    localStorage.setItem('speakbuddy_xp', String(current + amount));
  },

  getXPLevel() {
    const xp = this.getXP();
    if (xp >= 2000) return { tier: 'Gold',    emoji: '🥇', min: 2000, next: null };
    if (xp >= 1000) return { tier: 'Silver',  emoji: '🥈', min: 1000, next: 2000 };
    if (xp >= 400)  return { tier: 'Bronze',  emoji: '🥉', min: 400,  next: 1000 };
    return           { tier: 'Starter', emoji: '🌱', min: 0,   next: 400  };
  },

  // ─── Check and award badges based on current state ────────────────────────
  checkAndAward() {
    const newBadges = [];
    const conv      = Storage.getTotalConversations();
    const streak    = Storage.getStreak();
    const vocab     = Storage.getVocabularyCount();
    const child     = Storage.getChild();
    const progress  = Storage.getAllProgress();
    const speakSec  = Storage.getTotalSpeakingTime();
    const convList  = Storage.getConversations();
    const hour      = new Date().getHours();
    const day       = new Date().getDay(); // 0=Sun, 6=Sat

    const tryAward = (id) => {
      const b = this.award(id);
      if (b) newBadges.push(b);
    };

    // Milestone
    if (conv >= 1)   tryAward('first_words');

    // Streaks
    if (streak.currentStreak >= 3)   tryAward('three_days');
    if (streak.currentStreak >= 7)   tryAward('seven_days');
    if (streak.currentStreak >= 30)  tryAward('thirty_days');

    // Conversations
    if (conv >= 5)   tryAward('chat_5');
    if (conv >= 25)  tryAward('chat_25');
    if (conv >= 100) tryAward('chat_100');

    // Vocabulary
    if (vocab >= 50)  tryAward('words_50');
    if (vocab >= 100) tryAward('words_100');
    if (vocab >= 200) tryAward('words_200');

    // Modes
    const modes = new Set(convList.map(c => c.mode));
    const storySessions   = convList.filter(c => c.mode === 'story_builder').length;
    const roleplaySessions= convList.filter(c => c.mode === 'role_play').length;
    const vocabSessions   = convList.filter(c => c.mode === 'vocabulary_quest').length;
    const opinionSessions = convList.filter(c => c.mode === 'opinion_mode').length;

    if (storySessions   >= 5) tryAward('story_5');
    if (roleplaySessions>= 5) tryAward('roleplay_5');
    if (vocabSessions   >= 5) tryAward('vocab_5');
    if (opinionSessions >= 5) tryAward('opinion_5');
    if (modes.size      >= 5) tryAward('all_modes');

    // Levels
    if ((child?.currentLevel || 1) >= 2) tryAward('level_2');
    if ((child?.currentLevel || 1) >= 3) tryAward('level_3');
    if ((child?.currentLevel || 1) >= 4) tryAward('level_4');

    // Speaking time
    if (speakSec >= 1800)  tryAward('speak_30min');
    if (speakSec >= 7200)  tryAward('speak_2hr');
    if (speakSec >= 36000) tryAward('speak_10hr');

    // Quality
    const avgScores = Storage.getAverageScores();
    if (parseFloat(avgScores.grammar) >= 0.95) tryAward('perfect_gram');

    // Time of day
    if (hour < 9)  tryAward('morning_bird');
    if (hour >= 21) tryAward('night_owl');
    if (day === 0 || day === 6) tryAward('weekend_hero');

    return newBadges; // array of newly awarded badge objects
  },

  // ─── Check long answer badge (called from app.js) ─────────────────────────
  checkLongAnswer(wordCount) {
    if (wordCount >= 30) return this.award('long_answer');
    return null;
  },

  // ─── Stats summary ────────────────────────────────────────────────────────
  getSummary() {
    const earned = this.getEarned();
    return {
      total:   this.ALL.length,
      earned:  earned.length,
      xp:      this.getXP(),
      xpLevel: this.getXPLevel(),
      recent:  earned.slice(-3).map(e => this.get(e.id)).filter(Boolean),
    };
  },
};
