export type QuestionType = "identify" | "build" | "speak" | "choice" | "rival";

export interface Question {
  id: number;
  type: QuestionType;
  prompt: string;
  directions: string;
  options?: string[]; // for 'choice' type — shown read-only, not tappable
  blank?: string; // for 'build' type, e.g. "The skunk ___ collecting food."
  fullSentenceExpected?: string; // for 'build' type — the complete sentence with blank filled
  targetSentence?: string; // for 'speak' type — the sentence displayed on screen for the student to read and repeat
  expectedAnswer: string;
  acceptableAnswers?: string[]; // alternative correct phrasings
  rivalLine?: string; // for 'rival' type — the wrong sentence shown first
  hint?: string;
  hint2?: string; // second-level hint after 2 failures
  hint3?: string; // third-level hint — partial answer reveal
}

export interface VocabEntry {
  word: string;
  phonetic: string;
  meaning: string;
  storyUse: string;
  audioFile?: string;
}

export interface Chapter {
  id: number;
  title: string;
  location: string;
  animal: string;
  animalEmoji: string;
  learningObjective: string;
  loDescription: string;
  accentColor: string;
  accentColorHex: string;
  bgGradient: string;
  lessonVideo: number; // require() asset for the lesson video
  lessonDescription: string; // text shown before the video
  story: {
    problem: string;
    continuation: string;
    reward: string;
  };
  vocabulary: VocabEntry[];
  questions: Question[];
}

// Intro clip played before reaching the home screen
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const introVideo = require("../assets/videos/intro.mp4");

