/**
 * SpeakBuddy — Word of the Day & Daily Challenge
 * Indian-context words and daily learning goals.
 */

const DailyLearning = {

  // ─── Word of the Day Pool (Indian-context friendly) ───────────────────────
  WORDS: [
    { word: 'Magnificent',  meaning: 'Very grand and beautiful',          example: 'The Taj Mahal is a magnificent building.',          emoji: '🏛️' },
    { word: 'Curious',      meaning: 'Wanting to learn and know things',  example: 'A curious student always asks questions.',          emoji: '🔍' },
    { word: 'Brave',        meaning: 'Not afraid, even when it is hard',  example: 'The soldier was very brave.',                       emoji: '🦁' },
    { word: 'Delicious',    meaning: 'Something that tastes very good',   example: 'The biryani smelled delicious.',                    emoji: '🍛' },
    { word: 'Adventure',    meaning: 'An exciting and unusual experience',example: 'Going to the mountains was a great adventure.',     emoji: '🏔️' },
    { word: 'Enormous',     meaning: 'Very, very big',                    example: 'An elephant is an enormous animal.',                emoji: '🐘' },
    { word: 'Grateful',     meaning: 'Feeling thankful for something',    example: 'I am grateful for my family.',                     emoji: '🙏' },
    { word: 'Imagine',      meaning: 'To picture something in your mind', example: 'Imagine you are flying like a bird!',               emoji: '💭' },
    { word: 'Discover',     meaning: 'To find something new',             example: 'Scientists discover new things every day.',         emoji: '🔭' },
    { word: 'Persevere',    meaning: 'To keep trying even when it is hard',example: 'You must persevere when learning something new.', emoji: '💪' },
    { word: 'Vibrant',      meaning: 'Full of energy and bright colours', example: 'Diwali is a vibrant festival of lights.',           emoji: '✨' },
    { word: 'Harvest',      meaning: 'Collecting crops that have grown',  example: 'Farmers celebrate the harvest season.',             emoji: '🌾' },
    { word: 'Ancient',      meaning: 'Very, very old',                    example: 'India has many ancient temples.',                   emoji: '🏯' },
    { word: 'Generous',     meaning: 'Happy to give and share with others',example: 'My grandmother is always generous with food.',    emoji: '🎁' },
    { word: 'Peaceful',     meaning: 'Calm and without noise or fighting',example: 'The garden was quiet and peaceful.',                emoji: '🕊️' },
    { word: 'Enthusiastic', meaning: 'Very excited and eager',            example: 'She was enthusiastic about the school trip.',       emoji: '🎉' },
    { word: 'Monsoon',      meaning: 'The rainy season in India',         example: 'We play in the rain during monsoon.',               emoji: '🌧️' },
    { word: 'Inspire',      meaning: 'To make someone want to do something great', example: 'Good teachers inspire their students.',   emoji: '🌟' },
    { word: 'Tradition',    meaning: 'Something people do every year in their family or culture', example: 'Making rangoli is a Diwali tradition.', emoji: '🎨' },
    { word: 'Teamwork',     meaning: 'Working together as a group',       example: 'Cricket is all about teamwork.',                    emoji: '🤝' },
    { word: 'Clever',       meaning: 'Quick to learn and understand things', example: 'The clever fox solved the puzzle.',             emoji: '🦊' },
    { word: 'Gleaming',     meaning: 'Shining brightly',                  example: 'The river was gleaming in the sunlight.',           emoji: '💎' },
    { word: 'Fragrant',     meaning: 'Having a very nice smell',          example: 'The jasmine flower is fragrant.',                   emoji: '🌸' },
    { word: 'Majestic',     meaning: 'Looking grand and impressive',      example: 'The tiger is a majestic animal.',                   emoji: '🐯' },
    { word: 'Diligent',     meaning: 'Working hard and carefully',        example: 'A diligent student always finishes their homework.',emoji: '📚' },
    { word: 'Festival',     meaning: 'A special celebration with fun activities', example: 'Holi is a colourful festival.',            emoji: '🎊' },
    { word: 'Wisdom',       meaning: 'Good sense and knowledge from experience', example: 'Grandparents share their wisdom with us.',  emoji: '🦉' },
    { word: 'Champion',     meaning: 'A winner or the very best at something', example: 'Sachin Tendulkar was a cricket champion.',    emoji: '🏆' },
    { word: 'Curious',      meaning: 'Very interested and wanting to learn more', example: 'Stay curious and you will always learn.', emoji: '🌍' },
    { word: 'Spectacular',  meaning: 'Very impressive and amazing to see', example: 'The fireworks were absolutely spectacular.',      emoji: '🎆' },
  ],

  // ─── Daily Challenges (Indian context) ────────────────────────────────────
  CHALLENGES: [
    { id: 'c1',  title: 'Tell a Story',        desc: 'Start a Story Builder session and create a story!',              mode: 'story_builder',    icon: '📖', xp: 20 },
    { id: 'c2',  title: 'Share Your Opinion',  desc: 'Have an Opinion Mode chat with Buddy today!',                   mode: 'opinion_mode',     icon: '💡', xp: 20 },
    { id: 'c3',  title: 'Play a Role',         desc: 'Try Role Play mode and be a character!',                        mode: 'role_play',        icon: '🎭', xp: 20 },
    { id: 'c4',  title: 'Learn New Words',     desc: 'Complete a Vocabulary Quest session!',                          mode: 'vocabulary_quest', icon: '🔤', xp: 20 },
    { id: 'c5',  title: 'Talk About Your Day', desc: 'Have a Daily Chat and tell Buddy about your day!',              mode: 'daily_chat',       icon: '💬', xp: 15 },
    { id: 'c6',  title: 'Say 30 Words',        desc: 'Give at least one answer with 30 or more words!',               mode: null,               icon: '🗣️', xp: 25 },
    { id: 'c7',  title: 'Morning Practice',    desc: 'Practice English before 12 noon today!',                        mode: null,               icon: '☀️', xp: 15 },
    { id: 'c8',  title: 'Use the Word',        desc: 'Use today\'s Word of the Day in a sentence!',                   mode: null,               icon: '✨', xp: 30 },
    { id: 'c9',  title: '5-Minute Chat',       desc: 'Have a conversation that lasts at least 5 minutes!',            mode: null,               icon: '⏱️', xp: 25 },
    { id: 'c10', title: 'Cricket Chat',        desc: 'Talk about cricket in your conversation today!',                mode: 'daily_chat',       icon: '🏏', xp: 20 },
  ],

  // ─── Get today's Word of the Day ─────────────────────────────────────────
  getWordOfDay() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return this.WORDS[dayOfYear % this.WORDS.length];
  },

  // ─── Get today's challenge ────────────────────────────────────────────────
  getDailyChallenge() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return this.CHALLENGES[dayOfYear % this.CHALLENGES.length];
  },

  // ─── Check if today's challenge is complete ───────────────────────────────
  isChallengeComplete() {
    const today  = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('speakbuddy_challenge_' + today);
    return stored === 'done';
  },

  markChallengeComplete() {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('speakbuddy_challenge_' + today, 'done');
  },

  // ─── Indian-context bonus conversation starters ───────────────────────────
  INDIA_PROMPTS: {
    festivals: [
      "Which is your favourite festival — Diwali, Holi, Eid, or Christmas? Why?",
      "How does your family celebrate Diwali?",
      "Tell me about the colours you use during Holi!",
      "What is your favourite thing about school holidays?",
      "Do you help your family prepare food for festivals?",
    ],
    food: [
      "What is your favourite Indian food?",
      "Do you like idli-dosa or paratha more?",
      "Tell me about a delicious meal your mother or grandmother makes.",
      "If you could open a restaurant, what food would you serve?",
      "Do you like spicy food or sweet food more?",
    ],
    cricket: [
      "Who is your favourite cricket player and why?",
      "Have you ever played cricket with your friends?",
      "Imagine you are playing in the India vs Pakistan match. Describe it!",
      "What is the best cricket moment you have seen?",
      "If you could be any cricket player for one day, who would you be?",
    ],
    school: [
      "What is your favourite subject in school and why?",
      "Tell me about your best teacher.",
      "What do you do during your lunch break at school?",
      "What is the best thing about your school?",
      "If you were the principal for one day, what would you change?",
    ],
    nature_india: [
      "Have you ever seen a tiger or elephant at a wildlife park?",
      "Tell me about the monsoon rains. Do you like them?",
      "What is the most beautiful place you have visited in India?",
      "Do you prefer the mountains, the sea, or the desert?",
      "How can we protect India's forests and wild animals?",
    ],
  },

  // ─── Get a random India-context prompt ───────────────────────────────────
  getIndiaPrompt(category = null) {
    const cats = Object.keys(this.INDIA_PROMPTS);
    const cat  = category || cats[Math.floor(Math.random() * cats.length)];
    const list = this.INDIA_PROMPTS[cat] || this.INDIA_PROMPTS.food;
    return list[Math.floor(Math.random() * list.length)];
  },
};
