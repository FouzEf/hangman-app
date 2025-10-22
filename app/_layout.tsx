import { Stack } from "expo-router";
import { SoundSettingsProvider } from "../audio/SoundSettingsContext";
import ExitGuardProvider from "../providers/ExitGuardProvider";

export default function RootLayout() {
  return (
    <SoundSettingsProvider>
      <ExitGuardProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{ title: "Home", headerShown: false }}
          />
          <Stack.Screen
            name="gamePage"
            options={{ headerTitle: "Game", headerShown: false }}
          />
          <Stack.Screen
            name="winPage"
            options={{ headerTitle: "Win", headerShown: false }}
          />
        </Stack>
      </ExitGuardProvider>
    </SoundSettingsProvider>
  );
}
