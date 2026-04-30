# Alex's Quest

A children's English learning adventure built with Expo and React Native. Learners follow Alex through chapters of story-based lessons, speaking their answers aloud while on-device speech recognition scores pronunciation, content, and fluency.

## Stack

- **Expo SDK 55** / **React Native 0.83** / **React 19**
- **expo-router** (typed routes) for file-based navigation
- **NativeWind** (Tailwind) for styling
- **Zustand** for global state ([store/gameStore.ts](store/gameStore.ts), [store/teacherStore.ts](store/teacherStore.ts))
- **whisper.rn** for on-device Whisper transcription + confidence scoring
- **expo-speech-recognition** as a fallback recognizer
- **expo-audio** / **expo-av** for recording and playback
- **moti** + **react-native-reanimated** + **lottie-react-native** for animations

## Getting started

```bash
npm install
npm run start        # Expo dev server
npm run android      # native Android build
npm run ios          # native iOS build
npm run web          # web build
npm run lint
```

A development build is required (the app uses native modules — `whisper.rn`, `expo-speech-recognition`, `expo-audio`). Expo Go will not work.

## Project layout

```
app/            expo-router routes (chapter, journey, quest, lesson, teacher, tutorial, …)
components/    UI, gameplay, map, teacher, tutorial, animations
hooks/         useWhisper, useSpeechRecognition, useAudio(Recorder), useAlexAnimation, useMusicPlayer
lib/           assessmentEngine, speechScore, phonemeAlignment, cmuDictionary,
               feedbackGenerator, grammarCheck, badgeEngine, chaptersData,
               teacherRubricData, wordOfTheDay, alexSpeech, theme, config
store/         Zustand stores (game, teacher)
types/         shared TypeScript types
assets/        images, fonts, lottie, audio
patches/       patch-package patches (applied via postinstall)
```

## Assessment

Scoring is composed in [lib/assessmentEngine.ts](lib/assessmentEngine.ts) using weights and thresholds from [lib/config.ts](lib/config.ts):

- **Content** — does the answer match the expected response (50%)
- **Pronunciation** — Whisper confidence mapped via `confidenceToPronunciationScore` (40%)
- **Fluency** — pacing/naturalness (10%)
- Pass threshold: **80**. After `maxHintLevel` wrong attempts, the answer is revealed.

Phoneme-level feedback uses the bundled CMU dictionary ([lib/cmuDictionary.ts](lib/cmuDictionary.ts)) and Needleman–Wunsch alignment ([lib/phonemeAlignment.ts](lib/phonemeAlignment.ts)) to surface the specific sounds a learner missed.

## Teacher mode

Routes under [app/teacher/](app/teacher/) provide a PIN-gated teacher portal with assessment history and rubric data ([lib/teacherRubricData.ts](lib/teacherRubricData.ts)).

## Permissions

- **iOS** — `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`
- **Android** — `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`

Both are declared in [app.json](app.json).

## Build / release

EAS is configured ([eas.json](eas.json), `extra.eas.projectId` in [app.json](app.json)). Bundle id / package: `com.alexsquest.app`.
