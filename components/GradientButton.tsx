import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  colors?: [string, string, ...string[]];
  containerStyle?: ViewStyle;
  animationType?: 'shimmer' | 'pulse' | 'shake' | 'bounce' | 'none';
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function GradientButton({ 
  onPress, 
  title, 
  colors = ["#FF6F61", "#FF9966"], // Default warm gradient
  containerStyle,
  animationType = 'shimmer'
}: GradientButtonProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const shimmerOpacity = useSharedValue(0);

  useEffect(() => {
    if (animationType === 'pulse') {
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
    } else if (animationType === 'shimmer') {
        // Continuous subtle opacity wave
        shimmerOpacity.value = withRepeat(
            withSequence(
                withTiming(0.2, { duration: 1500 }),
                withTiming(0, { duration: 1500 }),
                withDelay(2000, withTiming(0, { duration: 0 }))
            ),
            -1,
            true
        );
    } else if (animationType === 'shake') {
        // ... (keep shake if user ever wants it back, but it's not default)
        rotation.value = 0; // reset
    } else if (animationType === 'bounce') {
         scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 700 }),
                withTiming(1, { duration: 700 })
            ),
            -1, 
            true
         );
    }
  }, [animationType]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
          { scale: scale.value },
          { rotate: `${rotation.value}deg` }
      ]
    };
  });

  return (
    <AnimatedTouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      style={[styles.container, containerStyle, animatedStyle]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>{title}</Text>
        {animationType === 'shimmer' && (
             <Animated.View 
                style={[
                    StyleSheet.absoluteFillObject, 
                    { 
                        backgroundColor: 'white', 
                        opacity: shimmerOpacity,
                        borderRadius: 50 // Match button radius
                    } 
                ]} 
             />
        )}
      </LinearGradient>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    marginTop: 10,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradient: {
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  text: {
    fontFamily: "Nunito",
    fontWeight: "600",
    fontSize: 20,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  }
});
