import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface LetterProps {
  char: string;
  index: number;
  fontSize: number;
}

const Letter = ({ char, index, fontSize }: LetterProps) => {
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Drop in animation
    translateY.value = withDelay(index * 100, withTiming(0, { duration: 600, easing: Easing.bounce }));
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 600 }));

    // Swaying animation (starts after drop)
    const swayDelay = 1200 + index * 100;
    // Randomize initial direction slightly
    const startAngle = index % 2 === 0 ? 5 : -5;
    
    rotation.value = withDelay(swayDelay, withRepeat(
      withSequence(
        withTiming(startAngle, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(-startAngle, { duration: 1500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  // Create outline offsets
  const outlineOffsets = [
    { x: -2, y: -2 }, { x: 0, y: -2 }, { x: 2, y: -2 },
    { x: -2, y: 0 },                   { x: 2, y: 0 },
    { x: -2, y: 2 },  { x: 0, y: 2 },  { x: 2, y: 2 }
  ];

  return (
    <Animated.View style={[styles.letterContainer, animatedStyle]}>
        <View style={{ position: 'relative' }}>
            {/* Outline Layers (Background) */}
            {outlineOffsets.map((offset, i) => (
                <Text
                    key={i}
                    style={[
                        styles.baseText,
                        styles.outlineText,
                        {
                            fontSize,
                            transform: [{ translateX: offset.x }, { translateY: offset.y }],
                            zIndex: -1
                        }
                    ]}
                >
                    {char}
                </Text>
            ))}
            
            {/* Main Text (Foreground) */}
            <Text style={[styles.baseText, styles.mainText, { fontSize }]}>{char}</Text>
        </View>
    </Animated.View>
  );
};

export default function AnimatedTitle() {
  const title = "HangMan";
  const { width } = useWindowDimensions();
  
  // Calculate responsive font size
  const fontSize = Math.min(64, Math.max(32, width * 0.13));

  return (
    <View style={styles.container}>
      {title.split('').map((char, index) => (
        <Letter key={index} char={char} index={index} fontSize={fontSize} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    zIndex: 2,
    flexWrap: 'nowrap', // changed to nowrap to prevent stacking on small screens if font scales
  },
  letterContainer: {
    marginHorizontal: 1,
  },
  baseText: {
    fontFamily: "Nunito_800ExtraBold",
  },
  mainText: {
    // Top layer: Dark color
    color: "#263238",
    // defaults to relative, strictly defining size
  },
  outlineText: {
    // Bottom layers: White color, with drop shadow
    position: 'absolute',
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 8,
  }
});
