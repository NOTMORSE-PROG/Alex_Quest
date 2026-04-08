import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useMapScroll } from "./MapScrollContext";

interface Props {
  /** 0 = fixed to screen, 1 = scrolls at normal speed. Values < 1 scroll slower (depth). */
  factor: number;
  children: React.ReactNode;
  style?: object;
  pointerEvents?: "none" | "box-none" | "box-only" | "auto";
}

export function MapParallaxLayer({ factor, children, style, pointerEvents = "none" }: Props) {
  const scrollY = useMapScroll();
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * (1 - factor) }],
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, animStyle, style]}
      pointerEvents={pointerEvents}
    >
      {children}
    </Animated.View>
  );
}
