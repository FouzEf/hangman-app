import { Nunito_400Regular, Nunito_800ExtraBold, useFonts } from "@expo-google-fonts/nunito";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const PRIVACY_POLICY_URL = "https://github.com/FouzEf/hangman-app/blob/main/docs/privacy-policy.md";
const TERMS_URL = "https://github.com/FouzEf/hangman-app/blob/main/docs/docs/terms-of-service.md";
const FEEDBACK_EMAIL = "fouzefcode@gmail.com";
const APP_VERSION = "1.0.1";

const FAQ_ITEMS = [
  {
    q: "How do I start a game?",
    a: 'Tap "Start Game" on the home screen, then choose a difficulty level (Easy, Medium, or Hard).',
  },
  {
    q: "How many wrong guesses am I allowed?",
    a: "You have 6 wrong guesses before the hangman is complete and the game ends.",
  },
  {
    q: "What happens when I complete a level?",
    a: "Once you solve all words in a level, you reach the Victory screen. You can restart the level or go back home.",
  },
  {
    q: "Can I turn off the sound?",
    a: "Yes — tap the headphone icon in the top-right corner of any screen to toggle sound on or off.",
  },
  {
    q: "How do I reset my progress?",
    a: 'On the Victory screen, tap "Restart Level" to reset and replay that difficulty.',
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AboutModal({ visible, onClose }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [fontsLoaded] = useFonts({ Nunito_800ExtraBold, Nunito_400Regular });

  if (!fontsLoaded) return null;

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const openEmail = () => {
    Linking.openURL(
      `mailto:${FEEDBACK_EMAIL}?subject=Hangman%20App%20Feedback`
    );
  };

  return (
    <Modal transparent animationType="slide" visible={visible} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>About & Support</Text>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <AntDesign name="close" size={18} color="#546e7a" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Version */}
                <Text style={styles.version}>Hangman v{APP_VERSION}</Text>

                {/* Legal links */}
                <Text style={styles.sectionTitle}>Legal</Text>
                <Pressable
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                  onPress={() => openLink(PRIVACY_POLICY_URL)}
                >
                  <AntDesign name="lock" size={18} color="#FF6F61" />
                  <Text style={styles.rowText}>Privacy Policy</Text>
                  <AntDesign name="right" size={13} color="#b0bec5" style={styles.arrow} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                  onPress={() => openLink(TERMS_URL)}
                >
                  <AntDesign name="filetext1" size={18} color="#FF6F61" />
                  <Text style={styles.rowText}>Terms of Service</Text>
                  <AntDesign name="right" size={13} color="#b0bec5" style={styles.arrow} />
                </Pressable>

                {/* Feedback */}
                <Text style={styles.sectionTitle}>Feedback</Text>
                <Pressable
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                  onPress={openEmail}
                >
                  <AntDesign name="mail" size={18} color="#FF6F61" />
                  <Text style={styles.rowText}>Send Feedback</Text>
                  <AntDesign name="right" size={13} color="#b0bec5" style={styles.arrow} />
                </Pressable>

                {/* FAQ */}
                <Text style={styles.sectionTitle}>FAQ</Text>
                {FAQ_ITEMS.map((item, i) => (
                  <View key={i} style={styles.faqItem}>
                    <Pressable
                      style={styles.faqQuestion}
                      onPress={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <Text style={styles.faqQuestionText}>{item.q}</Text>
                      <AntDesign
                        name={openFaq === i ? "up" : "down"}
                        size={13}
                        color="#90a4ae"
                      />
                    </Pressable>
                    {openFaq === i && (
                      <Text style={styles.faqAnswer}>{item.a}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eceff1",
  },
  headerTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    color: "#263238",
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  version: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: "#90a4ae",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 13,
    color: "#90a4ae",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    gap: 12,
  },
  rowText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: "#37474f",
    flex: 1,
  },
  arrow: {
    marginLeft: "auto",
  },
  pressed: {
    backgroundColor: "#fafafa",
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 8,
  },
  faqQuestionText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#37474f",
    flex: 1,
  },
  faqAnswer: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: "#546e7a",
    lineHeight: 20,
    paddingBottom: 14,
    paddingRight: 8,
  },
});