export const chapters: Chapter[] = [
  {
    id: 1,
    title: "The Bakery District",
    location: "Bakery",
    animal: "Skunk",
    animalEmoji: "🦨",
    learningObjective: "LO1: Sentence Construction",
    loDescription: "Construct complete sentences (subject + verb + complete thought)",
    accentColor: "chapter-bakery",
    accentColorHex: "#D97706",
    bgGradient: "from-amber-900 via-amber-700 to-amber-400",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lessonVideo: require("../assets/videos/lesson-1.mp4"),
    lessonDescription:
      "In this lesson, you will learn how to construct complete sentences using a subject, a verb, and a complete thought. Watch carefully as Alex shows you the building blocks of every great sentence!",
    story: {
      problem:
        'A small skunk stands nervously near a cozy bakery, tail drooping. "Oh dear," she sniffles softly. "The humans shoo me away before I can gather food for my kits. They\'re scared of my stripes!"',
      continuation:
        "Alex tilts his head thoughtfully. He flutters up to a lamppost and squawks loudly, distracting the shopkeeper just long enough. While the humans look up in surprise, the skunk quickly gathers fallen crumbs into a little bundle.",
      reward:
        '"Thank you, kind parrot. Follow the rooftops east. They\'ll lead you to the park — it\'s greener and quieter there." Alex learns the way out of the busy city streets! 🌳',
    },
    vocabulary: [
      {
        word: "Skunk",
        phonetic: "/skʌŋk/",
        meaning: "A small black-and-white animal that can spray a very smelly liquid.",
        storyUse: "A skunk nervously stood near the bakery, hoping to collect food for her kits.",
      },
      {
        word: "Street",
        phonetic: "/striːt/",
        meaning: "A road in a city or town, usually with buildings on each side.",
        storyUse: "Alex landed on the city street and looked around for someone to help.",
      },
      {
        word: "Food",
        phonetic: "/fuːd/",
        meaning: "Things we eat to stay alive and healthy.",
        storyUse: "The skunk was trying to collect food for her young kits.",
      },
    ],
    questions: [
      {
        id: 1,
        type: "identify",
        prompt: "Is this a complete sentence? 'Skunk collecting food.'",
        directions: "Listen to the sentence. Is it a complete sentence? Say YES or NO aloud.",
        options: ["Yes", "No"],
        expectedAnswer: "No",
        hint: "A complete sentence needs a subject AND a verb that work together.",
        hint2: "Think about it — is there a word like 'is' or 'the' that makes it complete?",
        hint3: "The answer is 'No' — say it out loud!",
      },
      {
        id: 2,
        type: "build",
        prompt: "Complete the sentence by adding the missing verb.",
        directions: "Say the full sentence with the missing word filled in.",
        blank: "The skunk ___ collecting food.",
        options: ["is", "are", "were", "be"],
        expectedAnswer: "is",
        fullSentenceExpected: "The skunk is collecting food",
        acceptableAnswers: ["The skunk is collecting food."],
        hint: "The skunk is one — use the singular form.",
        hint2: "The missing word sounds like 'iz' — it starts with 'i'.",
        hint3: "The answer is 'is' — say: 'The skunk is collecting food'",
      },
      {
        id: 3,
        type: "speak",
        prompt: "Say this sentence out loud.",
        directions: "Tap the microphone and speak the sentence clearly.",
        targetSentence: "The skunk is collecting food.",
        expectedAnswer: "The skunk is collecting food",
        acceptableAnswers: ["The skunk is collecting food."],
        hint: "Remember: subject + verb + what they are doing.",
        hint2: "Start with 'The skunk is...' then finish the sentence.",
        hint3: "Say: 'The skunk is collecting food'",
      },
      {
        id: 4,
        type: "speak",
        prompt: "Say two complete sentences about the scene.",
        directions: "Tap the microphone and speak two full sentences.",
        expectedAnswer: "The skunk is collecting food. Alex is helping her.",
        acceptableAnswers: [
          "The skunk is collecting food and Alex is helping her.",
          "The skunk is gathering food. Alex is helping her.",
        ],
        hint: "Each sentence needs its own subject and verb.",
        hint2: "First: 'The skunk is collecting...' Then: 'Alex is helping...'",
        hint3: "Say: 'The skunk is collecting food. Alex is helping her.'",
      },
      {
        id: 5,
        type: "rival",
        prompt: "The rival said something wrong. Can you correct it?",
        directions: "Listen to the incorrect sentence. Say the correct version out loud.",
        rivalLine: "I collects food.",
        expectedAnswer: "The skunk is collecting food.",
        acceptableAnswers: ["The skunk collects food."],
        hint: "Who is really collecting food? Use the correct subject and verb.",
        hint2: "Replace 'I collects' with a proper subject and verb form.",
        hint3: "Say: 'The skunk is collecting food.'",
      },
    ],
  },
  {
    id: 2,
    title: "Fountain Square",
    location: "Fountain",
    animal: "Squirrel",
    animalEmoji: "🐿️",
    learningObjective: "LO2: Subject–Verb Agreement",
    loDescription: "Apply subject–verb agreement and use correct be verbs",
    accentColor: "chapter-fountain",
    accentColorHex: "#0EA5E9",
    bgGradient: "from-sky-900 via-sky-700 to-sky-400",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lessonVideo: require("../assets/videos/lesson-2.mp4"),
    lessonDescription:
      "This lesson covers subject–verb agreement. You'll learn how to match singular and plural subjects with the right verb forms, including tricky 'be' verbs like is, are, was, and were.",
    story: {
      problem:
        '"My nut is stuck in the fountain\'s grate, and I can\'t reach it!" A squirrel runs toward a fountain, tail twitching nervously.',
      continuation:
        "Alex swoops down, using his sharp beak to nudge the nut free. The squirrel squeaks with joy.",
      reward:
        '"You saved my snack! In return, I\'ll show you the path of trees. It leads beyond the park to the farmlands." Alex gains a safe route out of the city! 🌾',
    },
    vocabulary: [
      {
        word: "Squirrel",
        phonetic: "/ˈskwɜːr.əl/",
        meaning: "A small animal with a bushy tail that eats nuts and seeds.",
        storyUse: "Alex met a squirrel in the park who needed help getting her nut from the fountain.",
      },
      {
        word: "Fountain",
        phonetic: "/ˈfaʊn.tɪn/",
        meaning: "A structure that sends water upward into the air, found in parks and squares.",
        storyUse: "The squirrel's nut had fallen into the fountain's grate.",
      },
      {
        word: "Nut",
        phonetic: "/nʌt/",
        meaning: "A hard-shelled fruit that squirrels love to eat and store.",
        storyUse: "The squirrel's precious nut was stuck, and she couldn't reach it alone.",
      },
    ],
    questions: [
      {
        id: 1,
        type: "identify",
        prompt: "'It fall back inside.' — Is this correct?",
        directions: "Listen to the sentence. Does the verb agree with the subject? Say YES or NO aloud.",
        options: ["Yes", "No"],
        expectedAnswer: "No",
        hint: "The subject 'it' is singular. What ending does a singular verb need?",
        hint2: "Singular verbs usually end in -s. Does 'fall' end in -s?",
        hint3: "The answer is 'No' — say it out loud!",
      },
      {
        id: 2,
        type: "build",
        prompt: "What is the correct verb for a singular subject?",
        directions: "Say the full sentence with the missing word filled in.",
        blank: "It ___ back inside.",
        options: ["fall", "falls", "falling", "fallen"],
        expectedAnswer: "falls",
        fullSentenceExpected: "It falls back inside",
        acceptableAnswers: ["It falls back inside."],
        hint: "Singular subjects (he, she, it) use a verb ending in -s.",
        hint2: "The word sounds like 'fallz' — add an 's' to 'fall'.",
        hint3: "Say: 'It falls back inside'",
      },
      {
        id: 3,
        type: "speak",
        prompt: "Say this sentence out loud.",
        directions: "Tap the microphone and say the sentence with the right verb.",
        targetSentence: "It falls back inside.",
        expectedAnswer: "It falls back inside.",
        acceptableAnswers: ["It falls back inside"],
        hint: "It + falls = correct agreement!",
        hint2: "Remember the -s ending on 'falls'.",
        hint3: "Say: 'It falls back inside'",
      },
      {
        id: 4,
        type: "choice",
        prompt: "Which sentence uses the correct be verb?",
        directions: "Say the correct sentence aloud.",
        options: ["The squirrel are worried.", "The squirrel is worried."],
        expectedAnswer: "The squirrel is worried.",
        acceptableAnswers: ["The squirrel is worried"],
        hint: "One squirrel = singular. Use 'is' not 'are'.",
        hint2: "'Is' is for one thing, 'are' is for many things.",
        hint3: "Say: 'The squirrel is worried'",
      },
      {
        id: 5,
        type: "speak",
        prompt: "Say two sentences using correct verbs.",
        directions: "Tap the microphone and speak two complete sentences.",
        expectedAnswer: "The squirrel is worried. It takes the nut.",
        acceptableAnswers: [
          "The squirrel is worried and it takes the nut.",
        ],
        hint: "Make sure each verb matches its subject — singular or plural.",
        hint2: "First: 'The squirrel is...' Then: 'It takes...'",
        hint3: "Say: 'The squirrel is worried. It takes the nut.'",
      },
      {
        id: 6,
        type: "rival",
        prompt: "Correct the rival's sentence!",
        directions: "Listen carefully, then say the corrected version out loud.",
        rivalLine: "The squirrel take the nut and it fall again.",
        expectedAnswer: "The squirrel takes the nut and it falls again.",
        acceptableAnswers: ["The squirrel takes the nut and it falls again"],
        hint: "Both 'squirrel' and 'it' are singular — both verbs need -s.",
        hint2: "Change 'take' to 'takes' and 'fall' to 'falls'.",
        hint3: "Say: 'The squirrel takes the nut and it falls again.'",
      },
    ],
  },
  {
    id: 3,
    title: "The Farmlands of Plenty",
    location: "Farm",
    animal: "Rooster",
    animalEmoji: "🐓",
    learningObjective: "LO3: Verb Tense",
    loDescription: "Use correct verb tenses — past, present, and future",
    accentColor: "chapter-farmlands",
    accentColorHex: "#CA8A04",
    bgGradient: "from-yellow-900 via-yellow-700 to-yellow-500",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lessonVideo: require("../assets/videos/lesson-3.mp4"),
    lessonDescription:
      "Time to master verb tenses! You'll learn the difference between past, present, and future tense — and how to use irregular verbs like 'fly → flew' and 'go → went' correctly.",
    story: {
      problem:
        '"The scarecrow\'s hat blew away, and now the crows won\'t leave our field!" A proud rooster crows, but his chicks are frightened.',
      continuation:
        "Alex flutters high, retrieves the hat from a fence, and drops it back onto the scarecrow. The crows scatter with a screech.",
      reward:
        '"Bravo!" the rooster cheers. "At dawn, fly toward the rising sun. You\'ll reach the countryside forest." Alex learns the timing and direction to travel safely! 🌲',
    },
    vocabulary: [
      {
        word: "Rooster",
        phonetic: "/ˈruːs.tər/",
        meaning: "A male chicken known for crowing loudly in the morning.",
        storyUse: "The rooster crowed for help when the scarecrow's hat flew away.",
      },
      {
        word: "Fence",
        phonetic: "/fens/",
        meaning: "A barrier made of wood or wire that separates areas of land.",
        storyUse: "Alex found the hat hanging on the old wooden fence.",
      },
      {
        word: "Hat",
        phonetic: "/hæt/",
        meaning: "A covering worn on the head — or in this case, on a scarecrow.",
        storyUse: "Without its hat, the scarecrow couldn't scare the crows away.",
      },
    ],
    questions: [
      {
        id: 1,
        type: "identify",
        prompt: '"Alex fly to the fence." — Is the verb tense correct for a past event?',
        directions: "Listen to the sentence. Is the verb tense correct for a past event? Say YES or NO aloud.",
        options: ["Yes", "No"],
        expectedAnswer: "No",
        hint: "What happened already needs past tense. 'Fly' is present — what's the past?",
        hint2: "'Fly' is an irregular verb — its past form is NOT 'flyed'.",
        hint3: "The answer is 'No' — say it out loud!",
      },
      {
        id: 2,
        type: "build",
        prompt: "What is the correct past tense form of 'fly'?",
        directions: "Say the full sentence with the missing word filled in.",
        blank: "Alex ___ to the fence.",
        options: ["fly", "flyed", "flew", "flown"],
        expectedAnswer: "flew",
        fullSentenceExpected: "Alex flew to the fence",
        acceptableAnswers: ["Alex flew to the fence."],
        hint: "'Fly' is an irregular verb. Its past tense is 'flew'.",
        hint2: "It rhymes with 'new' — fl + ew.",
        hint3: "Say: 'Alex flew to the fence'",
      },
      {
        id: 3,
        type: "speak",
        prompt: "Say this sentence using the correct past tense.",
        directions: "Tap the microphone and speak the sentence out loud.",
        targetSentence: "Alex flew to the fence.",
        expectedAnswer: "Alex flew to the fence.",
        acceptableAnswers: ["Alex flew to the fence"],
        hint: "flew = past tense of fly",
        hint2: "Start with 'Alex flew...'",
        hint3: "Say: 'Alex flew to the fence'",
      },
      {
        id: 4,
        type: "speak",
        prompt: "Say one or two sentences about what happened.",
        directions: "Tap the microphone and use correct past tense verbs.",
        expectedAnswer: "Alex flew to the fence and got the hat.",
        acceptableAnswers: [
          "Alex flew to the fence and got the hat",
          "Alex flew to the fence and returned the hat.",
        ],
        hint: "Both actions happened in the past — use past tense for both!",
        hint2: "First: 'Alex flew...' Then: '...and got the hat.'",
        hint3: "Say: 'Alex flew to the fence and got the hat'",
      },
      {
        id: 5,
        type: "rival",
        prompt: "The rival used the wrong tense. Correct it!",
        directions: "Listen to the incorrect sentence. Say the corrected version out loud.",
        rivalLine: "Alex fly to the fence and return the hat.",
        expectedAnswer: "Alex flew to the fence and returned the hat.",
        acceptableAnswers: ["Alex flew to the fence and returned the hat"],
        hint: "Both 'fly' and 'return' need to be in the past tense.",
        hint2: "fly → flew, return → returned",
        hint3: "Say: 'Alex flew to the fence and returned the hat.'",
      },
    ],
  },
  {
    id: 4,
    title: "The Countryside Forest",
    location: "Forest",
    animal: "Owl",
    animalEmoji: "🦉",
    learningObjective: "LO4: Word Forms",
    loDescription: "Use correct word forms — nouns, verbs, and adjectives",
    accentColor: "chapter-countryside",
    accentColorHex: "#16A34A",
    bgGradient: "from-green-900 via-green-700 to-green-500",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lessonVideo: require("../assets/videos/lesson-4.mp4"),
    lessonDescription:
      "In this lesson, you'll explore word forms — how the same root word changes depending on whether it's used as a noun, verb, or adjective. Learn to pick the right form every time!",
    story: {
      problem:
        '"My nest is broken, and my eggs are rolling away!" A wise owl hoots sadly from a broken branch.',
      continuation:
        "Alex quickly gathers twigs and pushes the eggs gently back inside. The owl beams warmly.",
      reward:
        '"You have a brave heart, parrot. Follow the river south — it will guide you to the jungle\'s edge." Alex gains the final direction toward home! 🌿',
    },
    vocabulary: [
      {
        word: "Owl",
        phonetic: "/aʊl/",
        meaning: "A bird with large eyes that is often active at night and known for being wise.",
        storyUse: "A wise owl needed Alex's help to fix her broken nest.",
      },
      {
        word: "Nest",
        phonetic: "/nest/",
        meaning: "A structure built by birds to hold their eggs and raise their young.",
        storyUse: "The owl's nest was broken and her eggs were rolling away.",
      },
      {
        word: "Branch",
        phonetic: "/bræntʃ/",
        meaning: "A part of a tree that grows out from the trunk.",
        storyUse: "The owl's nest sat on a branch that had cracked under the wind.",
      },
    ],
    questions: [
      {
        id: 1,
        type: "identify",
        prompt: '"Alex is a bravefully bird." — Is the word form correct?',
        directions: "Listen to the sentence. Is the word form correct? Say YES or NO aloud.",
        options: ["Yes", "No"],
        expectedAnswer: "No",
        hint: "'Bravefully' is not a real word. We need an adjective here, not an adverb.",
        hint2: "Adjectives describe nouns. What's the adjective form of 'brave'?",
        hint3: "The answer is 'No' — say it out loud!",
      },
      {
        id: 2,
        type: "build",
        prompt: "Replace the incorrect word with the correct form.",
        directions: "Say the full sentence with the correct word.",
        blank: "Alex is a ___ bird.",
        options: ["bravefully", "braveness", "brave", "bravely"],
        expectedAnswer: "brave",
        fullSentenceExpected: "Alex is a brave bird",
        acceptableAnswers: ["Alex is a brave bird."],
        hint: "We describe 'bird' — so we need an adjective.",
        hint2: "The word is simple — just 'brave', no extra ending.",
        hint3: "Say: 'Alex is a brave bird'",
      },
      {
        id: 3,
        type: "speak",
        prompt: "Say this sentence using the correct word form.",
        directions: "Tap the microphone and speak clearly.",
        targetSentence: "Alex is a brave bird.",
        expectedAnswer: "Alex is a brave bird.",
        acceptableAnswers: ["Alex is a brave bird"],
        hint: "Adjectives describe nouns. 'Brave' describes 'bird'.",
        hint2: "Say each word clearly: 'Alex... is... a... brave... bird.'",
        hint3: "Say: 'Alex is a brave bird'",
      },
      {
        id: 4,
        type: "speak",
        prompt: "Say two sentences about the scene using correct word forms.",
        directions: "Tap the microphone and speak two full sentences.",
        expectedAnswer: "Alex is a brave bird. He helps the owl.",
        acceptableAnswers: [
          "Alex is a brave bird and he helps the owl.",
        ],
        hint: "Use 'brave' as an adjective, and 'helps' as a present tense verb.",
        hint2: "First: 'Alex is a brave bird.' Then: 'He helps the owl.'",
        hint3: "Say: 'Alex is a brave bird. He helps the owl.'",
      },
      {
        id: 5,
        type: "rival",
        prompt: "Fix the rival's incorrect word form!",
        directions: "Listen to the incorrect sentence, then say the correct one out loud.",
        rivalLine: "Alex is bravefully bird.",
        expectedAnswer: "Alex is a brave bird.",
        acceptableAnswers: ["Alex is a brave bird"],
        hint: "Two problems: missing 'a' before bird, and 'bravefully' should be 'brave'.",
        hint2: "Add 'a' before 'brave bird' and fix the adjective form.",
        hint3: "Say: 'Alex is a brave bird.'",
      },
    ],
  },
  {
    id: 5,
    title: "The Jungle's Edge",
    location: "Jungle",
    animal: "Parrot",
    animalEmoji: "🦜",
    learningObjective: "LO5: Full Application",
    loDescription: "Apply all grammar skills: sentences, agreement, tense, and word forms",
    accentColor: "chapter-jungle",
    accentColorHex: "#15803D",
    bgGradient: "from-emerald-950 via-emerald-800 to-violet-800",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lessonVideo: require("../assets/videos/lesson-5.mp4"),
    lessonDescription:
      "The final lesson! This is a summary of everything you've learned — sentence construction, subject–verb agreement, verb tenses, and word forms. Put it all together as Alex finds his way home!",
    story: {
      problem:
        'Alex follows the river until the trees grow taller and thicker. His heart beats fast. He squawks loudly: "Family! I\'m back!"',
      continuation:
        "His mate answers, and his fledgling flutters down from the canopy. The jungle sings again with the sounds of reunion.",
      reward:
        "Alex is finally home. The journey through the city, park, farmlands, and forest has taught him — and you — so much. The jungle welcomes you both! 🏆",
    },
    vocabulary: [
      {
        word: "Journey",
        phonetic: "/ˈdʒɜːr.ni/",
        meaning: "A long trip from one place to another.",
        storyUse: "Alex's long journey through the city, park, farm, and forest finally brought him home.",
      },
      {
        word: "Reunion",
        phonetic: "/riːˈjuː.ni.ən/",
        meaning: "When people or family members come together again after being apart.",
        storyUse: "The reunion in the jungle was the most joyful moment of Alex's quest.",
      },
      {
        word: "Adventure",
        phonetic: "/ədˈven.tʃər/",
        meaning: "An exciting and sometimes dangerous journey or experience.",
        storyUse: "Alex's adventure helped animals along the way and taught him valuable lessons.",
      },
    ],
    questions: [
      {
        id: 1,
        type: "speak",
        prompt: "What did Alex do on his journey?",
        directions: "Tap the microphone and answer in a complete sentence.",
        expectedAnswer: "Alex helped animals.",
        acceptableAnswers: [
          "Alex helped animals",
          "Alex helped many animals.",
          "Alex helped the animals.",
        ],
        hint: "Use a subject (Alex) and a verb (helped) plus what he did.",
        hint2: "Start with 'Alex helped...'",
        hint3: "Say: 'Alex helped animals'",
      },
      {
        id: 2,
        type: "build",
        prompt: "Fill in the blank with the correct past tense verb.",
        directions: "Say the full sentence with the missing word filled in.",
        blank: "Alex ___ many animals.",
        options: ["help", "helping", "helped", "helps"],
        expectedAnswer: "helped",
        fullSentenceExpected: "Alex helped many animals",
        acceptableAnswers: ["Alex helped many animals."],
        hint: "This happened in the past — use past tense!",
        hint2: "Add -ed to 'help' to make it past tense.",
        hint3: "Say: 'Alex helped many animals'",
      },
      {
        id: 3,
        type: "speak",
        prompt: "Say this sentence out loud.",
        directions: "Tap the microphone and speak the sentence clearly.",
        targetSentence: "Alex helped many animals.",
        expectedAnswer: "Alex helped many animals.",
        acceptableAnswers: ["Alex helped many animals"],
        hint: "helped = past tense of help",
        hint2: "Say each word: 'Alex... helped... many... animals.'",
        hint3: "Say: 'Alex helped many animals'",
      },
      {
        id: 4,
        type: "speak",
        prompt: "Extend your answer with a second sentence.",
        directions: "Tap the microphone and say two sentences.",
        expectedAnswer: "Alex helped many animals and they helped him.",
        acceptableAnswers: [
          "Alex helped many animals and they helped him",
          "Alex helped many animals and they helped him too.",
        ],
        hint: "Two complete clauses joined by 'and' — both in past tense!",
        hint2: "First: 'Alex helped many animals...' Then: '...and they helped him.'",
        hint3: "Say: 'Alex helped many animals and they helped him'",
      },
      {
        id: 5,
        type: "rival",
        prompt: "The rival made many mistakes. Can you fix them all?",
        directions: "Listen to the rival's sentence, then say the correct version out loud.",
        rivalLine: "Alex help many animal and he go home.",
        expectedAnswer: "Alex helped many animals and he went home.",
        acceptableAnswers: ["Alex helped many animals and he went home"],
        hint: "Fix: help → helped, animal → animals, go → went",
        hint2: "Three fixes needed: past tense, plural, and irregular past tense.",
        hint3: "Say: 'Alex helped many animals and he went home.'",
      },
    ],
  },
];

export const getChapter = (id: number): Chapter | undefined =>
  chapters.find((c) => c.id === id);
