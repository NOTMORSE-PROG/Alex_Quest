import { Link, usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";

const navItems = [
  { href: "/home" as const, label: "Home", icon: "🏠" },
  { href: "/map" as const, label: "Map", icon: "🗺️" },
  { href: "/vocabulary" as const, label: "Vocab", icon: "📖" },
];

export function BottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} style={styles.link}>
            <MotiView
              animate={{ scale: isActive ? 1 : 0.95 }}
              style={[styles.item, isActive && styles.itemActive]}
            >
              <Text style={[styles.icon, !isActive && styles.iconInactive]}>
                {item.icon}
              </Text>
              <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
                {item.label}
              </Text>
              {isActive && (
                <MotiView
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={styles.dot}
                />
              )}
            </MotiView>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${colors.navy}F2`,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 8,
  },
  link: {
    flex: 1,
  },
  item: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  itemActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  icon: {
    fontSize: 22,
  },
  iconInactive: {
    opacity: 0.6,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  labelActive: {
    color: colors.gold,
  },
  labelInactive: {
    color: "rgba(255,255,255,0.5)",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginTop: 2,
  },
});
