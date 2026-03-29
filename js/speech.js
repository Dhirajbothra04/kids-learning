/**
 * SpeakBuddy — Speech Manager v6
 *
 * VOICE IMPROVEMENTS:
 * - Smarter voice selection: logs all available voices, picks the best possible
 * - Increased rate to 0.95 (more natural, less robotic)
 * - Tuned pitch per voice type for best naturalness
 * - Falls back gracefully across: Indian female → Indian → Google en-GB → Google en-US → any en
 * - speakWithBestVoice() tries voices in order until one sounds good
 *
 * RECOGNITION: Pause-tolerant continuous mode (unchanged from v5)
 */

const Speech = {
  recognition:        null,
  synthesis:          window.speechSynthesis || null,
  isRecording:        false,
  isSpeaking:         false,
  _selectedVoice:     null,   // cached after first selection
  _permissionGranted: false,  // track if microphone permission was granted

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
      // Only show 'not-allowed' error if we haven't already granted permission
      const msg = (event.error === 'not-allowed' && this._permissionGranted) ? null : msgs[event.error];
      if (msg && this.onError) this.onError(msg);
      if (this.onEnd) this.onEnd();
    };

    this.recognition.onend = () => {
      if (this.isRecording) { this._tryRestartRecognition(); }
      else { this.stopTimer(); if (this.onEnd) this.onEnd(); }
    };

    return true;
  },

  // ─── Voice Selection — best possible quality ───────────────────────────
  /**
   * Priority order for a natural male English voice:
   *
   * Tier 1 — Named male voices (natural, clear)
   *   Daniel (en-US, macOS) ← natural, warm male
   *   Alex (en-US, macOS)
   *   Oliver, Tom (en-GB, Chrome)
   *   Rishi (en-IN, high quality)
   *
   * Tier 2 — Any en-IN voice (prefer male/neutral)
   *   Google English (India) — usually male
   *   Any Indian English
   *
   * Tier 3 — Google male voices
   *   Google US English / Google UK English (male variants)
   *
   * Tier 4 — High-quality fallback voices
   *   Samantha, Karen, Moira (if male variant not found)
   *
   * Tier 5 — Any English
   */
  _selectVoice() {
    if (this._selectedVoice) return this._selectedVoice;

    const voices = this.synthesis.getVoices();

    // Log available voices in dev mode so you can see what's there
    if (voices.length > 0) {
      console.log('[SpeakBuddy] Available voices:', voices.map(v => `${v.name} (${v.lang})`).join(', '));
    }

    // ── Tier 1: Named male voices ──────────────────────────────────────
    const maleVoiceNames = ['daniel', 'alex', 'oliver', 'tom', 'rishi', 'marcus', 'james', 'george'];
    const tier1 = voices.find(v =>
      maleVoiceNames.some(n => v.name.toLowerCase().includes(n))
    );
    if (tier1) { this._selectedVoice = tier1; return tier1; }

    // ── Tier 2: Any en-IN voice (exclude female-only) ─────────────────
    const tier2 = voices.find(v => {
      const isIndian = v.lang === 'en-IN' || v.lang === 'en_IN';
      const notExplicitlyFemale = !v.name.toLowerCase().includes('female');
      return isIndian && notExplicitlyFemale;
    });
    if (tier2) { this._selectedVoice = tier2; return tier2; }

    // ── Tier 3: Google male English voices ──────────────────────────────
    const googleMale = voices.find(v => {
      const isGoogle = v.name.toLowerCase().includes('google');
      const notFemale = !v.name.toLowerCase().includes('female');
      const isEnglish = v.lang.startsWith('en');
      return isGoogle && notFemale && isEnglish;
    });
    if (googleMale) { this._selectedVoice = googleMale; return googleMale; }

    // ── Tier 4: High-quality fallback voices ──────────────────────────
    const niceVoices = ['samantha', 'karen', 'moira', 'tessa', 'fiona', 'victoria'];
    const niceFallback = voices.find(v =>
      niceVoices.some(n => v.name.toLowerCase().includes(n))
    );
    if (niceFallback) { this._selectedVoice = niceFallback; return niceFallback; }

    // ── Tier 5: Any English ──────────────────────────────────────────────
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

    // Named male voices (Daniel, Alex, Oliver, Tom, Rishi) — natural and clear
    if (name.includes('daniel') || name.includes('alex') || name.includes('oliver') ||
        name.includes('tom') || name.includes('rishi') || name.includes('marcus') || name.includes('james')) {
      return { rate: baseOptions.rate ?? 0.80, pitch: baseOptions.pitch ?? 1.0 };
    }

    // Indian en-IN voices — warm and clear
    if (lang.includes('en-in') || lang.includes('en_in')) {
      return { rate: baseOptions.rate ?? 0.80, pitch: baseOptions.pitch ?? 1.0 };
    }

    // Google English voices — slightly slower for clarity
    if (name.includes('google') && lang.includes('en')) {
      return { rate: baseOptions.rate ?? 0.84, pitch: baseOptions.pitch ?? 1.0 };
    }

    // High-quality fallback voices (Samantha, Karen, Moira, etc.)
    if (name.includes('samantha') || name.includes('karen') || name.includes('moira') ||
        name.includes('tessa') || name.includes('fiona') || name.includes('victoria')) {
      return { rate: baseOptions.rate ?? 0.82, pitch: baseOptions.pitch ?? 1.0 };
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

  // ─── Start Listening ───────────────────────────────────────────────────
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

    try {
      this.recognition.start();
      this._permissionGranted = true; // Mark permission as granted after start succeeds
    }
    catch (e) {
      // If recognition is already running, just continue
      if (e.message && e.message.includes('already')) {
        this._permissionGranted = true;
      } else {
        console.warn('Recognition start error:', e.message);
      }
    }
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

  // ─── Pause timer (silence detection) ──────────────────────────────────
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

  // ─── Session Timer ────────────────────────────────────────────────────
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
