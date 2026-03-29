# 🎤 SpeakBuddy — Android Mobile App Brief for Loveable

## 📱 Project Overview

**SpeakBuddy** is an AI-powered conversational English learning app designed for Indian children aged **5–12**. The app facilitates natural, continuous English conversations with an AI mentor named **Priya** who speaks Indian English in a warm, encouraging tone.

The current version is a responsive web app built with vanilla JavaScript. We need a **native Android app** that mirrors the functionality while leveraging Android's native capabilities for better voice processing, offline support, and platform integration.

---

## 🎯 Core Vision

Transform how Indian kids learn English by making it feel like chatting with a friendly older sibling, not taking a test. Every interaction should be:
- **Natural**: Priya stays on the same topic for several turns instead of jumping randomly
- **Encouraging**: Warm Indian English ("Wah, shabash!", "Ekdum nice!")
- **Intelligent**: Powered by Claude AI when available, with smart local fallback
- **Seamless**: Voice input → Priya responds → Auto-listen again (no UI friction)

---

## 🎭 Key Features to Implement

### 1. **Registration & Parent Dashboard**
- 3-step parent/child registration
- Child profile with avatar selection (🦊 🐶 🐱 🦁 🐻 etc)
- Interest selection (cricket, football, drawing, animals, gaming, books, etc)
- Parent email/password login with secure storage
- Parent progress dashboard with weekly charts

### 2. **Seamless Voice Conversation**
- **Push-to-talk mic button** (not full-screen overlay)
- **Live interim transcription** — child sees their words appearing as they speak
- **Auto-listen after Priya speaks** — no "send" button friction
- **Slow, clear Indian voice** — speech rate 0.80–0.84 (very patient)
- **Pause tolerance** — waits 4.5 seconds for silence before finalizing input
- **Three input modes**: Voice (primary), Text input (fallback), Hybrid

### 3. **5 Conversation Modes**
Each mode has 200+ level-specific prompts:

1. **Daily Chat** 💬 — casual talk about school, friends, family, food
2. **Story Builder** 📖 — collaborative storytelling (adult + child take turns)
3. **Role Play** 🎭 — child becomes a character (doctor, astronaut, cricketer)
4. **Vocabulary Quest** 🏆 — learning new English words through conversation
5. **Share Ideas** 🤔 — opinion-based questions (age-appropriate reasoning)

### 4. **4-Level Progression System**
- **Level 1 — Beginner**: One-word to 3-word answers
- **Level 2 — Basic Speaker**: 4–8 word sentences
- **Level 3 — Intermediate**: 2–4 sentence descriptions
- **Level 4 — Advanced**: Complex reasoning and storytelling

Auto-level-up based on grammar, vocabulary, fluency, creativity scores.

### 5. **Session Reporting**
After every chat session, display a beautiful report card:
- **⭐ Rating**: Superstar/Great Job/Well Done/Keep Going
- **Star Moment**: Quote the best thing the child said
- **What You Did Well**: 3 specific praise points
- **Score Bars**: Grammar, Vocabulary, Fluency, Creativity (0–100%)
- **Next Time Tip**: Gentle improvement suggestion
- **Parent Note**: 2-sentence summary for parents
- **Spoken Summary**: Priya congratulates the child by voice

### 6. **Gamification & Badges**
- **Daily Challenge**: Different challenge each day (earn XP)
- **Streak System**: 🔥 Days practiced in a row
- **Badges**: 50+ achievements across 9 categories
- **Word of the Day**: New vocabulary with meaning + example
- **Leaderboard**: (optional) Track progress over time

### 7. **Parent Dashboard**
- Child progress overview (total words, speaking time, level)
- Weekly conversation heatmap
- Recent conversation history with mode & duration
- Vocabulary learned
- Grade breakdown by skill
- Settings: Claude AI integration, data export, clear all

---

## 🧠 AI Engine Architecture

### **When Claude API is Configured:**
1. Child speaks → transcript sent to Claude Sonnet 4.6
2. Claude analyzes within **conversation context** (current topic, entities, turn count)
3. Claude stays on same topic for 3–6 turns before naturally transitioning
4. Claude generates warm reaction + one follow-up question
5. Priya speaks the response (750ms pause between reaction & question)
6. Mic auto-activates → loop repeats

### **When Claude API is NOT Configured (Local Fallback):**
1. Use local rule-based grammar/vocabulary/fluency analysis
2. Detect topic from child's speech (15+ Indian-relevant topics)
3. Pick follow-up questions from topic-specific pools (not random)
4. Warm Indian-style reactions based on answer length
5. Same conversation loop (voice in → Priya speaks → auto-listen)

### **Topic-Aware Follow-ups (Built-in Database)**
```
cricket → "Who do you play with?" → "What position?" → "Favourite player?"
dogs → "What's your dog's name?" → "What games?" → "Where do you play?"
school → "What's your fave subject?" → "Best friend?" → "Tell me about teacher"
family → "How many in your family?" → "Who do you like most?" → "Weekends?"
food → "All-time favourite food?" → "Who cooks best?" → "Your birthday food?"
[15+ more topics]
```

