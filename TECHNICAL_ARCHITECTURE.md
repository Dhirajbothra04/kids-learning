# 🏗️ SpeakBuddy Technical Architecture — Web to Android Migration Guide

## Current Web Architecture

### Stack
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Storage**: Browser localStorage
- **Voice I/O**: Web Speech API
- **AI**: Claude Sonnet 4.6 (optional) + Rule-based local engine

### File Structure
```
index.html                  # Single-page app (all screens in one HTML)
css/
  ├─ design-system.css      # Variables, colors, typography
  ├─ components.css         # 39KB of component styles
  └─ supplement.css         # Chat UI, report cards, animations
js/
  ├─ speech.js             # Voice recognition + text-to-speech (4.2KB)
  ├─ storage.js            # localStorage abstraction (3.8KB)
  ├─ app.js                # Main controller, 1000+ lines
  ├─ ai-engine.js          # Rule-based grammar/vocab analysis + local responses
  ├─ claude-ai.js          # Claude API wrapper + context tracking
  ├─ prompts.js            # 200+ conversation prompts (4 levels × 5 modes)
  ├─ badges.js             # Badge system, XP tracking
  └─ daily-learning.js     # Word of the Day, Daily Challenge
```

### Key Design Patterns

1. **Singleton Pattern** (Global objects)
   - `App` — main controller
   - `Speech` — voice I/O
   - `Storage` — data persistence
   - `ClaudeAI` — API wrapper
   - `AIEngine` — local analysis
   - `Prompts` — prompt database

2. **Observer Pattern**
   - Speech callbacks: `onResult`, `onInterim`, `onError`, `onEnd`
   - Async flows use callbacks and Promises

3. **State Management**
   - Global `App` object holds session state
   - `currentSession` tracks conversation
   - `conversationContext` tracks topic/entities/turns

---

## Migration Strategy: Web → Android (Kotlin/Jetpack Compose)

### 1. Core Modules to Migrate "As-Is"

#### **speech.js → `SpeechManager.kt`**
```kotlin
class SpeechManager {
    fun init()                          // Initialize recognition
    fun startListening()                // Start recording
    fun stopListening()                 // Stop, finalize
    fun speak(text, onDone)             // TTS
    fun speakTwoParts()                 // Reaction + pause + question

    // Callbacks
    var onResult: (String) -> Unit
    var onInterim: (String) -> Unit
    var onError: (String) -> Unit
    var onEnd: () -> Unit

    // Pause tolerance: 4.5 seconds
    private var pauseTimer: Timer? = null
    private var accumulatedText = ""
}
```

**Android Native APIs**:
- `android.speech.SpeechRecognizer` for voice input
- `android.speech.tts.TextToSpeech` for voice output
- No Web Speech API — use native Android equivalents

---

#### **storage.js → `DataRepository.kt` (Room + SharedPreferences)**
```kotlin
// Room database entities
@Entity data class Parent(...)
@Entity data class Child(...)
@Entity data class Conversation(...)
@Entity data class ProgressEntry(...)
@Entity data class Badge(...)
@Entity data class VocabularyWord(...)

// DAOs
@Dao interface ParentDao { ... }
@Dao interface ChildDao { ... }
@Dao interface ConversationDao { ... }

// Repository pattern
class DataRepository(
    private val parentDao: ParentDao,
    private val childDao: ChildDao,
    // ... other DAOs
) {
    fun saveParent(parent: Parent)
    fun getChild(): Child?
    fun saveConversation(session: Conversation)
    fun getConversations(): List<Conversation>
    fun saveProgress(entry: ProgressEntry)
    // ... etc (replicate all storage.js methods)
}
```

**Key difference**: Replace localStorage with Room database + SharedPreferences for settings.

---

#### **ai-engine.js → `AIEngine.kt`**
```kotlin
object AIEngine {
    // Copy all grammar rules, vocabulary analysis, creativity scoring

    fun analyzeSpeech(text: String, level: Int): AnalysisResult {
        // Grammar analysis
        // Vocabulary analysis
        // Fluency analysis
        // Creativity analysis
        return AnalysisResult(...)
    }

    fun generateFeedback(text: String, analysis: AnalysisResult): Feedback {
        // Same logic as web version
    }

    // NEW: Context-aware fallback (added in latest web version)
    fun generateContextualResponse(
        text: String,
        analysis: AnalysisResult,
        child: Child,
        mode: String,
        context: ConversationContext
    ): Response {
        // Detect topic, use topic-specific follow-ups
    }

    // Topic detection database
    private val topicFollowUps = mapOf(
        "cricket" to listOf("Who do you play with?", "What position?", ...),
        "dog" to listOf("What's the name?", "What games?", ...),
        // ... 15+ more
    )
}
```

