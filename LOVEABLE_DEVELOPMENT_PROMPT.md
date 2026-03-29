# 🎤 SpeakBuddy — Loveable.ai Development Prompt

**Project**: SpeakBuddy Android App (AI-powered English learning for Indian kids)
**Target**: Android (Kotlin + Jetpack Compose)
**Timeline**: 8–10 weeks
**Status**: Ready for development

---

## Executive Summary

We are building **SpeakBuddy**, an AI-powered English conversation app for Indian children aged 5–12. An AI mentor named **Priya** engages kids in natural, topic-aware conversations in Indian English. The app must feel like chatting with a friendly older sibling, not taking a test.

**Key Innovation**: Topic continuity. Instead of asking random questions, Priya stays on the same topic for 3–6 conversational turns before naturally transitioning. This makes conversations feel human-like instead of robotic.

**Current Status**: Fully functional web version (vanilla JS) exists. We need a native Android app that preserves core functionality while leveraging Android's superior voice I/O and offline capabilities.

---

## Development Approach

### Loveable's Role
1. Build the native Android app (Kotlin + Jetpack Compose)
2. Integrate Claude Sonnet 4.6 API (provided by us)
3. Implement local fallback AI engine (provided as code migration)
4. Handle speech recognition (Android's SpeechRecognizer, en-IN)
5. Handle text-to-speech (Android's TextToSpeech, Indian female voice, slow rate)
6. Database design (Room ORM for SQLite)
7. UI implementation (Material Design 3)
8. Testing & optimization

### What We Provide
- ✅ Complete source code (vanilla JS) for logic & data structures
- ✅ 200+ conversation prompts (organized by level & mode)
- ✅ AI analysis engine (grammar, vocabulary, fluency, creativity)
- ✅ Claude API integration pattern
- ✅ Local fallback logic (topic-aware prompts, reactions)
- ✅ UI/UX specifications (colors, screens, layouts)
- ✅ Data schema (parent, child, conversations, progress)
- ✅ Badge system definition (50+ achievements)

### What Loveable Builds
- ✅ Android app structure (MVVM + Hilt)
- ✅ Jetpack Compose UI (all 10 screens)
- ✅ Room database + DAOs
- ✅ ViewModel logic (state management)
- ✅ Speech integration
- ✅ API calls (Claude + local)
- ✅ Permissions & security
- ✅ Testing

---

## App Specifications

### 1. Core Features

#### A. Voice Conversation (Seamless Loop)
```
User speaks → [pause, silence detection] → Process → Call Claude API / Local AI
→ Get warm reaction + follow-up question → Priya speaks (slow, clear Indian voice)
→ 750ms pause between reaction & question → Automatic mic activation → Repeat
```

**Voice Settings**:
- **Recognition**: `en-IN` (Indian English)
- **Synthesis**: Female voice, rate 0.80–0.84 (very slow for kids), pitch 1.05 (warm)
- **Pause tolerance**: 4.5 seconds of silence before finalizing input
- **Interim display**: Show live transcript as child speaks (dashed purple border)

#### B. 5 Conversation Modes
1. **Daily Chat** 💬 — casual talk about daily life, school, friends, family
2. **Story Builder** 📖 — collaborative storytelling (back & forth turns)
3. **Role Play** 🎭 — child becomes a character (doctor, astronaut, chef, cricketer)
4. **Vocabulary Quest** 🏆 — learning words through natural conversation
5. **Share Ideas** 🤔 — opinion-based questions (reasoning, preferences)

Each mode has 50 prompts per level (200+ total across 4 levels).

#### C. 4-Level Progression
- **Level 1 — Beginner** (age 5–6): 1–3 word answers
- **Level 2 — Basic Speaker** (age 7–8): 4–8 word sentences
- **Level 3 — Intermediate** (age 9–10): 2–4 sentence narratives
- **Level 4 — Advanced** (age 11–12): Complex reasoning & storytelling

Auto-level-up based on composite score (grammar 25% + vocab 25% + fluency 25% + creativity 15% + confidence 10%).

#### D. Session Reports (Beautiful Modal)
After every chat, show a detailed report card:
- **Rating emoji + headline**: "🌟 Superstar!" / "🎉 Great Job!" / "👍 Well Done!" / "💪 Keep Going!"
- **Star Moment**: Quote the best thing the child said
- **What You Did Well**: 3 specific praise points
- **Score Bars**: Grammar, Vocabulary, Fluency, Creativity (0–100%, animated)
- **Next Time Tip**: Gentle improvement suggestion
- **Parent Note**: 2-sentence summary for parents
- **Buttons**: "Practice Again!" or "Go Home"
- **Spoken Summary**: Priya congratulates the child by voice

#### E. Gamification
- **Daily Challenge**: New challenge each day (specific mode, +XP reward)
- **Streak**: 🔥 Days practiced in a row
- **Badges**: 50+ achievements across 9 categories
- **Word of the Day**: New vocabulary with meaning + pronunciation
- **XP & Tiers**: Starter → Bronze → Silver → Gold

#### F. Parent Dashboard
- Child progress overview (total words, speaking time, current level)
- Weekly conversation heatmap (7-day chart)
- Recent conversation history (last 10)
- Vocabulary learned (grid view)
- Grade breakdown (Grammar, Vocab, Fluency, Creativity)
- Settings: Claude API key, data export, clear all

---

### 2. Topic-Aware Conversation Engine (Critical Feature)

**Problem**: Random prompt selection makes conversations feel robotic.
**Solution**: Track conversation topic + entities, generate contextual follow-ups.

**Architecture**:
```
ConversationContext {
    currentTopic: "cricket"          // Detected from child's last answer
    entities: ["friend", "park"]     // Objects/people/places mentioned
    turnsOnTopic: 2                  // How many turns on this topic
    topicChangeTurn: 5               // When to switch (3–6 turns)
}
```

**When Claude API is Available**:
- Pass `ConversationContext` to Claude system prompt
- Claude detects topic + decides whether to continue or transition
- Claude response includes: `topicDetected`, `entitiesDetected`, `shouldChangeTopic`
- Update context with response data

**When Claude API is NOT Available (Local Fallback)**:
- Detect topic from child's speech (15+ topics: cricket, football, dogs, school, family, food, etc.)
- Pick follow-up questions from topic-specific pools (not random)
- Use warm Indian reactions ("Wah, shabash!", "Ekdum nice!", "Arre, wonderful!")
- Same conversation flow

**Topic Follow-Up Database** (hardcoded in app):
```
cricket → ["Who do you play with?", "What position?", "Favourite player?", ...]
dogs → ["Dog's name?", "Games you play?", "Where play?", ...]
school → ["Favourite subject?", "Best friend?", "Lunch food?", ...]
food → ["Favourite food?", "Who cooks best?", "Can you cook?", ...]
[15+ more topics]
```

---

### 3. AI Analysis Engine

**Input**: Child's spoken text (string)
**Output**: Analysis object with scores

```kotlin
data class AnalysisResult(
    val grammar: GrammarAnalysis,         // Irregular verbs, subject-verb, articles, etc.
    val vocabulary: VocabularyAnalysis,   // Unique words, diversity, advanced words
    val fluency: FluencyAnalysis,         // Sentences, sentence length, filler words
    val creativity: CreativityAnalysis,   // Descriptive words, creative words, storytelling
    val composite: Double                 // Weighted average (0–1)
)
```

**Grammar Checks** (Rule-based):
- Irregular past tense (`"goed"` → `"went"`)
- Subject-verb agreement (`"he are"` → `"he is"`)
- Articles (`"a apple"` → `"an apple"`)
- Capitalization of "I"
- Double negatives

**Vocabulary Scoring**:
- Unique word ratio (diversity)
- Advanced/new words (not in common word list)
- Word count (length indicator)

**Fluency Scoring**:
- Sentence count
- Average sentence length
- Filler word usage (um, uh, like, you know)

**Creativity Scoring**:
- Creative words used ("imagine", "magic", "dream", "adventure", etc.)
- Descriptive words ("beautiful", "mysterious", "fantastic", etc.)
- Overall verbosity

**Composite Score**: Weighted average
```
(grammar×0.25) + (vocab×0.25) + (fluency×0.25) + (creativity×0.15) + (confidence×0.10)
```

---

### 4. Claude API Integration

**Model**: `claude-sonnet-4-6`
**Endpoint**: `https://api.anthropic.com/v1/messages`
**Max Tokens**: 450

**System Prompt** (dynamic, includes):
- Child's profile (name, age, class, school, city)
- Current level + conversational style for that level
- Conversation mode (daily_chat, story_builder, etc.)
- Conversation context (current topic, entities, turn count)
- Instruction to respond as Priya (warm, patient, curious)
- Instruction for response format (JSON with reaction, followUpQuestion, topicDetected, etc.)

**Input** (to Claude):
```
- Child's spoken text
- Grammar analysis hints (if errors detected)
- Fluency analysis hints (if very short/long)
- Conversation history (last 7 exchanges = 14 messages)
- Conversation context
```

**Output** (from Claude):
```json
{
  "reaction": "That is so cool!",
  "followUpQuestion": "What position do you play?",
  "topicDetected": "cricket",
  "entitiesDetected": ["friend", "park"],
  "shouldChangeTopic": false,
  "correction": {
    "original": "I goed",
    "corrected": "I went",
    "hint": "Past tense of 'go' is 'went'"
  }
}
```

**Error Handling**:
- API key invalid → show error in Settings, fallback to local AI
- Network error → retry with exponential backoff, then fallback
- API rate limit → cache responses, use local AI
- Malformed response → parse with fallback to default response

---

### 5. Data Model (Room Database)

```kotlin
// Parent account
@Entity(tableName = "parents")
data class Parent(
    @PrimaryKey val id: String,
    val name: String,
    val email: String,
    @ColumnInfo(name = "password_hash") val passwordHash: String,
    val createdAt: Long
)

// Child profile
@Entity(tableName = "children")
data class Child(
    @PrimaryKey val id: String,
    val parentId: String,  // FK to parents
    val name: String,
    val age: Int,
    val class: String,    // "KG", "1", "2", ..., "7"
    val school: String,
    val city: String,
    val avatar: String,   // "🦊", "🐶", etc.
    val interests: List<String>,  // JSON string or separate table
    val currentLevel: Int,  // 1–4
    val createdAt: Long,
    @ForeignKey(entity = Parent::class, parentColumns = ["id"], childColumns = ["parentId"])
    val parentIdRef: String
)

// Conversation session
@Entity(tableName = "conversations")
data class Conversation(
    @PrimaryKey val id: String,
    val childId: String,  // FK
    val mode: String,     // "daily_chat", "story_builder", etc.
    val startedAt: Long,
    val endedAt: Long,
    val durationSeconds: Int,
    @Ignore val messages: List<Message>,  // Stored as JSON blob
    val messagesJson: String,  // JSON serialized
    val wordCount: Int,
    @Ignore val analysisScores: List<AnalysisScore>,
    val scoresJson: String,  // JSON serialized
    @ForeignKey(entity = Child::class, parentColumns = ["id"], childColumns = ["childId"])
    val childIdRef: String
)

data class Message(
    val role: String,  // "child", "mentor"
    val content: String,
    val timestamp: Long,
    val followUpQuestion: String? = null
)

data class AnalysisScore(
    val grammar: Double,
    val vocabulary: Double,
    val fluency: Double,
    val creativity: Double
)

// Daily progress
@Entity(tableName = "progress")
data class ProgressEntry(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val childId: String,
    val date: String,  // "2026-03-30"
    val conversationsCount: Int,
    val totalWords: Int,
    val speakingTimeSeconds: Int,
    val avgGrammar: Double,
    val avgVocab: Double,
    val avgFluency: Double,
    val avgCreativity: Double,
    @ForeignKey(entity = Child::class, parentColumns = ["id"], childColumns = ["childId"])
    val childIdRef: String
)

// Vocabulary learned
@Entity(tableName = "vocabulary")
data class VocabularyWord(
    @PrimaryKey val id: String,
    val childId: String,
    val word: String,
    val context: String,  // Sentence context where learned
    val mastery: Int,     // 1–5 stars
    val learnedAt: Long,
    val lastReviewedAt: Long,
    @ForeignKey(entity = Child::class, parentColumns = ["id"], childColumns = ["childId"])
    val childIdRef: String
)

// Badge earned
@Entity(tableName = "badges_earned")
data class BadgeEarned(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val childId: String,
    val badgeId: String,  // e.g., "first_chat", "7day_streak"
    val earnedAt: Long,
    @ForeignKey(entity = Child::class, parentColumns = ["id"], childColumns = ["childId"])
    val childIdRef: String
)
```

---

## User Flows

### Registration Flow
```
Welcome Screen
  → [CTA: "Let's Get Started!"]
    → Registration Step 1: Parent Details
      → Name, Email, Password
      → [Next]
        → Registration Step 2: Child Profile
          → Name, Age, Class, School, City
          → [Next]
            → Registration Step 3: Interests & Avatar
              → Multi-select interests (min 3)
              → Pick avatar (9 options)
              → [Complete Registration] → Confetti + toast
                → Home Screen (auto-navigate after 1.2s)
```

### Chat Flow
```
Home Screen [Pick a mode]
  → Chat Screen
    → [Get opening question from Claude or Prompts]
    → Priya speaks question
    → Mic auto-activates ("🎤 Listening...")
    → Child speaks (interim transcript appears in dashed bubble)
    → [Silence 4.5s] → Finalize input
    → Show child's message bubble
    → Set mic state to "⏳ Thinking..."
    → Call Claude API (pass history + context)
    → Parse response
    → Update conversation context
    → Show Priya's reaction message
    → [Show tiny correction chip if grammar error]
    → Show Priya's follow-up question message
    → Priya speaks: "reaction → [750ms pause] → question"
    → [onDone callback] → Mic auto-activates again
    → [Loop repeats until user taps back button]

User taps back
  → Stop mic + stop TTS
  → Show session report modal (slide up from bottom)
    → [Loading state while Claude generates summary]
    → Display: Rating + headline + star moment + praise + scores + tip + parent note
    → Priya reads spoken summary aloud
    → User taps "Practice Again!" or "Go Home"
      → If "Again": restart chat with same mode
      → If "Home": navigate to Home Screen, dismiss modal
```

---

## UI Color Scheme

```
Primary Purple:      #6C5CE7  (buttons, actions, Priya's avatar ring, progress bars)
Cyan Accent:         #00D2D3  (highlights, vocabulary, secondary accents)
Orange/Warm:         #FF9F43  (fluency score, encouragement, tertiary action)
Pink/Playful:        #FF9FF3  (creativity, story builder mode, playfulness)
Red/Energy:          #FF6B6B  (creativity score, badges, highlights)
Gold/Reward:         #FECA57  (XP, badges, rewards, milestones)

Background:          #FFFFFF (light mode) / #121212 (dark mode, optional)
Text Primary:        #1A1A1A (light mode) / #FFFFFF (dark mode)
Text Secondary:      #666666 (light mode) / #B0B0B0 (dark mode)
Border:              #EEEEEE (light mode) / #333333 (dark mode)
```

---

## Screens to Implement (10 Total)

| # | Screen | Key Components | Complexity |
|---|--------|-----------------|------------|
| 1 | **Splash** | Logo + loader (2s) | Low |
| 2 | **Welcome** | Mascot + feature cards + CTA | Low |
| 3 | **Register** | 3-step form (parent → child → interests) | Medium |
| 4 | **Login** | Email + password form | Low |
| 5 | **Home** | Greeting + stats + streak + WoD + challenge + activity | Medium |
| 6 | **Chat** ⭐ | Messages + mic + status bar + interim bubbles | HIGH |
| 7 | **Report** | Modal with rating + praise + scores + summary | Medium |
| 8 | **Progress** | Level progress + score rings + vocab + mode breakdown | Medium |
| 9 | **Badges** | Grid of badges + XP tier + progress to next | Medium |
| 10 | **Dashboard** | Parent stats + weekly chart + history | Medium |
| 11 | **Settings** | Profile + API key input + data management | Low |

**⭐ Chat Screen** is the most complex — voice loop, state management, async speech, message rendering, interim updates.

---

## Technical Requirements

### Android SDK
- **Min SDK**: API 28 (Android 9.0) — supports modern Android APIs + Play Store requirements
- **Target SDK**: API 35 (Android 15, latest)
- **Devices**: Phones + tablets (portrait + landscape orientation)

### Dependencies (Recommended)
```gradle
// Jetpack Compose
androidx.compose:compose-bom:2026.02.00
androidx.activity:activity-compose:1.9.0

// Jetpack & Architecture
androidx.lifecycle:lifecycle-viewmodel-compose:2.8.0
androidx.lifecycle:lifecycle-runtime-compose:2.8.0
androidx.hilt:hilt-navigation-compose:1.2.0

// Room Database
androidx.room:room-runtime:2.6.1
androidx.room:room-compiler:2.6.1

// HTTP & JSON
com.squareup.okhttp3:okhttp:4.12.0
com.squareup.retrofit2:retrofit:2.10.0
com.squareup.retrofit2:converter-gson:2.10.0

// Dependency Injection
com.google.dagger:hilt-android:2.49
com.google.dagger:hilt-compiler:2.49

// Material Design 3
androidx.compose.material3:material3:1.2.1

// Cryptography (for API key encryption)
androidx.security:security-crypto:1.1.0-alpha06

// Coroutines
org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0

// Testing
junit:junit:4.13.2
androidx.test.espresso:espresso-core:3.6.1
```

### Permissions (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Runtime Permissions (Android 6.0+)
Request RECORD_AUDIO at runtime before first chat session.

---

## Success Criteria

1. ✅ **Seamless conversation loop** — voice in → process → TTS → auto-listen (no friction)
2. ✅ **Topic continuity** — Priya stays on same topic 3–6 turns (feels natural)
3. ✅ **Indian English voice** — slow (0.80–0.84), warm pitch (1.05), female
4. ✅ **Claude integration** — optional, fallback to local AI gracefully
5. ✅ **Beautiful UI** — Material Design 3, smooth animations, purple + cyan + gold colors
6. ✅ **Session reports** — detailed, personalized, parent-friendly
7. ✅ **4-level progression** — auto-level-up based on performance
8. ✅ **Gamification** — badges, streaks, XP, daily challenges
9. ✅ **Data persistence** — Room database, survives app restart
10. ✅ **Permissions** — graceful handling of microphone access

---

## Deliverables from Loveable

- ✅ Android APK (debug + release builds)
- ✅ Source code (Kotlin + Jetpack Compose)
- ✅ README with setup instructions
- ✅ Unit tests (>80% coverage for AI engine)
- ✅ API documentation (if any custom endpoints)
- ✅ Firebase configuration (if analytics/crash reporting added)
- ✅ Play Store submission guide (if intended for release)

---

## References

- **Web version source**: See `js/` folder (AI engine, prompts, speech, storage, badges)
- **Web version deployed**: Fully functional at `/index.html`
- **Project brief**: See `LOVEABLE_PROJECT_BRIEF.md`
- **Technical architecture**: See `TECHNICAL_ARCHITECTURE.md`

---

## Contact & Questions

**For clarifications on**:
- Conversation flow
- AI analysis engine logic
- Prompt database
- UI specifications
- Data model

Refer to the attached documents or ask directly — we're available to answer any questions.

---

**Ready to build! Let's make English learning fun for Indian kids. 🎤✨**

*Last updated: March 30, 2026*
*Status: Ready for development handoff*
