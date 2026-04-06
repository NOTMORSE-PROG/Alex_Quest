import { Component, useEffect } from "react";
import type { ReactNode } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { AppState, ScrollView, Text, View } from "react-native";
import { BadgeCelebration } from "@/components/ui/BadgeCelebration";
import { flushPendingStorage } from "@/store/gameStore";
import {
  Fredoka_400Regular,
} from "@expo-google-fonts/fredoka";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import "../global.css";

SplashScreen.preventAutoHideAsync();

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <View style={{ flex: 1, backgroundColor: "#1a0000", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: "#ff6b6b", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
            App crashed
          </Text>
          <ScrollView>
            <Text style={{ color: "#ffaaaa", fontSize: 13, fontFamily: "monospace" }}>
              {err.message}{"\n\n"}{err.stack}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_400Regular,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Flush any pending debounced storage write when app goes to background,
  // preventing data loss if the user force-quits before the 3s timer fires.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        flushPendingStorage();
      }
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
          <BadgeCelebration />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