**No changes needed** — logic is language-agnostic. Copy methods directly.

---

#### **claude-ai.js → `ClaudeAIManager.kt`**
```kotlin
class ClaudeAIManager(private val httpClient: OkHttpClient) {
    companion object {
        private const val MODEL = "claude-sonnet-4-6"
        private const val API_URL = "https://api.anthropic.com/v1/messages"
    }

    private val sharedPref: SharedPreferences // Store API key

    fun getApiKey(): String = sharedPref.getString("claude_key", "") ?: ""
    fun saveApiKey(key: String)
    fun isConfigured(): Boolean = getApiKey().startsWith("sk-ant-")

    suspend fun generateMentorResponse(
        childText: String,
        analysis: AnalysisResult,
        child: Child,
        mode: String,
        history: List<Message>,
        context: ConversationContext
    ): Response? {
        // Build system prompt
        // Call Claude API via OkHttp/Retrofit
        // Parse JSON response
        // Return Response object
    }

    suspend fun generateSessionSummary(
        child: Child,
        mode: String,
        messages: List<Message>,
        scores: List<Score>,
        durationSeconds: Int
    ): SessionSummary? {
        // Similar to web version
    }
}
```

**Key changes**:
- Use `OkHttp` + `Retrofit` for HTTP (instead of fetch API)
- Use Kotlin `suspend` functions for async
- Use `SharedPreferences` for API key storage

---

#### **prompts.js → `PromptsDatabase.kt`**
```kotlin
object PromptsDatabase {
    data class PromptMode(val name: String, val icon: String, val color: String)

    val LEVEL_NAMES = mapOf(1 to "Beginner", 2 to "Basic Speaker", ...)
    val MODE_INFO = mapOf(
        "daily_chat" to PromptMode("Daily Chat", "💬", "#6C5CE7"),
        "story_builder" to PromptMode("Story Builder", "📖", "#FF9FF3"),
        // ... 5 modes
    )

    val database = mapOf(
        1 to mapOf(  // Level 1
            "daily_chat" to listOf("What is your name?", "How old are you?", ...),
            "story_builder" to listOf(...),
            // ... 5 modes
        ),
        2 to mapOf(...),  // Level 2
        3 to mapOf(...),  // Level 3
        4 to mapOf(...)   // Level 4
    )

    fun getPrompt(level: Int, mode: String): String { ... }
    fun getUniquePrompt(level: Int, mode: String, used: List<String>): String { ... }
}
```

**No logic changes** — just migrate data structures.

---

### 2. UI Migration: HTML/CSS → Jetpack Compose

#### Screen Components
Map each HTML screen to a Compose `@Composable`:

| Web Screen | Compose Screen |
|-----------|----------------|
| splash-screen | `SplashScreen()` |
| welcome-screen | `WelcomeScreen()` |
| register-screen | `RegistrationScreen()` (3 steps via state) |
| login-screen | `LoginScreen()` |
| home-screen | `HomeScreen()` |
| chat-screen | `ChatScreen()` (most complex) |
| progress-screen | `ProgressScreen()` |
| dashboard-screen | `DashboardScreen()` |
| badges-screen | `BadgesScreen()` |
| settings-screen | `SettingsScreen()` |

#### Chat Screen (Most Complex)
```kotlin
@Composable
fun ChatScreen(
    viewModel: ChatViewModel,
    onBack: () -> Unit
) {
    Box(Modifier.fillMaxSize()) {
        Column {
            // Header: Mode icon + timer
            ChatHeader(
                mode = viewModel.currentMode,
                timerSeconds = viewModel.sessionSeconds
            )

            // Messages list
            LazyColumn(
                modifier = Modifier.weight(1f),
                state = viewModel.messageListState
            ) {
                items(viewModel.messages) { msg ->
                    when (msg.role) {
                        "child" -> ChildMessageBubble(msg.content)
                        "mentor" -> MentorMessageBubble(msg.content)
                    }
                    if (viewModel.showTyping && msg == viewModel.messages.last()) {
                        TypingIndicator()
                    }
                }
            }

            // Mic + status bar
            ChatInputArea(
                state = viewModel.micState,
                onMicClick = { viewModel.toggleMic() },
                onTextSend = { text -> viewModel.sendTextMessage(text) },
                statusMessage = viewModel.statusMessage
            )
        }
    }
}
```

**Color Palette Translation** (CSS → Compose):
```kotlin
object SpeakBuddyTheme {
    val colorPrimary = Color(0xFF6C5CE7)
    val colorCyan = Color(0xFF00D2D3)
    val colorOrange = Color(0xFFFF9F43)
    val colorPink = Color(0xFFFF9FF3)
    val colorGold = Color(0xFFFECA57)

    // Material 3 color scheme
    val darkScheme = darkColorScheme(
        primary = colorPrimary,
        secondary = colorCyan,
        // ...
    )
}
```

