import { MotiView } from "moti";
import { Pressable, View } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
} from "react-native-svg";
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

// Mood → Moti animation props
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
  happy: { loop: true, duration: 600, type: "timing" },
  worried: { loop: true, duration: 300, type: "timing" },
  cheer: { loop: true, duration: 500, type: "timing" },
  falling: { loop: true, duration: 1200, type: "timing" },
  thinking: { duration: 300, type: "timing" },
};

function AlexSVG({ size, mood }: { size: number; mood: AlexMood }) {
  const isThinking = mood === "thinking";
  const isHappy = mood === "happy" || mood === "cheer";

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Shadow */}
      <Ellipse cx="50" cy="94" rx="18" ry="4" fill="rgba(0,0,0,0.15)" />

      {/* Tail feathers */}
      <Path d="M38 72 Q30 85 22 88 Q28 80 32 70Z" fill="#22C55E" />
      <Path d="M50 75 Q45 90 40 95 Q44 84 46 73Z" fill="#16A34A" />
      <Path d="M62 72 Q70 85 78 88 Q72 80 68 70Z" fill="#22C55E" />

      {/* Body */}
      <Ellipse cx="50" cy="62" rx="24" ry="26" fill="#16A34A" />

      {/* Wing left */}
      <Path d="M26 55 Q14 60 16 75 Q22 68 30 65Z" fill="#15803D" />
      {/* Wing right */}
      <Path d="M74 55 Q86 60 84 75 Q78 68 70 65Z" fill="#15803D" />

      {/* Belly patch */}
      <Ellipse cx="50" cy="66" rx="14" ry="16" fill="#86EFAC" />

      {/* Head */}
      <Circle cx="50" cy="38" r="22" fill="#22C55E" />

      {/* Head feather crest */}
      <Path d="M50 16 Q46 8 42 4 Q48 10 50 16Z" fill="#FBBF24" />
      <Path d="M50 16 Q50 6 50 2 Q52 8 50 16Z" fill="#F59E0B" />
      <Path d="M50 16 Q54 8 58 4 Q52 10 50 16Z" fill="#FBBF24" />

      {/* Eye whites */}
      <Circle cx="40" cy="36" r="7" fill="white" />
      <Circle cx="60" cy="36" r="7" fill="white" />

      {/* Pupils */}
      {isThinking ? (
        <>
          {/* Squinting eyes for thinking */}
          <Path d="M35 35 Q40 32 45 35" stroke="#1A1A2E" strokeWidth="2" fill="none" strokeLinecap="round" />
          <Path d="M55 35 Q60 32 65 35" stroke="#1A1A2E" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx="41" cy="36" r="4" fill="#1A1A2E" />
          <Circle cx="61" cy="36" r="4" fill="#1A1A2E" />
          {/* Shine dots */}
          <Circle cx="43" cy="34" r="1.5" fill="white" />
          <Circle cx="63" cy="34" r="1.5" fill="white" />
        </>
      )}

      {/* Beak */}
      {isHappy ? (
        // Open beak for happy/cheer
        <>
          <Path d="M44 46 Q50 44 56 46 Q50 56 44 46Z" fill="#F59E0B" />
          <Path d="M44 46 Q50 52 56 46" fill="#B45309" />
        </>
      ) : (
        // Closed beak
        <Path d="M44 46 Q50 42 56 46 Q50 50 44 46Z" fill="#F59E0B" />
      )}

      {/* Red cheek patches */}
      <Circle cx="34" cy="42" r="4" fill="#EF4444" opacity={0.7} />
      <Circle cx="66" cy="42" r="4" fill="#EF4444" opacity={0.7} />

      {/* Sparkles for happy/cheer */}
      {isHappy && (
        <G>
          <Path d="M20 20 L22 24 L20 28 L18 24Z" fill="#FBBF24" />
          <Path d="M16 24 L20 22 L24 24 L20 26Z" fill="#FBBF24" />
          <Path d="M76 18 L78 22 L76 26 L74 22Z" fill="#FBBF24" />
          <Path d="M72 22 L76 20 L80 22 L76 24Z" fill="#FBBF24" />
          <Circle cx="82" cy="30" r="2" fill="#F59E0B" />
          <Circle cx="18" cy="32" r="2" fill="#F59E0B" />
        </G>
      )}

      {/* Feet */}
      <Path d="M40 86 Q38 90 36 88 M40 86 Q40 91 38 91 M40 86 Q42 90 44 88" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <Path d="M60 86 Q58 90 56 88 M60 86 Q60 91 58 91 M60 86 Q62 90 64 88" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    </Svg>
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
            <AlexSVG size={size} mood={mood} />
          </Pressable>
        ) : (
          <AlexSVG size={size} mood={mood} />
        )}
      </MotiView>
    </View>
  );
}
