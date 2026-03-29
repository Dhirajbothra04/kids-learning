/**
 * SpeakBuddy - AI Engine
 * Handles conversation generation, speech analysis, and feedback
 * Uses local rule-based analysis (can be upgraded to Claude/GPT API)
 */

const AIEngine = {
  // Common grammar rules for kids
  grammarRules: {
    irregularPast: {
      'goed': 'went', 'runned': 'ran', 'eated': 'ate', 'drinked': 'drank',
      'gived': 'gave', 'taked': 'took', 'comed': 'came', 'maked': 'made',
      'bringed': 'brought', 'catched': 'caught', 'finded': 'found', 'hided': 'hid',
      'keeped': 'kept', 'knowed': 'knew', 'leaved': 'left', 'sayed': 'said',
      'seed': 'saw', 'sitted': 'sat', 'sleeped': 'slept', 'speaked': 'spoke',
      'swimmed': 'swam', 'telled': 'told', 'thinked': 'thought', 'writed': 'wrote',
      'buyed': 'bought', 'teached': 'taught', 'falled': 'fell', 'growed': 'grew',
      'flyed': 'flew', 'drawed': 'drew', 'builded': 'built', 'breaked': 'broke',
      'choosed': 'chose', 'drived': 'drove', 'feeled': 'felt', 'forgeted': 'forgot',
      'heared': 'heard', 'holded': 'held', 'readed': 'read', 'rided': 'rode',
      'singed': 'sang', 'standed': 'stood', 'winned': 'won', 'weared': 'wore',
      'bited': 'bit', 'blowed': 'blew', 'digged': 'dug', 'fighted': 'fought',
    },
    
    subjectVerb: {
      'i is': 'I am', 'i are': 'I am', 'he are': 'he is', 'she are': 'she is',
      'it are': 'it is', 'they is': 'they are', 'we is': 'we are',
      'i has': 'I have', 'they has': 'they have', 'we has': 'we have',
      'he have': 'he has', 'she have': 'she has', 'it have': 'it has',
    },
    
    articles: {
      'a apple': 'an apple', 'a orange': 'an orange', 'a elephant': 'an elephant',
      'a ice': 'an ice', 'a umbrella': 'an umbrella', 'a egg': 'an egg',
      'a animal': 'an animal', 'a idea': 'an idea', 'a ant': 'an ant',
    },
  },

  // Words that indicate creativity
  creativeWords: [
    'imagine', 'pretend', 'magic', 'dream', 'wonderful', 'amazing', 'beautiful',
    'adventure', 'discover', 'explore', 'create', 'invent', 'special', 'fantastic',
    'incredible', 'magnificent', 'extraordinary', 'spectacular', 'marvelous',
    'brilliant', 'awesome', 'legendary', 'mysterious', 'enchanted', 'sparkle',
    'rainbow', 'treasure', 'superpower', 'invisible', 'galaxy', 'universe',
  ],

  // Common descriptive words (good vocabulary indicators)
  descriptiveWords: [
    'big', 'small', 'happy', 'sad', 'angry', 'excited', 'scared', 'brave',
    'kind', 'funny', 'beautiful', 'ugly', 'fast', 'slow', 'hot', 'cold',
    'loud', 'quiet', 'bright', 'dark', 'soft', 'hard', 'gentle', 'strong',
    'clever', 'silly', 'curious', 'enormous', 'tiny', 'delicious', 'terrible',
    'wonderful', 'horrible', 'fantastic', 'brilliant', 'gorgeous', 'hideous',
    'magnificent', 'spectacular', 'extraordinary', 'astonishing', 'remarkable',
  ],

  /**
   * Analyze the child's speech text
   */
  analyzeSpeech(text, childLevel = 1) {
    if (!text || text.trim().length === 0) {
      return {
        grammar: { score: 0, errors: [] },
        vocabulary: { score: 0, uniqueWords: 0, newWords: [], diversity: 0 },
        fluency: { score: 0, sentenceCount: 0, avgSentenceLength: 0, wordCount: 0 },
        creativity: { score: 0, creativeWordsUsed: [], descriptiveWordsUsed: [] },
        composite: 0,
      };
    }

    const grammar = this.analyzeGrammar(text);
    const vocabulary = this.analyzeVocabulary(text);
    const fluency = this.analyzeFluency(text);
    const creativity = this.analyzeCreativity(text);

    // Composite score weighted
    const composite = (
      grammar.score * 0.25 +
      vocabulary.score * 0.25 +
      fluency.score * 0.25 +
      creativity.score * 0.15 +
      Math.min(fluency.wordCount / (childLevel * 15), 1) * 0.10  // confidence proxy
    );

    return {
      grammar,
      vocabulary,
      fluency,
      creativity,
      composite: Math.min(composite, 1),
    };
  },

  /**
   * Grammar Analysis
   */
  analyzeGrammar(text) {
    const errors = [];
    let lowerText = text.toLowerCase();

    // Check irregular past tense
    for (const [wrong, correct] of Object.entries(this.grammarRules.irregularPast)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      if (regex.test(lowerText)) {
        const originalWord = text.match(new RegExp(`\\b${wrong}\\b`, 'i'))?.[0] || wrong;
        errors.push({
          type: 'irregular_past',
          original: originalWord,
          correction: correct,
          message: `"${originalWord}" should be "${correct}"`,
        });
      }
    }

    // Check subject-verb agreement
    for (const [wrong, correct] of Object.entries(this.grammarRules.subjectVerb)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      if (regex.test(lowerText)) {
        errors.push({
          type: 'subject_verb',
          original: wrong,
          correction: correct,
          message: `"${wrong}" should be "${correct}"`,
        });
      }
    }

    // Check articles
    for (const [wrong, correct] of Object.entries(this.grammarRules.articles)) {
      if (lowerText.includes(wrong)) {
        errors.push({
          type: 'article',
          original: wrong,
          correction: correct,
          message: `"${wrong}" should be "${correct}"`,
        });
      }
    }

    // Check capitalization of I
    if (/\bi\b/.test(text) && !/\bI\b/.test(text)) {
      errors.push({
        type: 'capitalization',
        original: 'i',
        correction: 'I',
        message: 'Remember to capitalize "I"',
      });
    }

    // Check double negatives
    if (/\b(don't|doesn't|didn't|won't|can't|not)\b.*\b(no|nothing|nobody|nowhere|never)\b/i.test(text)) {
      errors.push({
        type: 'double_negative',
        original: 'double negative',
        correction: 'use only one negative word',
        message: 'Try to use only one negative word in a sentence',
      });
    }

    // Score: 1.0 = perfect, 0.0 = many errors
    const words = text.split(/\s+/).length;
    const errorRatio = errors.length / Math.max(words, 1);
    const score = Math.max(0, 1 - errorRatio * 3);

    return { score: Math.min(score, 1), errors };
  },

  /**
   * Vocabulary Analysis
   */
  analyzeVocabulary(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const uniqueWords = [...new Set(words)];
    const totalWords = words.length;

    // Diversity ratio
    const diversity = totalWords > 0 ? uniqueWords.length / totalWords : 0;

    // Check for advanced/new words
    const commonWords = new Set([
      'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'be', 'been',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her',
      'and', 'but', 'or', 'so', 'if', 'in', 'on', 'at', 'to', 'for', 'of',
      'that', 'this', 'with', 'from', 'do', 'did', 'does', 'have', 'has', 'had',
      'not', 'no', 'yes', 'can', 'will', 'would', 'could', 'should',
      'what', 'when', 'where', 'who', 'how', 'why', 'which',
      'like', 'go', 'went', 'come', 'came', 'get', 'got', 'make', 'made',
      'say', 'said', 'see', 'saw', 'know', 'knew', 'think', 'want',
      'very', 'much', 'more', 'most', 'just', 'also', 'then', 'now',
    ]);

    const newWords = uniqueWords.filter(w => !commonWords.has(w) && w.length > 3);
    
    // Score based on vocabulary richness
    let score = 0;
    if (totalWords > 0) {
      score = Math.min(1, (
        diversity * 0.4 +
        Math.min(newWords.length / 5, 1) * 0.4 +
        Math.min(totalWords / 20, 1) * 0.2
      ));
    }

    return {
      score,
      uniqueWords: uniqueWords.length,
      totalWords,
      newWords,
      diversity: Math.round(diversity * 100) / 100,
    };
  },

  /**
   * Fluency Analysis
   */
  analyzeFluency(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentenceCount = sentences.length;
    const wordCount = words.length;
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;

    // Check for filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually'];
    const fillerCount = fillerWords.reduce((count, filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      return count + (text.match(regex) || []).length;
    }, 0);

    // Score based on sentence structure and length
    let score = 0;
    if (wordCount > 0) {
      score = Math.min(1, (
        Math.min(sentenceCount / 3, 1) * 0.3 +
        Math.min(avgSentenceLength / 8, 1) * 0.3 +
        Math.min(wordCount / 15, 1) * 0.3 +
        Math.max(0, 1 - fillerCount / Math.max(wordCount, 1) * 5) * 0.1
      ));
    }

    return {
      score,
      sentenceCount,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      wordCount,
      fillerCount,
    };
  },

  /**
   * Creativity Analysis
   */
  analyzeCreativity(text) {
    const lowerText = text.toLowerCase();
    const creativeWordsUsed = this.creativeWords.filter(w => lowerText.includes(w));
    const descriptiveWordsUsed = this.descriptiveWords.filter(w => {
      const regex = new RegExp(`\\b${w}\\b`, 'i');
      return regex.test(lowerText);
    });

    const words = text.split(/\s+/).length;
    
    // Score based on creative and descriptive word usage
    let score = 0;
    if (words > 0) {
      score = Math.min(1, (
        Math.min(creativeWordsUsed.length / 3, 1) * 0.4 +
        Math.min(descriptiveWordsUsed.length / 4, 1) * 0.3 +
        Math.min(words / 20, 1) * 0.3  // longer responses often more creative
      ));
    }

    return { score, creativeWordsUsed, descriptiveWordsUsed };
  },

  /**
   * Generate contextual, human-like feedback that references what the child actually said
   */
  generateFeedback(text, analysis, childLevel = 1) {
    const feedback = {
      emoji: '🌟',
      title: 'Great job!',
      positives: [],
      correction: null,
      followUp: '',
    };

    const wordCount = analysis.fluency.wordCount;
    const sentenceCount = analysis.fluency.sentenceCount;
    const errorCount = analysis.grammar.errors.length;
    const hasCreative = analysis.creativity.creativeWordsUsed.length > 0;
    const hasDescriptive = analysis.creativity.descriptiveWordsUsed.length > 0;
    const newWords = analysis.vocabulary.newWords;

    // ────── Determine title based on overall quality + effort ──────
    if (errorCount === 0 && wordCount > 15 && sentenceCount > 2) {
      feedback.emoji = '🌟🌟🌟';
      feedback.title = 'Fantastic! That was perfect!';
    } else if (wordCount > 15 || (errorCount === 0 && wordCount > 10)) {
      feedback.emoji = '🌟🌟🌟';
      feedback.title = 'Wow! That was wonderful!';
    } else if (errorCount <= 1 && wordCount >= 8) {
      feedback.emoji = '🌟🌟';
      feedback.title = 'Really nice job!';
    } else if (wordCount >= 5 && errorCount <= 1) {
      feedback.emoji = '🌟🌟';
      feedback.title = 'Good! You spoke well!';
    } else if (wordCount >= 3) {
      feedback.emoji = '🌟';
      feedback.title = 'Great effort!';
    } else {
      feedback.emoji = '⭐';
      feedback.title = 'Nice try!';
    }

    // ────── Generate contextual positives ──────
    // Praise specific effort
    if (wordCount > 15) {
      feedback.positives.push('You said so much! That shows great confidence! 💪');
    } else if (wordCount > 8) {
      feedback.positives.push('You gave a nice long answer! That is excellent! 🎯');
    } else if (wordCount > 3) {
      feedback.positives.push('You spoke clearly! Well done! ✨');
    }

    // Praise structure
    if (sentenceCount > 2) {
      feedback.positives.push('Wonderful! You used multiple sentences! 📝');
    } else if (sentenceCount > 1) {
      feedback.positives.push('Great! You made complete sentences! 📝');
    }

    // Praise vocabulary specifically
    if (newWords.length > 1) {
      feedback.positives.push(`Amazing words! I heard "${newWords[0]}" and "${newWords[1]}"! 📚`);
    } else if (newWords.length > 0) {
      feedback.positives.push(`Nice word choice! I loved "${newWords[0]}"! 📚`);
    }

    // Praise creativity/descriptive language
    if (hasDescriptive && hasCreative) {
      feedback.positives.push('Beautiful describing words and great imagination! 🎨✨');
    } else if (hasDescriptive) {
      feedback.positives.push('Excellent! You used describing words! 🎨');
    } else if (hasCreative) {
      feedback.positives.push('What wonderful imagination! ✨');
    }

    // Perfect grammar praise
    if (errorCount === 0 && wordCount > 5) {
      feedback.positives.push('Perfect grammar! You spoke beautifully! 👏');
    }

    // Ensure at least one positive
    if (feedback.positives.length === 0) {
      feedback.positives.push(`I love your effort! Keep speaking like that! 💪`);
    }

    // Limit to 2-3 positives for brevity
    feedback.positives = feedback.positives.slice(0, 2);

    // ────── Generate gentle correction ──────
    if (errorCount > 0) {
      const error = analysis.grammar.errors[0];
      const correctedText = this.correctSentence(text, error);
      feedback.correction = {
        original: text.length > 60 ? text.substring(0, 60) + '...' : text,
        corrected: correctedText,
        hint: error.message,
        gentle: true, // Flag for UI to show this gently
      };
    }

    return feedback;
  },

  /**
   * Correct a sentence based on an error
   */
  correctSentence(text, error) {
    let corrected = text;
    if (error.original && error.correction) {
      const regex = new RegExp(`\\b${error.original}\\b`, 'i');
      corrected = corrected.replace(regex, error.correction);
    }
    // Capitalize first letter
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
    // Add period if missing
    if (!/[.!?]$/.test(corrected.trim())) {
      corrected = corrected.trim() + '.';
    }
    return corrected;
  },

  // ── Topic-aware follow-up templates (local fallback) ───────────────────────
  topicFollowUps: {
    cricket:    ["Who do you play cricket with?","What position do you like to play?","Who is your favourite cricket player?","Tell me about the last match you played!","What do you do when you hit a six?"],
    football:   ["Who do you play football with?","What position do you play?","Do you support any team?","Tell me about your best goal!","Where do you play football?"],
    dog:        ["What is your dog's name?","What games do you play with your dog?","What does your dog like to eat?","Where does your dog sleep?","Is your dog big or small?"],
    cat:        ["What is your cat's name?","Does your cat like to be held?","What does your cat eat?","What funny things does your cat do?","Where does your cat sleep?"],
    pet:        ["What is your pet's name?","How long have you had your pet?","What does your pet eat?","What is the funniest thing your pet does?","Does your pet know any tricks?"],
    school:     ["What is your favourite subject in school?","Who is your best friend at school?","What do you eat for lunch at school?","What is the best thing about your school?","Tell me about your teacher!"],
    friend:     ["What is your friend's name?","What games do you play with your friend?","How did you first meet your friend?","What do you like most about your friend?","What funny things do you do together?"],
    food:       ["What is your all-time favourite food?","Who cooks the best food in your house?","Can you make any food yourself?","What food do you not like at all?","What would you eat if it was your birthday?"],
    drawing:    ["What do you like to draw most?","Do you use colours or pencil?","Have you ever drawn something for someone?","What was the best picture you ever made?","Would you teach me how to draw something?"],
    game:       ["What game is your favourite?","Who do you play games with?","How long do you play for?","Have you ever won a game? Tell me about it!","What makes that game so fun?"],
    book:       ["What is your favourite book?","Who is your favourite character?","Where do you like to read?","What happened in the last book you read?","Would you like to write a book someday?"],
    family:     ["How many people are in your family?","Who do you like spending time with most?","What does your family do on weekends?","What is the best thing about your family?","Do you have any brothers or sisters?"],
    park:       ["Which park do you go to?","Who do you go to the park with?","What do you do at the park?","What is the best thing about the park?","Did you see any animals at the park?"],
    diwali:     ["How do you celebrate Diwali?","What is your favourite sweet at Diwali?","Do you burst crackers?","What new clothes did you wear this Diwali?","Tell me about the lights in your house!"],
    holiday:    ["Where did you go for your holiday?","What was the most fun thing you did?","What did you eat there?","Did you take any photos?","What was the best part of your holiday?"],
  },

  /**
   * Extract a simple topic from the child's text for local context tracking
   */
  detectTopicLocal(text) {
    const t = text.toLowerCase();
    const topicKeywords = {
      cricket:  ['cricket', 'bat', 'bowling', 'wicket', 'six', 'four', 'ipl', 'virat', 'rohit'],
      football: ['football', 'soccer', 'goal', 'kick', 'match', 'fifa'],
      dog:      ['dog', 'puppy', 'doggy', 'pup'],
      cat:      ['cat', 'kitten', 'kitty'],
      pet:      ['pet', 'rabbit', 'hamster', 'fish', 'parrot', 'bird'],
      school:   ['school', 'class', 'teacher', 'homework', 'exam', 'subject', 'maths', 'science'],
      friend:   ['friend', 'bestie', 'buddy', 'classmate'],
      food:     ['food', 'eat', 'lunch', 'dinner', 'breakfast', 'snack', 'pizza', 'biryani', 'samosa', 'mango'],
      drawing:  ['draw', 'drawing', 'colour', 'color', 'paint', 'sketch', 'art'],
      game:     ['game', 'play', 'video game', 'minecraft', 'roblox', 'mobile'],
      book:     ['book', 'read', 'story', 'library', 'novel'],
      family:   ['family', 'mummy', 'daddy', 'mom', 'dad', 'brother', 'sister', 'grandfather', 'grandmother', 'nana', 'dadi'],
      park:     ['park', 'garden', 'playground', 'slide', 'swing'],
      diwali:   ['diwali', 'deepawali', 'cracker', 'diya', 'festival', 'holi', 'eid', 'christmas'],
      holiday:  ['holiday', 'vacation', 'trip', 'travel', 'visit', 'went to', 'went on'],
    };
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(kw => t.includes(kw))) return topic;
    }
    return null;
  },

  /**
   * Generate a contextual follow-up question that naturally continues the conversation
   * Priority: (1) Build on what they JUST said, (2) Explore the topic deeper, (3) New topic
   */
  getContextualFollowUp(text, context, child, mode, usedPrompts) {
    const detectedTopic = this.detectTopicLocal(text);

    // Extract key entities from what they said
    const entities = this.extractEntities(text);

    // ────── Tier 1: Build directly on what they just said ──────
    if (entities.length > 0) {
      const followUp = this.buildDirectFollowUp(text, entities[0], detectedTopic);
      if (followUp) return followUp;
    }

    // ────── Tier 2: Continue exploring the detected topic ──────
    if (detectedTopic && this.topicFollowUps[detectedTopic]) {
      const pool = this.topicFollowUps[detectedTopic];
      const unused = pool.filter(q => !usedPrompts.includes(q));
      const available = unused.length > 0 ? unused : pool;
      return available[Math.floor(Math.random() * available.length)];
    }

    // ────── Tier 3: If context has current topic, continue with it ──────
    if (context?.currentTopic && this.topicFollowUps[context.currentTopic] && context.turnsOnTopic < context.topicChangeTurn) {
      const pool = this.topicFollowUps[context.currentTopic];
      const unused = pool.filter(q => !usedPrompts.includes(q));
      const available = unused.length > 0 ? unused : pool;
      return available[Math.floor(Math.random() * available.length)];
    }

    // ────── Tier 4: Pick a new topic ──────
    return Prompts.getUniquePrompt(child.currentLevel || 1, mode, usedPrompts);
  },

  /**
   * Extract key entities/nouns from the child's response
   */
  extractEntities(text) {
    const animals = ['elephant', 'dog', 'cat', 'lion', 'tiger', 'bear', 'monkey', 'bird', 'fish', 'giraffe', 'zebra', 'deer', 'horse', 'cow', 'sheep', 'goat', 'pig', 'chicken', 'parrot', 'eagle'];
    const foods = ['pizza', 'ice cream', 'chocolate', 'mango', 'apple', 'banana', 'biryani', 'samosa', 'idli', 'dosa', 'bread', 'milk', 'cake', 'candy', 'cookie'];
    const activities = ['play', 'draw', 'read', 'watch', 'listen', 'sleep', 'eat', 'swim', 'run', 'jump', 'dance', 'sing', 'write'];

    const lowText = text.toLowerCase();
    const entities = [];

    for (const animal of animals) {
      if (lowText.includes(animal)) entities.push({ type: 'animal', value: animal });
    }
    for (const food of foods) {
      if (lowText.includes(food)) entities.push({ type: 'food', value: food });
    }
    for (const activity of activities) {
      if (lowText.includes(activity)) entities.push({ type: 'activity', value: activity });
    }

    return entities;
  },

  /**
   * Build a direct follow-up that continues from what they just said
   */
  buildDirectFollowUp(text, entity, topic) {
    const followUps = {
      animal: [
        `That's wonderful! Do you have a ${entity.value}?`,
        `Oh, ${entity.value}s are amazing! What do you like about them?`,
        `Tell me more about ${entity.value}s! Are they big or small?`,
        `Have you ever seen a real ${entity.value}?`,
        `What sounds does a ${entity.value} make?`,
        `What color is your favorite ${entity.value}?`,
        `Do you have a ${entity.value} as a pet?`,
      ],
      food: [
        `${entity.value} is delicious! Who makes it for you?`,
        `Oh, you like ${entity.value}! That is great!`,
        `Do you eat ${entity.value} every day?`,
        `What is special about ${entity.value}?`,
        `Can you make ${entity.value} yourself?`,
        `Who cooks the best ${entity.value}?`,
        `Do you eat ${entity.value} at home or outside?`,
      ],
      activity: [
        `That's great! Do you ${entity.value} every day?`,
        `I love that you ${entity.value}! How long do you ${entity.value} for?`,
        `What is your favorite thing to ${entity.value}?`,
        `Do you ${entity.value} alone or with friends?`,
        `When do you like to ${entity.value} the most?`,
        `Are you good at ${entity.value}?`,
      ],
    };

    const pool = followUps[entity.type] || [];
    if (pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }

    return null;
  },

  /**
   * Context-aware response (used when Claude is not configured)
   * Now includes: contextual feedback, natural follow-ups, and gentle error correction
   */
  generateContextualResponse(childText, analysis, child, mode, conversationHistory = [], context = null) {
    const level    = child.currentLevel || 1;
    const feedback = this.generateFeedback(childText, analysis, level);

    const usedPrompts = conversationHistory
      .filter(m => m.role === 'mentor')
      .map(m => m.content);

    const followUpQuestion = this.getContextualFollowUp(childText, context, child, mode, usedPrompts);
    const detectedTopic    = this.detectTopicLocal(childText);

    // ────── Build conversational reaction + gentle correction flow ──────
    let reaction = this.buildConversationalReaction(childText, analysis, feedback);

    // If there are grammar errors, build a gentle correction into the next response
    let correctionIntegration = null;
    if (analysis.grammar.errors.length > 0) {
      const error = analysis.grammar.errors[0];
      const correctedText = this.correctSentence(childText, error);
      correctionIntegration = {
        original: error.original,
        correction: error.correction,
        hint: error.message,
        // This will be used to naturally integrate the correction into the response
      };
    }

    return {
      feedback,
      followUpQuestion,
      reaction,
      correctionIntegration, // New: integration of error correction into conversation
      topicDetected:    detectedTopic,
      entitiesDetected: [],
      source: 'local',
    };
  },

  /**
   * Build a conversational, warm reaction that flows naturally
   * References what the child actually said
   */
  buildConversationalReaction(childText, analysis, feedback) {
    const wordCount = childText.split(/\s+/).filter(w => w.length > 0).length;
    const hasErrors = analysis.grammar.errors.length > 0;

    // Short responses - encourage more
    if (wordCount <= 3) {
      const reactions = [
        "Nice! Tell me more about that.",
        "Interesting! Can you say a bit more?",
        "Good! What else can you tell me?",
        "I like that! Tell me more.",
      ];
      return reactions[Math.floor(Math.random() * reactions.length)];
    }

    // Medium responses - warm and encouraging
    if (wordCount <= 10) {
      const reactions = [
        "That is so nice! I enjoyed that!",
        "Oh, that is wonderful! Tell me more.",
        "What a great answer! I like that!",
        "Wah! You explained it well!",
      ];
      return reactions[Math.floor(Math.random() * reactions.length)];
    }

    // Long responses - very enthusiastic
    const reactions = [
      "Wow! You told me so much! That is fantastic!",
      "Ekdum amazing! Such wonderful details!",
      "Shabash! You explained it beautifully!",
      "That was excellent! You really know how to speak!",
      "I loved everything you said! So wonderful!",
    ];
    return reactions[Math.floor(Math.random() * reactions.length)];
  },

  /**
   * Generate AI mentor response (conversation continuation) — legacy method
   */
  generateResponse(childText, analysis, child, mode, conversationHistory = []) {
    const level = child.currentLevel || 1;
    const feedback = this.generateFeedback(childText, analysis, level);
    
    // Get appropriate follow-up question
    const usedPrompts = conversationHistory
      .filter(m => m.role === 'mentor')
      .map(m => m.content);
    
    let followUpQuestion;
    
    // 30% chance of personalized prompt based on interests
    if (Math.random() < 0.3 && child.interests?.length > 0) {
      followUpQuestion = Prompts.getPersonalizedPrompt(child, mode);
    } else {
      followUpQuestion = Prompts.getUniquePrompt(level, mode, usedPrompts);
    }

    // Check for memories to personalize
    const memories = Storage.getMemories('interest');
    let memoryReference = '';
    if (memories.length > 0 && Math.random() < 0.2) {
      const memory = memories[Math.floor(Math.random() * memories.length)];
      memoryReference = `I remember ${memory.content}! `;
    }

    return {
      feedback,
      followUpQuestion: memoryReference + followUpQuestion,
    };
  },

  /**
   * Extract memories from child's response
   */
  extractMemories(text, child) {
    const memories = [];
    const lowerText = text.toLowerCase();

    // Detect interests mentioned
    const interestKeywords = {
      cricket: ['cricket', 'bat', 'bowling', 'wicket', 'six', 'four'],
      football: ['football', 'goal', 'kick', 'match', 'soccer'],
      animals: ['dog', 'cat', 'pet', 'puppy', 'kitten', 'animal', 'bird'],
      games: ['game', 'play', 'video game', 'minecraft', 'fortnite'],
      drawing: ['draw', 'paint', 'color', 'sketch', 'art'],
      music: ['music', 'sing', 'song', 'dance', 'instrument'],
      reading: ['book', 'read', 'story', 'library'],
      cooking: ['cook', 'bake', 'recipe', 'kitchen', 'food'],
      space: ['space', 'planet', 'star', 'moon', 'rocket', 'astronaut'],
      science: ['science', 'experiment', 'discover', 'invention'],
    };

    for (const [interest, keywords] of Object.entries(interestKeywords)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        memories.push({
          type: 'interest',
          content: `you like ${interest}`,
          topic: interest,
        });
      }
    }

    // Detect people mentioned
    const nameMatches = text.match(/my (?:friend|brother|sister|mom|dad|teacher) (?:is |named )?(\w+)/i);
    if (nameMatches) {
      memories.push({
        type: 'person',
        content: `your ${nameMatches[0]}`,
        topic: 'people',
      });
    }

    // Detect preferences
    const prefMatches = text.match(/(?:i like|i love|my favorite is|i enjoy) (.+?)(?:\.|!|,|$)/i);
    if (prefMatches) {
      memories.push({
        type: 'preference',
        content: `you like ${prefMatches[1].trim()}`,
        topic: 'preferences',
      });
    }

    return memories;
  },

  /**
   * Check if child should level up
   */
  checkLevelUp(child) {
    const progress = Storage.getAllProgress();
    const recentProgress = progress.slice(-7); // Last 7 days
    
    if (recentProgress.length < 3) return null; // Need at least 3 sessions
    
    const avgComposite = recentProgress.reduce((sum, p) => {
      const avg = ((p.avgGrammar || 0) + (p.avgVocab || 0) + (p.avgFluency || 0) + (p.avgCreativity || 0)) / 4;
      return sum + avg;
    }, 0) / recentProgress.length;

    const currentLevel = child.currentLevel || 1;
    
    const thresholds = {
      1: { score: 0.40, sessions: 5 },
      2: { score: 0.55, sessions: 7 },
      3: { score: 0.70, sessions: 10 },
    };

    const threshold = thresholds[currentLevel];
    if (!threshold) return null; // Already at max level

    const totalConversations = Storage.getTotalConversations();
    
    if (avgComposite >= threshold.score && totalConversations >= threshold.sessions) {
      return currentLevel + 1;
    }

    return null;
  },

  /**
   * Get level progress percentage
   */
  getLevelProgress(child) {
    const progress = Storage.getAllProgress();
    const recentProgress = progress.slice(-7);
    
    if (recentProgress.length === 0) return 10;

    const avgComposite = recentProgress.reduce((sum, p) => {
      const avg = ((p.avgGrammar || 0) + (p.avgVocab || 0) + (p.avgFluency || 0) + (p.avgCreativity || 0)) / 4;
      return sum + avg;
    }, 0) / recentProgress.length;

    const currentLevel = child.currentLevel || 1;
    const thresholds = { 1: 0.40, 2: 0.55, 3: 0.70, 4: 1.0 };
    const threshold = thresholds[currentLevel] || 1.0;
    
    return Math.min(Math.round((avgComposite / threshold) * 100), 95);
  },
};