---

## 🎨 UI/UX Specifications

### **Color Palette**
- **Primary Purple**: #6C5CE7 (actions, progress bars, Priya's avatar ring)
- **Cyan Accent**: #00D2D3 (highlights, vocabulary)
- **Warm Orange**: #FF9F43 (fluency, encouragement)
- **Pink**: #FF9FF3 (creativity, playfulness)
- **Red**: #FF6B6B (creativity scores)
- **Gold**: #FECA57 (rewards, badges)

### **Typography**
- **Primary Font**: "Segoe UI", "Roboto" (clean, modern)
- **Headlines**: 24px, 800 weight
- **Body**: 14px, 400 weight
- **Chat bubbles**: 16px, 400 weight

### **Key Screens**

1. **Splash Screen** (2 seconds)
   - App logo + "SpeakBuddy"
   - Animated loader

2. **Welcome Screen**
   - Priya mascot (🦊)
   - Feature cards (voice, encouragement, reports)
   - CTA: "Let's Get Started!" or "Sign In"

3. **Registration (3 Steps)**
   - Step 1: Parent details (name, email, password)
   - Step 2: Child profile (name, age, class, school, city)
   - Step 3: Interests (multi-select) + Avatar pick

4. **Home Screen**
   - Child avatar + greeting ("Good morning, [name]!")
   - Stats: Streak days, total words, current level
   - Streak week view (M T W T F S S)
   - Word of the Day card (with pronunciation)
   - Daily Challenge card (mode-specific, +XP)
   - Recent activity (last 3 conversations)
   - 5 mode buttons to start chat

5. **Chat Screen** (Main Experience)
   - Header: Mode icon + mode name + timer (⏱ 0:00)
   - Messages area: Child right (blue), Priya left (👩‍🏫 purple ring)
   - Interim bubbles: dashed purple border while speaking
   - Mic button: 4 states (idle, listening pulse, speaking, thinking)
   - Status bar: "🎤 Listening..." / "🔊 Priya is speaking..." / "⏳ Thinking..."
   - Text input (optional fallback)
   - Back button to end chat

6. **Session Report Modal**
   - Large modal/sheet that slides up
   - Rating emoji + headline
   - Star moment quote
   - Praise cards (3 points)
   - Score bars (animated)
   - Next time tip
   - Parent note (collapsible)
   - Buttons: "Practice Again!" or "Go Home"
   - Priya reads summary aloud

7. **Progress Screen**
   - Level badge (Lv.1 Beginner, etc) + progress bar
   - Score rings (Grammar, Vocab, Fluency, Creativity) — SVG circles, animated
   - Mode breakdown (bar chart)
   - Vocabulary learned (grid of word cards)
   - Badge summary

8. **Dashboard (Parent)**
   - Speaking time total
   - Total conversations
   - Words learned
   - Current level
   - Weekly heatmap (chart bars)
   - Conversation history (list)

9. **Badges Screen**
   - XP level badge (Starter/Bronze/Silver/Gold)
   - XP progress bar to next tier
   - Badge categories:
     - 🏁 Milestones
     - 🔥 Streaks
     - 💬 Practice
     - 📚 Vocabulary
     - 🎭 Modes
     - ⭐ Levels
     - ⏱️ Speaking Time
     - ✅ Quality
     - 🎉 Special
   - Locked badges show: 🔒 + description

10. **Settings Screen**
    - Child profile display
    - Current level
    - AI Status (Claude AI or Smart Mode)
    - Claude API key input (sk-ant-...)
    - Test API connection button
    - Clear all data
    - Terms / Privacy (stub)

---

## 📊 Data Model

### **Parent**
```javascript
{
  id: "uuid",
  name: "Priya Sharma",
  email: "priya@example.com",
  password: "hashed",
  createdAt: "2026-03-30T..."
}
```

### **Child**
```javascript
{
  id: "uuid",
  name: "Aditya",
  age: 8,
  class: "3rd",
  school: "Delhi Public School",
  city: "Delhi",
  avatar: "🦊",
  interests: ["cricket", "drawing", "animals"],
  currentLevel: 2,
  createdAt: "2026-03-30T..."
}
```

### **Conversation Session**
```javascript
{
  id: "uuid",
  mode: "daily_chat", // or story_builder, role_play, vocabulary_quest, opinion_mode
  startedAt: "2026-03-30T10:30:00Z",
  endedAt: "2026-03-30T10:45:00Z",
  durationSeconds: 900,
  messages: [
    { role: "mentor", content: "...", timestamp: "..." },
    { role: "child", content: "...", timestamp: "..." }
  ],
  wordCount: 240,
  analysisScores: [
    { grammar: 0.85, vocabulary: 0.72, fluency: 0.88, creativity: 0.65 }
  ]
}
```

