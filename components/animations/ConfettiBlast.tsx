import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

interface Props {
  fire?: boolean;
}

export function ConfettiBlast({ fire = false }: Props) {
  const ref = useRef<ConfettiCannon>(null);

  useEffect(() => {
    if (fire && ref.current) {
      ref.current.start();
    }
  }, [fire]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <ConfettiCannon
        ref={ref}
        count={40}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut
        colors={["#F5A623", "#4AADE8", "#58CC02", "#FF4B4B", "#8B5CF6"]}
      />
    </View>
  );
}
