/**
 * SpeakBuddy - Conversation Prompts Database
 * 200+ age-appropriate, engaging conversation prompts organized by level and mode
 */

const Prompts = {
  // Level names
  LEVEL_NAMES: {
    1: 'Beginner',
    2: 'Basic Speaker',
    3: 'Intermediate',
    4: 'Advanced Communicator',
  },

  // Mode names & icons
  MODE_INFO: {
    daily_chat: { name: 'Daily Chat', icon: '💬', color: '#6C5CE7' },
    story_builder: { name: 'Story Builder', icon: '📖', color: '#FF9FF3' },
    role_play: { name: 'Role Play', icon: '🎭', color: '#48DBFB' },
    vocabulary_quest: { name: 'Vocab Quest', icon: '🏆', color: '#FECA57' },
    opinion_mode: { name: 'Share Ideas', icon: '🤔', color: '#FF6B6B' },
  },

  /**
   * Master prompt database: prompts[level][mode] = string[]
   */
  database: {
    // ==============================
    // LEVEL 1 — BEGINNER
    // ==============================
    1: {
      daily_chat: [
        "What is your name?",
        "How old are you?",
        "What fruit do you like?",
        "What color do you like?",
        "Do you like cats or dogs?",
        "What is your favorite food?",
        "Do you like ice cream? What flavor?",
        "What animal do you like?",
        "Is it sunny today or rainy?",
        "Do you like school?",
        "What is your favorite toy?",
        "Do you have a pet?",
        "What do you like to drink?",
        "What is your favorite color?",
        "Do you like chocolate?",
        "How many friends do you have?",
        "What did you eat today?",
        "Do you like to dance?",
        "What is your favorite song?",
        "Do you like to play outside?",
      ],
      story_builder: [
        "Once upon a time, there was a little cat. What was the cat's name?",
        "A bird flew to your window. What color was the bird?",
        "You found a little box. What was inside?",
        "There was a bunny in the garden. Was the bunny happy or sad?",
        "A star fell from the sky. What did you do?",
        "You saw a rainbow. What colors did you see?",
        "A fish talked to you. What did the fish say?",
        "You got a balloon. What color was it?",
        "A puppy came to your door. Did you keep it?",
        "You went to a magic garden. What did you see?",
      ],
      role_play: [
        "You are a puppy! What is your name? Woof! 🐶",
        "You are a bird flying in the sky! What can you see?",
        "You are a fish in the sea. Is the water cold or warm?",
        "You are a superhero! What is your name?",
        "You are a little chef. What are you cooking?",
        "You are a king or queen. What is your kingdom called?",
        "You are a robot! Beep boop! What can you do?",
        "You are a bunny. Do you like carrots?",
        "You are a star in the sky. Are you shiny?",
        "You are a dinosaur. Are you big or small?",
      ],
      vocabulary_quest: [
        "Can you say 'butterfly'? 🦋 Do you like butterflies?",
        "What color is the sky? Can you say 'blue'?",
        "What sound does a cat make? Can you say 'meow'?",
        "Can you count to five? 1, 2, 3...",
        "Can you say 'elephant'? 🐘 Elephants are big!",
        "What is the opposite of 'big'? Is it 'small'?",
        "Can you say 'rainbow'? 🌈 How many colors does it have?",
        "What is the opposite of 'happy'?",
        "Can you say 'dinosaur'? 🦕 Were dinosaurs big?",
        "What color is grass? Can you say 'green'?",
      ],
      opinion_mode: [
        "Do you like sunny days or rainy days?",
        "What is yummy — pizza or cake?",
        "Do you like mornings or nights?",
        "Which is better — ice cream or chocolate?",
        "Do you like hot weather or cold weather?",
        "What is more fun — drawing or singing?",
        "Would you rather fly or swim?",
        "Do you like stories or songs more?",
        "Which animal is cuter — cats or dogs?",
        "Do you like parks or beaches?",
      ],
    },

    // ==============================
    // LEVEL 2 — BASIC SPEAKER
    // ==============================
    2: {
      daily_chat: [
        "What do you do after school?",
        "Who is your best friend? Tell me about them!",
        "What games do you like to play?",
        "What did you eat for breakfast today?",
        "Do you have brothers or sisters? What are their names?",
        "What did you do this weekend?",
        "What is your favorite TV show?",
        "Tell me about your teacher.",
        "What is your school like?",
        "What do you like to do on holidays?",
        "What is your favorite subject in school?",
        "Do you like reading books? What kind?",
        "What makes you laugh?",
        "What is your favorite game to play with friends?",
        "Tell me about your room. What's in it?",
        "What do you do before going to bed?",
        "Have you learned anything new this week?",
        "What is your favorite season and why?",
        "What sport do you enjoy watching?",
        "If you got a gift today, what would you want?",
      ],
      story_builder: [
        "Once upon a time, there was a little rabbit who found a magic key. What did the key open?",
        "You found a magic box under your bed. What was inside?",
        "A friendly alien landed in your garden. What did you do?",
        "A little dragon was lost. How did you help it?",
        "You woke up and everything was made of candy! What happened next?",
        "You found a talking teddy bear. What did it say?",
        "A magic carpet landed on your roof. Where did you fly?",
        "You found a door in a tree. Where did it lead?",
        "A pirate gave you a treasure map. What did you find?",
        "You could talk to animals for one day. Who did you talk to?",
      ],
      role_play: [
        "You are a doctor. A teddy bear is sick. What do you do?",
        "You are a teacher. What subject are you teaching today?",
        "You are a pilot flying a plane. Where are you going?",
        "You are an ice cream seller. What flavors do you have?",
        "You are a zookeeper. Which animals are you taking care of?",
        "You are a firefighter. What happened?",
        "You are a farmer. What are you growing?",
        "You are a train driver. Where is the train going?",
        "You are a baker. What are you baking today?",
        "You are a librarian. What is the best book you have?",
      ],
      vocabulary_quest: [
        "Do you know what 'curious' means? A curious person likes to learn new things! Are you curious?",
        "The word 'enormous' means very very big. Can you use 'enormous' in a sentence?",
        "'Delicious' means something tastes really good. What food is delicious?",
        "Do you know what 'adventure' means? Have you had an adventure?",
        "'Brave' means not being afraid. When were you brave?",
        "The word 'discover' means to find something new. What have you discovered?",
        "'Favorite' means you like it the most. What is your favorite word?",
        "Do you know what 'imagine' means? Imagine you are on the moon!",
        "'Incredible' means something is really amazing. What is incredible?",
        "The word 'gentle' means very soft and kind. Who is gentle?",
      ],
      opinion_mode: [
        "What is the best day of the week? Why?",
        "Should kids eat vegetables? Why?",
        "What is more fun — a birthday party or going to a park?",
        "Is it better to play alone or with friends?",
        "What is the best animal to have as a pet?",
        "Should we share our toys? Why?",
        "What is better — summer holidays or winter holidays?",
        "Is drawing more fun than playing games?",
        "What is the best thing about your school?",
        "Why is it important to be kind?",
      ],
    },

    // ==============================
    // LEVEL 3 — INTERMEDIATE
    // ==============================
    3: {
      daily_chat: [
        "Tell me about your best holiday. Where did you go?",
        "What would you do if you had superpowers?",
        "Describe your favorite place. What makes it special?",
        "What makes you really happy?",
        "If you could visit any country, where would you go and why?",
        "Tell me about a time when you felt really proud of yourself.",
        "What does a perfect day look like for you?",
        "If you could meet anyone in the world, who would it be?",
        "What is something new you'd like to learn?",
        "Tell me about your favorite family tradition.",
        "How do you cheer up when you feel sad?",
        "What is the most interesting thing you've learned recently?",
        "If you could have any job when you grow up, what would it be?",
        "What is the funniest thing that happened to you?",
        "Describe your neighborhood. What do you like about it?",
        "What do you think makes a good friend?",
        "Tell me about a book or movie that you really enjoyed.",
        "If you could change one thing about the world, what would it be?",
        "What is something you're really good at?",
        "How would you spend a million rupees?",
      ],
      story_builder: [
        "A spaceship landed in your backyard. An alien stepped out and said something. What was the story?",
        "You discovered you could talk to trees. What did the oldest tree in the park tell you?",
        "You found a time machine. Where and when did you travel to?",
        "One morning, your shadow started moving on its own. Tell me the story!",
        "You befriended a dragon who was afraid of fire. How did you help?",
        "Under the ocean, there is a hidden city. Describe your adventure there.",
        "You wrote a story and the characters came to life! What happened?",
        "There's a library where every book is a portal to another world. Which book did you enter?",
        "You found a pair of shoes that let you jump to the clouds. What did you find up there?",
        "A mysterious letter arrived for you from the future. What did it say?",
      ],
      role_play: [
        "You are an astronaut on the moon. Describe what you see and feel!",
        "You are a detective solving a mystery. What clues did you find?",
        "You are a famous chef on a cooking show. What are you making?",
        "You are an explorer in a jungle. What animals did you discover?",
        "You are a scientist who just made a big discovery. What is it?",
        "You are the captain of a pirate ship. Where are you sailing?",
        "You are a news reporter covering an exciting story. What happened?",
        "You are an inventor. You just created something amazing. Describe it!",
        "You are a tour guide showing visitors your city. What do you show them?",
        "You are a wizard at a magic school. What spell did you learn today?",
      ],
      vocabulary_quest: [
        "The word 'magnificent' means very grand and impressive. Can you describe something magnificent?",
        "'Perseverance' means never giving up. Tell me about a time you showed perseverance.",
        "Do you know what 'fascinating' means? What is something you find fascinating?",
        "'Courageous' means very brave. Who is the most courageous person you know?",
        "The word 'extraordinary' means beyond ordinary. Describe something extraordinary!",
        "'Collaborate' means working together. How do you collaborate with your friends?",
        "Do you know the word 'compassion'? It means caring about others. Show me compassion in a sentence!",
        "'Spectacular' means really impressive to see. What is the most spectacular thing you've seen?",
        "The word 'determined' means you really want to do something. What are you determined to do?",
        "'Innovation' means creating something new and better. What innovation would you create?",
      ],
      opinion_mode: [
        "Should kids have homework? Why or why not?",
        "Is it better to play inside or outside? Explain your answer.",
        "Do you think animals should live in zoos? Why?",
        "What makes a good leader?",
        "Is it important to learn other languages? Why?",
        "Should students wear school uniforms? What do you think?",
        "Do you think technology helps us learn better?",
        "What is more important — being smart or being kind?",
        "Should kids have their own phone? At what age?",
        "Do you think we spend too much time on screens?",
      ],
    },

    // ==============================
    // LEVEL 4 — ADVANCED COMMUNICATOR
    // ==============================
    4: {
      daily_chat: [
        "If animals could talk, what do you think they would say about humans?",
        "What would your dream school look like? Describe it in detail.",
        "If you were the Prime Minister for a day, what would you change?",
        "Describe a world where kids make all the rules. What would happen?",
        "If you could invent something to help people, what would it be?",
        "What do you think life will be like 100 years from now?",
        "If you could live in any time period in history, when would you choose?",
        "What is the most important lesson you've learned in life so far?",
        "How would you explain what happiness means to an alien?",
        "If you had to teach someone everything about Earth, where would you start?",
        "What would the world be like if everyone could read minds?",
        "If you could solve one world problem, which one would you pick?",
        "Do you think robots will ever be like humans? Why?",
        "If you wrote a book, what would it be about?",
        "What does being successful mean to you?",
        "If every person planted one tree, how would the world change?",
        "What would happen if there was no internet for a week?",
        "How do you think we should protect endangered animals?",
        "If you could create a new holiday, what would it celebrate?",
        "What qualities would the ideal world leader have?",
      ],
      story_builder: [
        "Write a story about a time-traveling bicycle that takes you to three different eras.",
        "Create a story where colors come to life and have their own personalities.",
        "Imagine a world where dreams become real when you wake up. What story unfolds?",
        "Tell me a mystery story set in an ancient castle with secret passages.",
        "A regular kid discovers they can control the weather. What happens in the story?",
        "Two worlds exist — one above the clouds and one below. Tell their story.",
        "You discover a language that plants speak. Write the story of what you learn.",
        "Create a story about the last library on Earth and its magical librarian.",
        "Write about a friendship between a child from the past and one from the future.",
        "A painting in a museum comes alive at night. What is its story?",
      ],
      role_play: [
        "You are the President addressing the nation about a new discovery. What do you say?",
        "You are a marine biologist who just found a new species underwater. Describe your discovery!",
        "You are a historian explaining an important event to students. What event and why?",
        "You are an environmental activist giving a speech. What is your message?",
        "You are a space traveler who just arrived on a new planet. Report back!",
        "You are a journalist interviewing a famous scientist. What questions do you ask?",
        "You are a architect designing a city of the future. Describe your plans!",
        "You are a doctor who just developed a cure for a disease. Tell the world!",
        "You are an ambassador meeting aliens for the first time. What do you say?",
        "You are a philosopher teaching students about the meaning of life. What do you share?",
      ],
      vocabulary_quest: [
        "'Philanthropy' means helping others generously. How would you practice philanthropy?",
        "The word 'resilience' means bouncing back from difficulties. Describe a time you showed resilience.",
        "'Empathy' means understanding how others feel. Why is empathy important in today's world?",
        "Do you know 'sustainability'? It means using resources without depleting them. How can we be sustainable?",
        "'Perspective' means your point of view. How might a bird's perspective differ from a fish's?",
        "The word 'integrity' means being honest even when nobody is watching. Why does integrity matter?",
        "'Diversity' means having many different types. Why is diversity valuable in a team?",
        "Do you know 'innovation'? Describe an innovation that changed the world.",
        "'Collaboration' means working together toward a goal. Describe the best collaboration you've experienced.",
        "'Eloquent' means speaking beautifully and clearly. Can you make an eloquent sentence about nature?",
      ],
      opinion_mode: [
        "Should artificial intelligence make important decisions for humans? Defend your position.",
        "Is space exploration more important than solving problems on Earth? Why?",
        "Do you think social media does more good or harm? Explain with examples.",
        "Should voting age be lowered? What age and why?",
        "Is it ethical to keep animals in zoos for education? Argue both sides.",
        "Should all education be free? What are the pros and cons?",
        "Do you believe money can buy happiness? Support your answer.",
        "Should countries have open borders? Why or why not?",
        "Is competition good or bad for learning? Explain your reasoning.",
        "Do you think we have a responsibility to help people in other countries? Why?",
      ],
    },
  },

  /**
   * Get a random prompt for the given level and mode
   */
  getPrompt(level, mode) {
    const levelPrompts = this.database[level];
    if (!levelPrompts) return this.database[1].daily_chat[0];
    const modePrompts = levelPrompts[mode];
    if (!modePrompts) return levelPrompts.daily_chat[0];
    return modePrompts[Math.floor(Math.random() * modePrompts.length)];
  },

  /**
   * Get a prompt that hasn't been used recently
   */
  getUniquePrompt(level, mode, usedPrompts = []) {
    const levelPrompts = this.database[level];
    if (!levelPrompts) return this.getPrompt(1, 'daily_chat');
    const modePrompts = levelPrompts[mode] || levelPrompts.daily_chat;
    
    const available = modePrompts.filter(p => !usedPrompts.includes(p));
    if (available.length === 0) {
      // All used — reset
      return modePrompts[Math.floor(Math.random() * modePrompts.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  },

  /**
   * Get an opening greeting based on child's profile
   */
  getGreeting(child) {
    const greetings = [
      `Hi ${child.name}! 😊 I'm so happy to see you today!`,
      `Hey ${child.name}! 🌟 Ready for some fun English practice?`,
      `Welcome back, ${child.name}! 🎉 Let's have a great conversation!`,
      `Hello ${child.name}! 🦊 I missed talking to you!`,
      `${child.name}! 🚀 Great to see you! Let's learn something cool today!`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  },

  /**
   * Get personalized prompt using child's interests
   */
  getPersonalizedPrompt(child, mode) {
    const level = child.currentLevel || 1;
    const interests = child.interests || [];
    
    if (interests.length === 0) return this.getPrompt(level, mode);
    
    const interest = interests[Math.floor(Math.random() * interests.length)];
    
    const personalizedPrompts = {
      cricket: [
        "Do you like cricket? Who is your favorite player?",
        "Did you play cricket recently? Tell me about it!",
        "If you could play cricket with anyone, who would it be?",
        "Imagine you hit the winning six in a big match! Describe that moment!",
      ],
      football: [
        "Do you play football? What position do you play?",
        "Who is your favorite football player?",
        "Imagine you scored the winning goal! How would you celebrate?",
        "If you could play for any team in the world, which one?",
      ],
      drawing: [
        "What do you love to draw the most?",
        "If your drawing came to life, what would happen?",
        "Can you describe your best drawing to me?",
        "If you could paint the sky any color, what would you choose?",
      ],
      music: [
        "What kind of music do you like?",
        "Do you play any musical instrument?",
        "If you could write a song, what would it be about?",
        "Imagine you're performing on a big stage! How do you feel?",
      ],
      animals: [
        "If you could have any animal as a pet, what would you choose?",
        "What's the coolest animal you've ever seen?",
        "If you could talk to any animal, which one and what would you ask?",
        "Imagine you're a veterinarian. What animal are you helping today?",
      ],
      space: [
        "If you could visit any planet, which one would you choose?",
        "What do you think astronauts eat in space?",
        "Imagine you discovered a new planet! What would you name it?",
        "If you met an alien, what would be your first question?",
      ],
      cooking: [
        "What is your favorite thing to cook or bake?",
        "If you had a restaurant, what would you serve?",
        "Can you describe your favorite food to me?",
        "Imagine you're a famous chef! What's your specialty?",
      ],
      games: [
        "What is your favorite game to play?",
        "If you could create a new game, what would it be like?",
        "Do you prefer indoor games or outdoor games? Why?",
        "Imagine a game where you're the main character! Describe it!",
      ],
      reading: [
        "What's the best book you ever read?",
        "If you could live inside a book, which one would you choose?",
        "What kind of stories do you enjoy the most?",
        "If you wrote a book, what would the title be?",
      ],
      science: [
        "What is your favorite science experiment?",
        "If you could discover something new, what would it be?",
        "What scientific question would you love to answer?",
        "Imagine you're a scientist who just made a breakthrough! Describe it!",
      ],
      dinosaurs: [
        "What is your favorite dinosaur? Why?",
        "If dinosaurs were alive today, what would happen?",
        "Imagine you found a dinosaur egg! What would you do?",
        "If you could ride a dinosaur, which one would you choose?",
      ],
      superheroes: [
        "If you were a superhero, what would your power be?",
        "Who is your favorite superhero and why?",
        "Create your own superhero! What's their name and power?",
        "If all superheroes were real, how would the world be different?",
      ],
      nature: [
        "What is your favorite thing about nature?",
        "Describe the most beautiful place in nature you've visited.",
        "If you could be any plant or flower, what would you be?",
        "How do you think we can take better care of nature?",
      ],
      dance: [
        "Do you like dancing? What kind of dance?",
        "If you could perform a dance anywhere in the world, where would it be?",
        "How does dancing make you feel?",
        "Imagine you're teaching a robot to dance! How would you explain it?",
      ],
      swimming: [
        "Do you like swimming? Where do you swim?",
        "If you could swim with any sea creature, which one?",
        "Imagine you discovered a treasure chest underwater! What's inside?",
        "Describe the best time you went swimming!",
      ],
      movies: [
        "What is your absolute favorite movie?",
        "If you could be any movie character, who would you be?",
        "Imagine you're making your own movie! What's it about?",
        "What movie would you watch over and over again?",
      ],
    };

    const interestPrompts = personalizedPrompts[interest];
    if (interestPrompts) {
      return interestPrompts[Math.floor(Math.random() * interestPrompts.length)];
    }
    return this.getPrompt(level, mode);
  },

  /**
   * Count total prompts
   */
  getTotalPromptCount() {
    let count = 0;
    for (const level of Object.values(this.database)) {
      for (const mode of Object.values(level)) {
        count += mode.length;
      }
    }
    return count;
  },
};
