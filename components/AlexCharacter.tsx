import { useEffect, useRef } from "react";
import { MotiView } from "moti";
import { Pressable, View } from "react-native";
import LottieView from "lottie-react-native";
import { ThoughtBubble } from "./ThoughtBubble";
import type { AlexMood } from "@/hooks/useAlexAnimation";

export type AlexVariant = "home" | "chapter" | "falling" | "celebrating" | "small";

interface Props {
  mood?: AlexMood;
  variant?: AlexVariant;
  showBubble?: boolean;
  bubbleText?: string;
  onClick?: () => void;
  className?: string;
}

const VARIANT_SIZE: Record<AlexVariant, number> = {
  home: 180,
  chapter: 140,
  falling: 160,
  celebrating: 200,
  small: 72,
};

const MOOD_ANIMATE: Record<AlexMood, object> = {
  idle: { rotate: ["0deg", "2deg", "0deg", "-2deg", "0deg"], scale: 1 },
  happy: { scale: [1, 1.08, 1], translateY: [0, -8, 0] },
  worried: { rotate: ["-4deg", "4deg", "-4deg", "4deg", "0deg"] },
  cheer: { scale: [1, 1.15, 1, 1.15, 1], translateY: [0, -14, 0, -14, 0] },
  falling: { rotate: ["0deg", "360deg"], translateY: [0, 20] },
  thinking: { rotate: "4deg", scale: 0.95 },
};

const MOOD_TRANSITION: Record<AlexMood, object> = {
  idle: { loop: true, duration: 4000, type: "timing" },
  happy: { type: "spring", stiffness: 150, damping: 12 },
  worried: { duration: 500, type: "timing" },
  cheer: { type: "spring", stiffness: 200, damping: 10 },
  falling: { loop: true, duration: 1200, type: "timing" },
  thinking: { duration: 300, type: "timing" },
};

const MOOD_SPEED: Record<AlexMood, number> = {
  idle: 0.6,
  happy: 1.3,
  cheer: 2.2,
  worried: 0.5,
  thinking: 0.4,
  falling: 1.8,
};

function AlexLottie({ size, mood }: { size: number; mood: AlexMood }) {
  const ref = useRef<LottieView>(null);

  useEffect(() => {
    ref.current?.reset();
    ref.current?.play();
  }, [mood]);

  return (
    <LottieView
      ref={ref}
      source={require("../assets/Parrot.json")}
      style={{ width: size, height: size }}
      speed={MOOD_SPEED[mood]}
      loop
      autoPlay
      hardwareAccelerationAndroid
    />
  );
}

export function AlexCharacter({
  mood = "idle",
  variant = "home",
  showBubble = false,
  bubbleText = "",
  onClick,
}: Props) {
  const size = VARIANT_SIZE[variant];

  return (
    <View style={{ alignItems: "center" }}>
      {showBubble && <ThoughtBubble text={bubbleText} show={showBubble} />}
      <MotiView
        animate={MOOD_ANIMATE[mood]}
        transition={MOOD_TRANSITION[mood]}
      >
        {onClick ? (
          <Pressable onPress={onClick} style={{ alignItems: "center" }}>
            <AlexLottie size={size} mood={mood} />
          </Pressable>
        ) : (
          <AlexLottie size={size} mood={mood} />
        )}
      </MotiView>
    </View>
  );
}
