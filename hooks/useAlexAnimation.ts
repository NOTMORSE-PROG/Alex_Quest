import { useState, useCallback, useRef } from "react";

export type AlexMood = "idle" | "happy" | "worried" | "cheer" | "falling" | "thinking";

const PHRASES = [
  "Let's go!",
  "Can you help me?",
  "We're getting closer!",
  "You can do it!",
  "Almost home!",
  "Squawk! You're amazing!",
  "Words are like wings!",
  "I miss my family... keep going!",
  "One more step to home!",
  "Practice makes perfect!",
  "You're my favorite student!",
  "Say it loud and proud!",
  "Together we'll make it!",
  "The jungle is calling!",
  "Polly wants good grammar!",
];

export function useAlexAnimation() {
  const [mood, setMood] = useState<AlexMood>("idle");
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState(PHRASES[0]);
  const phraseIndexRef = useRef(0);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tap = useCallback((): string => {
    phraseIndexRef.current = (phraseIndexRef.current + 1) % PHRASES.length;
    const phrase = PHRASES[phraseIndexRef.current];
    setBubbleText(phrase);
    setMood("happy");
    setShowBubble(true);

    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setShowBubble(false);
      setMood("idle");
    }, 3000);

    return phrase;
  }, []);

  const celebrate = useCallback(() => {
    setMood("cheer");
    setShowBubble(true);
    setBubbleText("Amazing! ⭐");
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setShowBubble(false);
      setMood("idle");
    }, 4000);
  }, []);

  const worry = useCallback(() => {
    setMood("worried");
    setShowBubble(true);
    setBubbleText("Try again! You got this!");
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setShowBubble(false);
      setMood("idle");
    }, 3000);
  }, []);

  const think = useCallback(() => {
    setMood("thinking");
    setShowBubble(false);
  }, []);

  const resetMood = useCallback(() => {
    setMood("idle");
    setShowBubble(false);
  }, []);

  return { mood, showBubble, bubbleText, tap, celebrate, worry, think, resetMood };
}
