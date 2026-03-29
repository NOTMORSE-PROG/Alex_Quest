export type QuestionType = "identify" | "build" | "speak" | "choice" | "rival";

export interface Question {
  id: number;
  type: QuestionType;
  prompt: string;
  directions: string;
  options?: string[]; // for 'choice' type
  blank?: string; // for 'build' type, e.g. "The skunk ___ collecting food."
  expectedAnswer: string;
  rivalLine?: string; // for 'rival' type — the wrong sentence shown first
  hint?: string;
  xpValue: number;
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
  story: {
    problem: string;
    continuation: string;
    reward: string;
  };
  vocabulary: VocabEntry[];
  questions: Question[];
}

export const chapters: Chapter[] = [
  {
    id: 1,
    title: "The City Streets",
    location: "City",
    animal: "Skunk",
    animalEmoji: "🦨",
    learningObjective: "LO1: Sentence Construction",
    loDescription: "Construct complete sentences (subject + verb + complete thought)",
    accentColor: "chapter-city",
    accentColorHex: "#8B5CF6",
    bgGradient: "from-purple-900 via-purple-700 to-purple-500",
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
        directions: "Read or listen to the sentence. Decide if it is complete or incomplete. Answer Yes or No.",
        options: ["Yes", "No"],
        expectedAnswer: "No",
        hint: "A complete sentence needs a subject AND a verb that work together.",
        xpValue: 10,
      },
      {
        id: 2,
        type: "build",
        prompt: "Complete the sentence by adding the missing verb.",
        directions: "Choose the correct word to fill in the blank.",
        blank: "The skunk ___ collecting food.",
        options: ["is", "are", "were", "be"],
        expectedAnswer: "is",
        hint: "The skunk is one — use the singular form.",
        xpValue: 15,
      },
      {
        id: 3,
        type: "speak",
        prompt: "Say the complete sentence clearly.",
        directions: "Tap the microphone and speak the sentence out loud.",
        expectedAnswer: "The skunk is collecting food",
        hint: "Remember: subject + verb + what they are doing.",
        xpValue: 20,
      },
      {
        id: 4,
        type: "speak",
        prompt: "Say two complete sentences about the scene.",
        directions: "Look at the picture and say two full sentences about what you see.",
        expectedAnswer: "The skunk is collecting food. Alex is helping her.",
        hint: "Each sentence needs its own subject and verb.",
        xpValue: 25,
      },
      {
        id: 5,
        type: "rival",
        prompt: "The rival said something wrong. Can you correct it?",
        directions: "Listen to the incorrect sentence. Say the correct version out loud.",
        rivalLine: "I collects food.",
        expectedAnswer: "The skunk is collecting food.",
        hint: "Who is really collecting food? Use the correct subject and verb.",
        xpValue: 30,
      },
    ],
  },
  {
    id: 2,
    title: "The Park of Possibilities",
    location: "Park",
    animal: "Squirrel",
    animalEmoji: "🐿️",
    learningObjective: "LO2: Subject–Verb Agreement",
    loDescription: "Apply subject–verb agreement and use correct be verbs",
    accentColor: "chapter-park",
    accentColorHex: "#10B981",
    bgGradient: "from-emerald-900 via-emerald-700 to-emerald-500",
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
        directions: "Listen and check if the verb agrees with the subject. Answer Yes or No.",
        options: ["Yes", "No"],
        expectedAnswer: "No",
        hint: "The subject 'it' is singular. What ending does a singular verb need?",
        xpValue: 10,
      },
      {
        id: 2,
        type: "build",
        prompt: "What is the correct verb for a singular subject?",
        directions: "The subject 'it' is singular. Choose the correct verb form.",
        blank: "It ___ back inside.",
        options: ["fall", "falls", "falling", "fallen"],
        expectedAnswer: "falls",
        hint: "Singular subjects (he, she, it) use a verb ending in -s.",
        xpValue: 15,
      },
      {
        id: 3,
        type: "speak",
        prompt: "Say the correct sentence.",
        directions: "Tap the microphone and say the sentence with the right verb.",
        expectedAnswer: "It falls back inside.",
        hint: "It + falls = correct agreement!",
        xpValue: 20,
      },
      {
        id: 4,
        type: "choice",
        prompt: "Which sentence uses the correct be verb?",
        directions: "Choose the sentence that is grammatically correct.",
        options: ["The squirrel are worried.", "The squirrel is worried."],
        expectedAnswer: "The squirrel is worried.",
        hint: "One squirrel = singular. Use 'is' not 'are'.",
        xpValue: 20,
      },
      {
        id: 5,
        type: "speak",
        prompt: "Say two sentences using correct verbs.",
        directions: "Speak two complete sentences about the squirrel.",
        expectedAnswer: "The squirrel is worried. It takes the nut.",
        hint: "Make sure each verb matches its subject — singular or plural.",
        xpValue: 25,
      },
      {
        id: 6,
        type: "rival",
        prompt: "Correct the rival's sentence!",
        directions: "Listen carefully, then say the corrected version.",
        rivalLine: "The squirrel take the nut and it fall again.",
        expectedAnswer: "The squirrel takes the nut and it falls again.",
        hint: "Both 'squirrel' and 'it' are singular — both verbs need -s.",
        xpValue: 30,
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
    accentColor: "chapter-farm",
    accentColorHex: "#F59E0B",
    bgGradient: "from-amber-900 via-amber-700 to-amber-500",
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
        directions: "Read or listen carefully. Check if the verb matches the past tense context. Answer Yes or No.",
        options: ["Yes", "No"],
        expectedAnswer: "No",
        hint: "What happened already needs past tense. 'Fly' is present — what's the past?",
        xpValue: 10,
      },
      {
        id: 2,
        type: "build",
        prompt: "What is the correct past tense form of 'fly'?",
        directions: "Think about the correct past tense form and say or choose the answer.",
        blank: "Alex ___ to the fence.",
        options: ["fly", "flyed", "flew", "flown"],
        expectedAnswer: "flew",
        hint: "'Fly' is an irregular verb. Its past tense is 'flew'.",
        xpValue: 15,
      },
      {
        id: 3,
        type: "speak",
        prompt: "Say the complete sentence using correct past tense.",
        directions: "Speak clearly and confidently into the microphone.",
        expectedAnswer: "Alex flew to the fence.",
        hint: "flew = past tense of fly",
        xpValue: 20,
      },
      {
        id: 4,
        type: "speak",
        prompt: "Say one or two sentences about what happened.",
        directions: "Use correct past tense verbs in your answer.",
        expectedAnswer: "Alex flew to the fence and got the hat.",
        hint: "Both actions happened in the past — use past tense for both!",
        xpValue: 25,
      },
      {
        id: 5,
        type: "rival",
        prompt: "The rival used the wrong tense. Correct it!",
        directions: "Listen to the incorrect sentence. Say the corrected version with proper tense.",
        rivalLine: "Alex fly to the fence and return the hat.",
        expectedAnswer: "Alex flew to the fence and returned the hat.",
        hint: "Both 'fly' and 'return' need to be in the past tense.",
        xpValue: 30,
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
    accentColor: "chapter-forest",
    accentColorHex: "#3B82F6",
    bgGradient: "from-blue-900 via-blue-700 to-blue-500",
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
        directions: "Read or listen carefully. Check if the word form is correct. Answer Yes or No.",
        options: ["Yes", "No"],
        expectedAnswer: "No",
        hint: "'Bravefully' is not a real word. We need an adjective here, not an adverb.",
        xpValue: 10,
      },
      {
        id: 2,
        type: "build",
        prompt: "Replace the incorrect word with the correct form.",
        directions: "Identify the wrong word and choose the right form.",
        blank: "Alex is a ___ bird.",
        options: ["bravefully", "braveness", "brave", "bravely"],
        expectedAnswer: "brave",
        hint: "We describe 'bird' — so we need an adjective.",
        xpValue: 15,
      },
      {
        id: 3,
        type: "speak",
        prompt: "Say the complete sentence using the correct word form.",
        directions: "Speak clearly and naturally.",
        expectedAnswer: "Alex is a brave bird.",
        hint: "Adjectives describe nouns. 'Brave' describes 'bird'.",
        xpValue: 20,
      },
      {
        id: 4,
        type: "speak",
        prompt: "Say two sentences about the scene using correct word forms.",
        directions: "Use adjectives, verbs, and nouns correctly in your answer.",
        expectedAnswer: "Alex is a brave bird. He helps the owl.",
        hint: "Use 'brave' as an adjective, and 'helps' as a present tense verb.",
        xpValue: 25,
      },
      {
        id: 5,
        type: "rival",
        prompt: "Fix the rival's incorrect word form!",
        directions: "Listen to the incorrect sentence, then say the correct one aloud.",
        rivalLine: "Alex is bravefully bird.",
        expectedAnswer: "Alex is a brave bird.",
        hint: "Two problems: missing 'a' before bird, and 'bravefully' should be 'brave'.",
        xpValue: 30,
      },
    ],
  },
  {
    id: 5,
    title: "The Jungle's Edge — Home at Last",
    location: "Jungle",
    animal: "Parrot",
    animalEmoji: "🦜",
    learningObjective: "LO5: Full Application",
    loDescription: "Apply all grammar skills: sentences, agreement, tense, and word forms",
    accentColor: "chapter-jungle",
    accentColorHex: "#22C55E",
    bgGradient: "from-green-900 via-green-700 to-green-500",
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
        directions: "Answer the question in a complete sentence.",
        expectedAnswer: "Alex helped animals.",
        hint: "Use a subject (Alex) and a verb (helped) plus what he did.",
        xpValue: 15,
      },
      {
        id: 2,
        type: "build",
        prompt: "Fill in the blank with the correct past tense verb.",
        directions: "Choose the word that correctly completes the sentence.",
        blank: "Alex ___ many animals.",
        options: ["help", "helping", "helped", "helps"],
        expectedAnswer: "helped",
        hint: "This happened in the past — use past tense!",
        xpValue: 20,
      },
      {
        id: 3,
        type: "speak",
        prompt: "Say the complete sentence.",
        directions: "Speak the sentence clearly with the correct past tense verb.",
        expectedAnswer: "Alex helped many animals.",
        hint: "helped = past tense of help",
        xpValue: 20,
      },
      {
        id: 4,
        type: "speak",
        prompt: "Extend your answer with a second sentence.",
        directions: "Say two sentences: what Alex did, and what happened as a result.",
        expectedAnswer: "Alex helped many animals and they helped him.",
        hint: "Two complete clauses joined by 'and' — both in past tense!",
        xpValue: 25,
      },
      {
        id: 5,
        type: "rival",
        prompt: "The rival made many mistakes. Can you fix them all?",
        directions: "Listen to the rival's sentence, then say the correct version applying everything you've learned.",
        rivalLine: "Alex help many animal and he go home.",
        expectedAnswer: "Alex helped many animals and he went home.",
        hint: "Fix: help → helped, animal → animals, go → went",
        xpValue: 40,
      },
    ],
  },
];

export const getChapter = (id: number): Chapter | undefined =>
  chapters.find((c) => c.id === id);

export const CHAPTER_XP_BASE = 100;
export const QUESTION_XP: Record<number, number> = { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30, 6: 30 };
