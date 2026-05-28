import { Nunito_400Regular, Nunito_800ExtraBold, useFonts } from "@expo-google-fonts/nunito";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { markOnboardingSeen } from "@/utils/storage";

const { width } = Dimensions.get("window");

type Slide = {
  id: string;
  emoji: string;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    id: "1",
    emoji: "👋",
    title: "Welcome to Hangman!",
    description:
      "The classic word-guessing game. Test your vocabulary and see how many words you can crack before the hangman is complete.",
  },
  {
    id: "2",
    emoji: "🔤",
    title: "Guess the Word",
    description:
      "A secret word is chosen for you. Tap letters on the keyboard to guess — correct letters reveal their position in the word.",
  },
  {
    id: "3",
    emoji: "⚠️",
    title: "Watch Your Mistakes",
    description:
      "Every wrong guess adds a piece to the hangman drawing. You have 6 chances before the game is over — guess wisely!",
  },
  {
    id: "4",
    emoji: "🏆",
    title: "Pick Your Level",
    description:
      "Choose Easy, Medium, or Hard to match your skill. Complete all words in a level to earn your victory! Good luck!",
  },
];

type Props = {
  visible: boolean;
  onDone: () => void;
};

export default function OnboardingTutorial({ visible, onDone }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const [fontsLoaded] = useFonts({ Nunito_800ExtraBold, Nunito_400Regular });

  const handleDone = async () => {
    await markOnboardingSeen();
    onDone();
  };

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleDone();
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  if (!fontsLoaded) return null;

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Skip button */}
          <Pressable style={styles.skipBtn} onPress={handleDone}>
            <Text style={styles.skipText}>Skip</Text>
            <AntDesign name="close" size={14} color="#888" />
          </Pressable>

          {/* Slides */}
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            )}
          />

          {/* Dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
          </View>

          {/* Next / Get Started button */}
          <Pressable
            style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}
            onPress={goNext}
          >
            <Text style={styles.nextText}>
              {isLast ? "Get Started!" : "Next →"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: width * 0.85,
    maxWidth: 360,
    paddingBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
    padding: 16,
  },
  skipText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: "#888",
  },
  slide: {
    width: width * 0.85,
    maxWidth: 360,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    color: "#263238",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "#546e7a",
    textAlign: "center",
    lineHeight: 22,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cfd8dc",
  },
  dotActive: {
    backgroundColor: "#FF6F61",
    width: 20,
  },
  nextBtn: {
    marginHorizontal: 28,
    backgroundColor: "#FF6F61",
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  nextText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#fff",
  },
});