---

### 3. State Management: App Controller → ViewModel + StateFlow

**Web Version** (current):
```javascript
const App = {
    currentSession: null,
    conversationContext: null,
    isProcessing: false,
    // ... 50+ properties + methods mixed together
    async processChildInput(text) { ... },
    showSessionReport(child, session) { ... },
    // ... etc
}
```

**Android Version** (recommended):
```kotlin
@HiltViewModel
class ChatViewModel @Inject constructor(
    private val speechManager: SpeechManager,
    private val dataRepository: DataRepository,
    private val claudeAIManager: ClaudeAIManager,
    private val aiEngine: AIEngine
) : ViewModel() {

    // Immutable state exposed to Compose
    private val _currentMode = MutableStateFlow("daily_chat")
    val currentMode = _currentMode.asStateFlow()

    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages = _messages.asStateFlow()

    private val _isProcessing = MutableStateFlow(false)
    val isProcessing = _isProcessing.asStateFlow()

    private val _sessionSeconds = MutableStateFlow(0)
    val sessionSeconds = _sessionSeconds.asStateFlow()

    private val _micState = MutableStateFlow("idle") // idle, listening, speaking, thinking
    val micState = _micState.asStateFlow()

    private var currentSession: ChatSession? = null
    private var conversationContext: ConversationContext? = null

    fun startChat(mode: String) {
        viewModelScope.launch {
            // Initialize session, context, start timer, get opening greeting
        }
    }

    fun processChildInput(text: String) {
        viewModelScope.launch {
            _isProcessing.value = true
            // Call Claude / AIEngine
            // Update messages & context
            // Trigger TTS
            _isProcessing.value = false
        }
    }

    fun toggleMic() {
        // Smart mic logic
    }

    fun endChat() {
        // Save session, show report, navigate home
    }
}
```

**Benefits**:
- Testable (no static global state)
- Lifecycle-aware (survives configuration changes)
- Reactive (UI updates via Flow subscriptions)

---

### 4. Async Flow: Callbacks → Coroutines + Suspend Functions

**Web** (callback hell):
```javascript
Speech.start(
    (transcript) => {
        this.processChildInput(transcript);
    },
    (interim) => {
        this.updateInterimMessage(interim);
    },
    (errMsg) => {
        this.showChatStatus(errMsg, 'error');
    },
    () => {
        this.setMicState('idle');
    }
);
```

**Android** (coroutines):
```kotlin
viewModelScope.launch {
    try {
        val transcript = speechManager.startListening(
            onInterim = { interim ->
                _interimText.value = interim
            }
        )
        processChildInput(transcript)
    } catch (e: Exception) {
        _statusMessage.value = e.message ?: "Error"
    }
}
```

**Or with Flow for live updates**:
```kotlin
speechManager.interimText
    .collect { text ->
        _interimText.value = text
    }
```

---

### 5. Data Persistence: localStorage → Room + SharedPreferences

**Web**:
```javascript
Storage.saveParent({
    name: "Priya",
    email: "priya@example.com",
    password: "hashed",
    createdAt: new Date().toISOString()
});
```

**Android**:
```kotlin
// Kotlin data class
@Entity(tableName = "parents")
data class ParentEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val email: String,
    @ColumnInfo(name = "password_hash") val passwordHash: String,
    val createdAt: Long = System.currentTimeMillis()
)

// Insert via DAO
parentDao.insert(
    ParentEntity(
        name = "Priya",
        email = "priya@example.com",
        passwordHash = BCrypt.hashpw(password)
    )
)
```

**Settings (API key)**:
```kotlin
// SharedPreferences
sharedPref.edit().putString("claude_api_key", "sk-ant-...").apply()
```

---

### 6. Speech Recognition: Web Speech API → Android SpeechRecognizer

**Web**:
```javascript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-IN';
recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            accumulatedText += event.results[i][0].transcript;
        } else {
            interim += event.results[i][0].transcript;
        }
    }
};
```

**Android**:
```kotlin
class SpeechManager @Inject constructor(
    private val context: Context
) {
    private val recognizer = SpeechRecognizer.createSpeechRecognizer(context)

    suspend fun startListening(
        onInterim: (String) -> Unit = {},
        onResult: (String) -> Unit = {},
        onError: (String) -> Unit = {}
    ): String = suspendCancellableCoroutine { continuation ->
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-IN")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }

        recognizer.setRecognitionListener(object : RecognitionListener {
            override fun onPartialResults(partialResults: Bundle?) {
                val partial = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull() ?: ""
                onInterim(partial)
            }

            override fun onResults(results: Bundle?) {
                val text = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull() ?: ""
                continuation.resume(text)
            }

            override fun onError(error: Int) {
                val msg = when (error) {
                    SpeechRecognizer.ERROR_NO_MATCH -> "No speech detected"
                    SpeechRecognizer.ERROR_NETWORK -> "Network error"
                    else -> "Error: $error"
                }
                onError(msg)
                continuation.resume("")
            }

            override fun onReadyForSpeech(params: Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        recognizer.startListening(intent)
    }
}
```

