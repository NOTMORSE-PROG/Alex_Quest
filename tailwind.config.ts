import type { Config } from "tailwindcss";

const config: Config = {
  // NativeWind v4 preset
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#F5A623",
        sky: "#4AADE8",
        success: "#58CC02",
        warning: "#FF9600",
        danger: "#FF4B4B",
        navy: "#1A1A2E",
        cream: "#FDF8F0",
        chapter: {
          city: "#8B5CF6",
          park: "#10B981",
          farm: "#F59E0B",
          forest: "#3B82F6",
          jungle: "#22C55E",
        },
      },
      fontFamily: {
        display: ["FredokaOne_400Regular"],
        body: ["Nunito_700Bold"],
      },
    },
  },
  plugins: [],
};
export default config;
