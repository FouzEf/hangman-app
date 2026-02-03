import { soundManager } from "@/audio/SoundManager";
import useClickSound from "@/audio/useClickSound";
import WinLottie from "@/components/lottieFiles/WinLottie";
import { getSolvedWords } from "@/utils/storage";
import { Nunito_800ExtraBold, useFonts } from "@expo-google-fonts/nunito";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { fetchWordsOnce } from "../../WordService";
import HeadphoneButton from "../../audio/HeadphoneButton";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

type Level = "Easy" | "medium" | "hard" | "Test"; // Updated to include "Test" based on previous context

export default function Index() {
  const params = useLocalSearchParams();
  const level = params.selectedLevel as Level;
  const navigate = useRouter();
  const playSound = useClickSound();

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const balloonY = useSharedValue(0);
  const balloonRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0.6);

  useFocusEffect(
    useCallback(() => {
      // ✅ Sound & Haptics: Celebrate the win!
      soundManager.playLooping("winPage");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Start a subtle pulsing animation for the cup
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );

      // Add a gentle floating effect to the buttons
      translateY.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        true
      );

      // Helium Balloon Effect for Victory Text
      balloonY.value = withRepeat(
        withSequence(
          withTiming(-25, { duration: 2500 }),
          withTiming(0, { duration: 2500 })
        ),
        -1,
        true
      );
      balloonRotate.value = withRepeat(
        withSequence(
          withTiming(3, { duration: 3000 }),
          withTiming(-3, { duration: 3000 })
        ),
        -1,
        true
      );

      // "Soul" Glow Animation
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 }),
          withTiming(0.6, { duration: 1200 })
        ),
        -1,
        true
      );

      return () => {
        soundManager.stopAll();
      };
    }, [])
  );

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const balloonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: balloonY.value },
      { rotate: `${balloonRotate.value}deg` },
      { scale: 1 + (glowOpacity.value - 0.6) * 0.1 } // Subtle "breathing" soul
    ],
    textShadowRadius: 10 + glowOpacity.value * 20,
    textShadowColor: `rgba(255, 235, 59, ${glowOpacity.value})`,
  }));

  const [fontsLoaded] = useFonts({
    Nunito_800ExtraBold,
  });
  if (!fontsLoaded) return null;

  const handleRestart = async (level: Level) => {
    playSound();
    await soundManager.stopAll();
    const SOLVED_WORDS_KEY = "solved_words";
    const fetched = await fetchWordsOnce(level);
    const solved = await getSolvedWords();
    const remainingSolved = solved.filter((word) => !fetched.includes(word));
    try {
      await AsyncStorage.setItem(
        SOLVED_WORDS_KEY,
        JSON.stringify(remainingSolved)
      );
    } catch (error) {
      console.error("Error updating solved words on restart:", error);
    }
    Toast.show({
      type: "success",
      text1: `The Level ${level} has been reset`,
      visibilityTime: 2000,
    });
    setTimeout(() => {
      navigate.push("/");
    }, 2000);
  };

  return (
    <LinearGradient
      colors={["#4facfe", "#00f2fe", "#7ed6df"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={Style.container}
    >
      <View style={{ position: "absolute", top: 40, right: 30, zIndex: 50 }}>
        <HeadphoneButton />
      </View>

      <Animated.View entering={ZoomIn.duration(1000)} style={Style.lottieOverlay}>
        <WinLottie />
      </Animated.View>

      {/* <Animated.View style={[Style.cupWrapper, bounceStyle]} entering={ZoomIn.delay(300).duration(800)}>
        <WinCup />
      </Animated.View> */}

      <Animated.View style={balloonStyle} entering={FadeInDown.delay(600).springify()}>
        <Text style={Style.congrats}>VICTORY!</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(800).springify()}>
        <Text style={Style.secondaryText}>
          You've mastered the <Text style={Style.levelText}>{level}</Text>{" "}
          level!
        </Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInUp.delay(1000).springify()} 
        style={[Style.buttonContainer, floatStyle]}
      >
        <Pressable
          style={({ pressed }) => [
            Style.button,
            Style.buttonRestart,
            pressed && Style.buttonPressed
          ]}
          onPress={() => handleRestart(level)}
        >
          <LinearGradient
            colors={["#4FC3F7", "#29B6F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={Style.buttonGradient}
          >
            <Ionicons name="refresh-outline" size={24} color="#FFF" style={Style.buttonIcon} />
            <Text style={Style.buttonText}>Restart Level</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            Style.button,
            Style.buttonHome,
            pressed && Style.buttonPressed
          ]}
          onPress={async () => {
            playSound();
            await soundManager.stopAll();
            navigate.push("/");
          }}
        >
          <LinearGradient
            colors={["#81C784", "#66BB6A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={Style.buttonGradient}
          >
            <Ionicons
              name="home-outline"
              size={24}
              color="#FFFFFF"
              style={Style.buttonIcon}
            />
            <Text style={Style.buttonText}>Back to Home</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Toast />
    </LinearGradient>
  );
}

const Style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  cupWrapper: {
    marginTop: -80, // Lifted up further
    marginBottom: 10,
    alignItems: "center",
  },
  congrats: {
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFEB3B", // Vibrant Golden Yellow
    fontSize: 52, // Even bigger for more impact
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 5,
    // Note: Some shadow properties are animated in balloonStyle
    textShadowOffset: { width: 0, height: 4 },
  },
  secondaryText: {
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 60,
    opacity: 0.9,
  },
  levelText: {
    fontSize: 22,
    textTransform: "uppercase",
    fontWeight: "900",
    color: "#FFEB3B",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    alignItems: "center",
  },
  button: {
    width: "85%",
    maxWidth: 320,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  buttonRestart: {
    backgroundColor: "#29B6F6",
    borderBottomWidth: 5,
    borderBottomColor: "#0288D1",
  },
  buttonHome: {
    backgroundColor: "#66BB6A",
    borderBottomWidth: 5,
    borderBottomColor: "#388E3C",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 0.8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonIcon: {
    marginRight: 12,
  },
});