---

### 7. Text-to-Speech: Web SpeechSynthesis → Android TextToSpeech

**Web**:
```javascript
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'en-IN';
utterance.rate = 0.80;
utterance.pitch = 1.05;
utterance.voice = selectedVoice; // Veena, Lekha, etc.
window.speechSynthesis.speak(utterance);
```

**Android**:
```kotlin
class TextToSpeechManager @Inject constructor(
    private val context: Context
) {
    private val tts = TextToSpeech(context) { status ->
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale("en", "IN")
            // Prefer female voice
            val voices = tts.voices.filter { it.name.contains("female", ignoreCase = true) }
            if (voices.isNotEmpty()) {
                tts.voice = voices.first()
            }
        }
    }

    fun speak(text: String, rate: Float = 0.80f, pitch: Float = 1.05f) {
        tts.setSpeechRate(rate)
        tts.setPitch(pitch)
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null)
    }

    fun speakTwoParts(part1: String, part2: String, onDone: () -> Unit = {}) {
        // Speak part1, wait 750ms, speak part2, then call onDone
        speak(part1)
        // Use handler to schedule part2
        Handler(Looper.getMainLooper()).postDelayed({
            speak(part2)
            tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onDone(utteranceId: String) {
                    onDone()
                }
                override fun onStart(utteranceId: String) {}
                override fun onError(utteranceId: String) {}
            })
        }, 750)
    }
}
```

---

## Implementation Roadmap

### Phase 1: Core Setup (Week 1–2)
- [ ] Project setup (Kotlin, Jetpack Compose, Hilt)
- [ ] Room database schema
- [ ] DataRepository implementation
- [ ] SpeechManager (recognition + synthesis)
- [ ] Basic authentication screens

### Phase 2: Chat & AI (Week 3–4)
- [ ] AIEngine migration
- [ ] ClaudeAIManager (API integration)
- [ ] ChatScreen UI + ViewModel
- [ ] Voice conversation loop
- [ ] Context tracking

### Phase 3: Reporting & Gamification (Week 5–6)
- [ ] Session report modal
- [ ] Progress screen with score rings
- [ ] Badge system
- [ ] Home screen

### Phase 4: Polish & Launch (Week 7–8)
- [ ] Settings screen
- [ ] Error handling
- [ ] Permissions (RECORD_AUDIO, INTERNET)
- [ ] Testing
- [ ] Android API level targeting (API 28+ recommended)

---

## Critical Considerations

### 1. **Permissions**
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### 2. **Offline Mode**
- Bundle all 200+ prompts in APK (~50KB JSON)
- Local SQLite for conversations
- Claude calls gracefully fallback to local engine

### 3. **Security**
- Never hardcode API keys in APK
- Use SharedPreferences with encryption (EncryptedSharedPreferences)
- Hash parent passwords with bcrypt or similar

### 4. **Performance**
- Lazy-load large data (vocabularies, badge icons)
- Use pagination for conversation history
- Pre-warm TTS voice on app start

### 5. **Localization**
- `en-IN` language for speech services
- Compose supports string resources (strings.xml)
- Consider RTL for future languages

---

## Testing Strategy

### Unit Tests
- AIEngine grammar/vocab analysis
- ClaudeAI response parsing
- Data persistence (Room)

### Integration Tests
- Speech recognition → processing → TTS
- Claude API (with mock responses)

### UI Tests
- Chat message flow
- Report card rendering
- Navigation transitions

### E2E Tests
- Full conversation loop (registration → chat → report)

---

## Conclusion

**Migration Complexity**: Medium
- **~60% of code** is language-agnostic (AI engine, prompts, data models)
- **~20% needs Android-specific ports** (Storage, Speech I/O, API calls)
- **~20% is pure UI redesign** (HTML/CSS → Jetpack Compose)

**Estimated effort**: 8–10 weeks for a production-ready Android app.

**Key Success Factors**:
1. Keep the seamless conversation loop (auto-listen after Priya speaks)
2. Maintain topic continuity (conversationContext tracking)
3. Preserve warm Indian English tone + slow speech rates
4. Native speech I/O (better than Web APIs)
5. Smooth animations (Compose makes this easy)

---

*Last updated: March 30, 2026*
*Ready for Loveable handoff*
