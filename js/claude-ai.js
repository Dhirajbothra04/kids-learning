/**
 * SpeakBuddy — Claude AI Integration v3
 *
 * MAJOR UPGRADE: Contextual, topic-based conversation engine.
 *
 * The conversation now works like a real chat:
 * - Priya stays on the SAME topic for 3–6 turns
 * - She asks follow-up questions using entities from the child's answers
 *   (objects, people, places, actions she heard)
 * - She transitions topics naturally using the child's own words
 * - She adapts follow-up depth to the child's English level
 * - Full conversation context is maintained in each API call
 */

const ClaudeAI = {
  MODEL:   'claude-sonnet-4-6',
  API_URL: 'https://api.anthropic.com/v1/messages',

  getApiKey()     { return localStorage.getItem('speakbuddy_claude_key') || ''; },
  saveApiKey(k)   { localStorage.setItem('speakbuddy_claude_key', k.trim()); },
  removeApiKey()  { localStorage.removeItem('speakbuddy_claude_key'); },
  isConfigured()  { return this.getApiKey().startsWith('sk-ant-'); },

  // ─── System Prompt ────────────────────────────────────────────────────────
  buildSystemPrompt(child, mode, conversationContext) {
    const modeCtx = {
      daily_chat:       'casual warm conversation about the child\'s day, school, friends, family, and daily life in India',
      story_builder:    'collaborative storytelling — build a creative story together turn by turn',
      role_play:        'fun role-play — the child is acting as a chosen character',
      vocabulary_quest: 'vocabulary building through natural conversation — weave the target word into discussion',
      opinion_mode:     'opinion-sharing conversation — help the child reason and express their views',
    };

    const levelGuide = {
      1: `BEGINNER (Level 1): Child answers in 1–3 words. 
- Ask simple yes/no questions or single-concept questions: "Do you like dogs?" "What colour is it?"
- Celebrate even one-word answers with great enthusiasm
- Follow-up should be a tiny step forward, e.g. if child says "dog" ask "What is your dog's name?"`,

      2: `BASIC SPEAKER (Level 2): Child speaks in short sentences (4–8 words).
- Ask questions inviting one or two sentences: "Tell me about your dog." "What do you do after school?"
- Gently push for a little more: "That is nice! Tell me one more thing about it."`,

      3: `INTERMEDIATE (Level 3): Child can describe and narrate (2–4 sentences).
- Ask for details, descriptions, mini-stories: "Tell me exactly what happened." "Describe what it looked like."
- Use "Why" and "How" questions to encourage thinking.`,

      4: `ADVANCED (Level 4): Child can reason and explain (4+ sentences).
- Ask opinion, reasoning, and hypothetical questions: "Why do you think that?" "What would you do differently?"
- Challenge them to give reasons and imagine scenarios.`,
    };

    const level     = child.currentLevel || 1;
    const interests = child.interests?.join(', ') || 'cricket, drawing, animals';

    // Build context summary from conversation so far
    const ctx = conversationContext;
    let contextBlock = '';
    if (ctx && ctx.currentTopic) {
      contextBlock = `
CURRENT CONVERSATION CONTEXT:
- Current topic: ${ctx.currentTopic}
- Entities heard from child: ${ctx.entities.join(', ') || 'none yet'}
- Turns on this topic: ${ctx.turnsOnTopic} (stay on same topic for 3–6 turns total)
- Topic should change after turn ${ctx.topicChangeTurn}
${ctx.turnsOnTopic >= ctx.topicChangeTurn ? '- ⚠️ TIME TO TRANSITION: smoothly change topic using child\'s last answer as a bridge.' : '- ✅ STAY ON CURRENT TOPIC and ask a follow-up question about it.'}`;
    }

    return `You are Priya — a warm, patient AI English mentor for Indian children. You talk exactly like a friendly elder didi (big sister) — genuinely curious, encouraging, and fun.

CHILD PROFILE:
Name: ${child.name} | Age: ${child.age} | Class: ${child.class} | School: ${child.school || 'school'} | City: ${child.city || 'India'}
Level: ${levelGuide[level]}
Interests: ${interests}
${contextBlock}

═══ CONVERSATIONAL RULES — THIS IS THE MOST IMPORTANT PART ═══

1. STAY ON TOPIC — ask follow-up questions about what the child JUST said
   - Extract what the child mentioned: objects, people, places, actions, feelings
   - Ask about THOSE specific things — not new random topics
   - Example: child says "I like cricket" → ask "Who do you play cricket with?"
   - Example: child says "I went to park with my dog" → ask "What is your dog's name?"

2. DEEP DIVE on each topic for 3–6 turns before moving on
   Bad: Q1: "What sport do you like?" → Q2: "What is your favourite food?"  (jumping topics — WRONG)
   Good: Q1: "What sport?" → Q2: "Who do you play with?" → Q3: "What position?" → Q4: "Favourite player?" (CORRECT)

3. NATURAL TRANSITIONS — when changing topic, use what the child said as a bridge
   Example: "You told me you love cricket. After playing cricket, what do you usually do?"
   NOT: "Okay, now tell me about school." (abrupt — WRONG)

4. CONTEXTUAL REACTIONS — reference what the child actually said:
   - If they said "I like elephants" → "Elephants are amazing! I love that you like them!"
   - If they described something → "Wow! You told me about the xxx and the yyy. That sounds wonderful!"
   - Match length of reaction to their answer: short answer = short reaction, long answer = enthusiastic long reaction
   - Never use generic praise like "Good effort!" — always reference what they said specifically

5. GENTLE ERROR CORRECTION — model correct usage naturally:
   - If child says "no i like indoor games" with grammar mistakes:
     - Reaction: "Oh, so you like indoor games! That is wonderful!"
     - This naturally models the correct form without making them feel bad
   - ONLY correct the most important error, never multiple errors
   - For Level 1-2 children, prioritize encouragement over correction

6. ADAPT TO LEVEL ${level}:
   ${level === 1 ? 'Keep questions very simple. If child gives a one-word answer, celebrate it and ask ONE tiny thing about that word. Heavy praise for any effort.' : ''}
   ${level === 2 ? 'Encourage a little more detail. If answer is too short, say "Tell me a little more!" and re-ask. Praise complete sentences.' : ''}
   ${level === 3 ? 'Ask "why" and "how" and "what happened next" to get richer answers. Praise good vocabulary and creativity.' : ''}
   ${level === 4 ? 'Ask for reasoning, opinions, and imaginative scenarios. Praise sophisticated thinking and expression.' : ''}

7. TONE — always sound like a real curious person, NOT a robot:
   Good: "Oh really? That is so cool!"  "Tell me more!"  "Wah, I love that!"  "And then what?"
   Bad: "That is a good answer. Now please tell me..."
   Bad: "Good effort! Very nice."  ← too generic

8. ENCOURAGING EXPANSIONS — if the child gives a very short answer:
   - "Nice! Can you tell me a little more about that?"
   - "That is great! What else happened?"
   - "And what about the xxx? Tell me more!"

STYLE:
- Indian English — warm, expressive
- Indian references: cricket, Diwali, samosas, school exams, monsoon, etc.
- Phrases like "Wah, shabash!", "Arre, that is wonderful!", "Ekdum nice!"
- Max 1–2 Indian words per response

MODE: ${modeCtx[mode] || 'general English conversation'}

RESPONSE FORMAT — ONLY valid JSON, absolutely nothing else outside it:
{
  "reaction": "One warm, genuine spoken reaction to what the child said (reference their actual words)",
  "followUpQuestion": "One natural follow-up question about the SAME topic",
  "topicDetected": "The main topic you detected from the child's answer (1–3 words)",
  "entitiesDetected": ["entity1", "entity2"],
  "shouldChangeTopic": false,
  "correction": null
}

For correction, only if there is ONE clear grammar mistake:
"correction": {
  "original": "child's exact phrase with the mistake",
  "corrected": "fixed version",
  "hint": "short kind explanation"
}

CRITICAL: Output ONLY the JSON. No text before or after.`;
  },

  // ─── Main Conversation Response ──────────────────────────────────────────
  async generateMentorResponse(childText, analysis, child, mode, history = [], conversationContext = null) {
    if (!this.isConfigured()) return null;

    // Build message history for full context memory
    const recent = history.slice(-14); // last 7 exchanges = 14 messages
    const messages = [];

    for (const m of recent) {
      if (m.role === 'child' && m.content) {
        messages.push({ role: 'user', content: m.content });
      } else if (m.role === 'mentor' && m.followUpQuestion) {
        messages.push({ role: 'assistant', content: m.followUpQuestion });
      }
    }

    // Add current child message with analysis hints
    const grammarHint = analysis.grammar.errors.length > 0
      ? `[ANALYSIS: Grammar issue — "${analysis.grammar.errors[0].message}". Consider correcting gently for Level ${child.currentLevel || 1}.]`
      : '';
    const lengthHint  = analysis.fluency.wordCount < 3
      ? '[ANALYSIS: Very short answer. Encourage more detail.]'
      : analysis.fluency.wordCount > 25
      ? '[ANALYSIS: Great long answer! Praise the effort specifically.]'
      : '';

    const noteBlock = [grammarHint, lengthHint].filter(Boolean).join(' ');
    messages.push({
      role: 'user',
      content: noteBlock ? `${childText}\n\n${noteBlock}` : childText,
    });

    const clean = this._ensureAlternating(messages);

    try {
      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.getApiKey(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      this.MODEL,
          max_tokens: 450,
          system:     this.buildSystemPrompt(child, mode, conversationContext),
          messages:   clean,
        }),
      });

      if (!res.ok) return null;

      const data    = await res.json();
      const rawText = (data.content?.[0]?.text || '').trim();
      const match   = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON in response');
      const parsed  = JSON.parse(match[0]);

      return {
        feedback: {
          emoji:      '🌟',
          title:      parsed.reaction || 'Great job!',
          positives:  [parsed.reaction || 'Great effort!'],
          correction: parsed.correction || null,
        },
        reaction:          parsed.reaction          || 'Very good!',
        followUpQuestion:  parsed.followUpQuestion  || Prompts.getPrompt(child.currentLevel || 1, mode),
        topicDetected:     parsed.topicDetected     || null,
        entitiesDetected:  parsed.entitiesDetected  || [],
        shouldChangeTopic: parsed.shouldChangeTopic || false,
        source: 'claude',
      };

    } catch (e) {
      console.warn('Claude API failed, using local engine:', e.message);
      return null;
    }
  },

  // ─── Opening Greeting ────────────────────────────────────────────────────
  async generateOpeningGreeting(child, mode) {
    if (!this.isConfigured()) return null;

    const modeIntros = {
      daily_chat:       `Start a warm, natural conversation. Say hi to ${child.name} and ask ONE friendly opening question about something from their day or life — like their morning, school, or something they did recently.`,
      story_builder:    `Start Story Builder. Say hi excitedly and begin a short story set in India — then stop and ask ${child.name} what happens next.`,
      role_play:        `Start Role Play. Tell ${child.name} they will play a fun character today (doctor, astronaut, chef, or cricketer — pick one). Set the scene with one sentence and ask the first question.`,
      vocabulary_quest: `Start Vocab Quest. Say hi and introduce ONE interesting English word with a simple meaning. Give a natural example sentence, then ask ${child.name} to try using it.`,
      opinion_mode:     `Start Opinion Mode. Say hi and ask ${child.name} a fun opinion question they'll have a view on — make it age-appropriate and related to their world.`,
    };

    try {
      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.getApiKey(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.MODEL,
          max_tokens: 220,
          system: this.buildSystemPrompt(child, mode, null),
          messages: [{
            role: 'user',
            content: `${modeIntros[mode]}
Respond with ONLY JSON: {"greeting": "one warm sentence greeting", "question": "the opening question"}
Level ${child.currentLevel || 1}, age ${child.age}. Sound warm and natural, like a real person.`,
          }],
        }),
      });

      if (!res.ok) return null;
      const data  = await res.json();
      const text  = data.content?.[0]?.text || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      const p = JSON.parse(match[0]);
      return `${p.greeting || ''}\n\n${p.question || ''}`.trim();
    } catch (e) { return null; }
  },

  // ─── End-of-Session Summary ───────────────────────────────────────────────
  async generateSessionSummary(child, mode, messages, analysisScores, durationSeconds) {
    if (!this.isConfigured()) return null;

    const childMessages = messages
      .filter(m => m.role === 'child')
      .map(m => m.content)
      .join('\n');

    const avg  = arr => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length * 100) : 0;
    const grammar    = avg(analysisScores.map(s => s.grammar?.score    || 0));
    const vocab      = avg(analysisScores.map(s => s.vocabulary?.score || 0));
    const fluency    = avg(analysisScores.map(s => s.fluency?.score    || 0));
    const creativity = avg(analysisScores.map(s => s.creativity?.score || 0));
    const totalWords = messages.filter(m => m.role === 'child')
      .reduce((sum, m) => sum + (m.content?.split(/\s+/).length || 0), 0);
    const minutes  = Math.round(durationSeconds / 60);
    const modeName = Prompts.MODE_INFO[mode]?.name || 'Chat';

    const prompt = `You are writing a warm end-of-session report for ${child.name} (age ${child.age}, Level ${child.currentLevel || 1}).

They just had a ${minutes}-minute English conversation session (${modeName} mode).

What ${child.name} said during the session:
---
${childMessages.slice(0, 1500)}
---

Scores: Grammar ${grammar}%, Vocabulary ${vocab}%, Fluency ${fluency}%, Creativity ${creativity}%
Total words spoken: ${totalWords}

Generate a personal, warm report. Respond with ONLY this JSON:
{
  "headline": "One celebratory headline sentence — mention the child by name",
  "starMoment": "The best or most interesting thing the child said — quote their words if possible",
  "praise": ["Specific praise point 1 about what they said/did", "Specific praise point 2", "Specific praise point 3"],
  "tipForNext": "One gentle, encouraging improvement suggestion",
  "parentNote": "2 warm sentences for parents summarising the session",
  "overallRating": "superstar|great|good|keep-going",
  "spokenSummary": "A warm 2-sentence spoken summary Priya reads aloud to the child — personal, encouraging"
}`;

    try {
      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.getApiKey(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.MODEL,
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) return null;
      const data  = await res.json();
      const text  = data.content?.[0]?.text || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      return JSON.parse(match[0]);
    } catch (e) {
      console.warn('Summary generation failed:', e.message);
      return null;
    }
  },

  // ─── Helpers ─────────────────────────────────────────────────────────────
  _ensureAlternating(messages) {
    if (!messages.length) return messages;
    const clean = [];
    let lastRole = null;
    for (const m of messages) {
      if (m.role === lastRole) continue;
      clean.push(m);
      lastRole = m.role;
    }
    if (clean[0]?.role !== 'user') clean.shift();
    if (clean[clean.length - 1]?.role !== 'user') clean.pop();
    return clean.length ? clean : [messages[messages.length - 1]];
  },

  async testConnection() {
    if (!this.isConfigured()) return { ok: false, error: 'No API key configured.' };
    try {
      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.getApiKey(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: this.MODEL, max_tokens: 10, messages: [{ role: 'user', content: 'Say OK.' }] }),
      });
      if (res.ok) return { ok: true };
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error?.message || `HTTP ${res.status}` };
    } catch (e) { return { ok: false, error: e.message }; }
  },
};