### **Progress Entry (Daily)**
```javascript
{
  date: "2026-03-30",
  conversationsCount: 2,
  totalWords: 480,
  speakingTimeSeconds: 1800,
  avgGrammar: 0.82,
  avgVocab: 0.75,
  avgFluency: 0.86,
  avgCreativity: 0.68
}
```

### **Badge**
```javascript
{
  id: "first_chat",
  name: "First Chat",
  category: "milestone",
  emoji: "🎤",
  xp: 50,
  desc: "Have your first conversation",
  condition: "totalConversations >= 1"
}
```

---

## 🔌 API Integration

### **Claude Sonnet 4.6 Integration**
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **API Key**: Stored securely (parent enters in Settings)
- **Model**: `claude-sonnet-4-6`
- **Max tokens**: 450 (per response)
- **System Prompt**: Dynamic — includes child profile, level, mode, conversation context
- **Input**: Child's speech transcript + analysis hints + conversation history

### **Speech Services**
- **Recognition**: Android's built-in SpeechRecognizer (en-IN)
- **Synthesis**: Android's built-in TextToSpeech
  - Language: en-IN (Indian English)
  - Rate: 0.80–0.84 (slow, clear)
  - Pitch: 1.05 (warmer)
  - Voice preference: Female (usually available)

### **Local Storage**
- SQLite or Room database (Android native)
- Stores: Parent, Child, Conversations, Progress, Badges, Vocabulary, Memories

---

## 🚀 Technical Stack Recommendations for Android

**Frontend**:
- Kotlin + Jetpack Compose (modern, concise, reactive UI)
- OR: Java + Material Design 3

**Architecture**:
- MVVM with LiveData/StateFlow
- Repository pattern for data access
- Dependency injection (Hilt)

**Key Libraries**:
- `androidx.compose` — UI framework
- `androidx.lifecycle` — lifecycle management
- `com.google.android.material` — Material Design 3
- `androidx.room` — SQLite ORM
- `okhttp` + `retrofit` — API calls (for Claude)
- `android.speech` — speech recognition/synthesis
- `io.coil` — image loading
- `org.jetbrains.kotlinx:kotlinx-coroutines` — async operations

**Offline Capability**:
- All prompts bundled in APK (~500KB)
- Conversations cached locally
- Claude API calls cached with smart retry logic

---

## 📋 Phase 1 Scope (MVP for Android)

### Must-Have:
1. ✅ Registration (parent + child)
2. ✅ Chat screen with voice I/O
3. ✅ Claude AI integration (configurable API key)
4. ✅ Local fallback when Claude not configured
5. ✅ Session reports
6. ✅ Home screen with stats
7. ✅ Progress screen with levels
8. ✅ Settings (API key, data management)
9. ✅ Speech recognition (en-IN)
10. ✅ Text-to-speech (Indian voice, slow rate)

### Nice-to-Have (Phase 2):
- Badges system
- Daily challenge
- Word of the Day
- Parent dashboard with charts
- Offline mode (full prompts in APK)
- Analytics (anonymized)
- Push notifications for daily practice reminders
- Dark mode

---

## 🎬 User Flow

```
Splash (2s)
  → Welcome Screen
    → Registration (3 steps) / Login
      → Home Screen (greeting + stats + mode buttons)
        → Pick a mode
          → Chat Screen (voice loop)
            → End chat
              → Session Report (with praise + score)
                → Home or Practice Again
                  → (cycle repeats)
        → Progress Screen (levels, badges, vocab)
        → Badges Screen (achievements)
        → Dashboard (parent stats, weekly chart)
        → Settings (API key, data)
```

---

## 🌍 Localization & Cultural Context

### Indian English Specifics
- Speech recognition: `en-IN` language code
- Text-to-speech: Prefer Indian female voices (Veena, Lekha, Aditi, Priya, etc.)
- Reactions: "Wah, shabash!", "Ekdum nice!", "Arre, that is wonderful!"
- Examples & topics: Cricket, Diwali, samosas, monsoon, "dadi/nana", school exams, Indian cities

### Age Appropriateness
- Level 1 (age 5–6): Very simple questions, 1–3 word answers
- Level 2 (age 7–8): Basic sentences, 4–8 words
- Level 3 (age 9–10): Narratives, 2–4 sentences
- Level 4 (age 11–12): Reasoning, opinions, complex sentences

---

## 📞 Contact & Support Info

**For Loveable Development Team:**
- Current web version: Responsive vanilla JS (no frameworks)
- All 200+ prompts + grammar rules included
- Local AI engine + Claude integration both available
- Conversion guide available in `TECHNICAL_ARCHITECTURE.md`

---

## 🎯 Success Metrics

1. **Child Engagement**: Sessions per week, avg session duration
2. **Learning Progress**: % level-ups, vocabulary growth, score improvements
3. **Parent Satisfaction**: Completion of parent setup, use of reports
4. **Quality**: Grammar accuracy, topic continuity, speaking time

---

*Last updated: March 30, 2026*
*Version: 1.0 — Ready for Android Development*
