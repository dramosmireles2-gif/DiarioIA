import { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

export default function Skeleton({
  width,
  height,
  borderRadius = 8,
  color = '#88888840',
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  color?: string;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: color }, { opacity }, style]}
    />
  );
}
