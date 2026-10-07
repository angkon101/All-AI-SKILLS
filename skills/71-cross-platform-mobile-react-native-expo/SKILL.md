---
name: cross-platform-mobile-react-native-expo
description: Cross-platform mobile development with React Native and Expo SDK, Fabric renderer New Architecture, Expo Router file-based routing, Reanimated 60/120 FPS gesture physics, and native haptics.
---

# 📱 Cross-Platform Mobile Engineering: React Native & Expo

## 🎯 Role & Objective
As a **Principal Cross-Platform Mobile Architect**, your mandate is to build lightning-fast, production-grade native mobile applications for iOS and Android using **React Native** and the **Expo SDK**. You leverage the **New Architecture** (Fabric renderer, TurboModules, JSI zero-bridge communication), enforce type-safe navigation via **Expo Router**, implement fluid 60/120 FPS gesture physics with **React Native Reanimated** and **Gesture Handler**, and optimize native safe-area insets, keyboard avoidance, and haptics.

---

## 🏗️ React Native New Architecture Overview

```mermaid
flowchart TD
    subgraph Legacy["Legacy Architecture (Slow Async JSON Bridge)"]
        JS1["JavaScript Thread"] <-->|JSON Serialization Serialization Overhead| BR["Async Bridge"]
        BR <-->|Shadow Tree & Layout| NAT1["Native Thread (UIKit / Android Views)"]
    end

    subgraph NewArch["New Architecture (Direct Memory C++ JSI)"]
        JS2["JavaScript (Hermes Engine)"] <-->|Direct C++ Pointer Invocations (JSI)| NAT2["TurboModules (Native Code)"]
        JS2 <-->|Direct Thread-Safe Memory Access| FAB["Fabric Renderer (C++ Yoga Layout)"]
        FAB --> NAT3["Direct Native Platform Views"]
    end
```

---

## ⚙️ Standard Implementation Workflow

### Step 1: Type-Safe File-Based Navigation & Layout (Expo Router v3)

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#090d16' },
              headerTintColor: '#38bdf8',
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: '#04060f' },
              animation: 'slide_from_right'
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="reader/[id]" options={{ presentation: 'fullScreenModal', headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: 'Settings', presentation: 'card' }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }
});
```

---

### Step 2: 60/120 FPS Swipeable Gesture Physics (Reanimated 3 + Worklets)

Execute animation math directly on the native UI thread using Reanimated worklets, completely bypassing the JavaScript event loop.

```typescript
// components/SwipeableFeedCard.tsx
import React from 'react';
import { StyleSheet, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;

interface Props {
  title: string;
  onDismiss: () => void;
}

export function SwipeableFeedCard({ title, onDismiss }: Props) {
  const translateX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      isDragging.value = false;
      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        // Fling off screen with spring physics
        translateX.value = withSpring(
          Math.sign(translateX.value) * SCREEN_WIDTH * 1.2,
          { damping: 15, stiffness: 120 },
          () => {
            runOnJS(onDismiss)();
          }
        );
      } else {
        // Snap back to center
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: isDragging.value ? 1.02 : 1 }
      ],
      opacity: 1 - Math.abs(translateX.value) / (SCREEN_WIDTH * 0.8)
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text style={styles.cardText}>{title}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4
  },
  cardText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600'
  }
});
```

---

### Step 3: Screen Lifecycle & Background State Resilience

```typescript
// hooks/useAppStateResilience.ts
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useAppStateResilience(onForeground: () => void, onBackground: () => void) {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App returned to foreground: refresh session tokens, reconnect WebSockets
        onForeground();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App moving to background: persist local draft state, pause video/audio
        onBackground();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [onForeground, onBackground]);
}
```

---

## 📋 Security & Quality Checklist

- [ ] **New Architecture Active**: `newArchEnabled: true` in `app.json` or `gradle.properties`/`Podfile`; JSI direct invocation enabled.
- [ ] **Hermes Engine Enabled**: `hermesEngine: true` configured on both iOS and Android for instant bytecode execution and lower memory footprint.
- [ ] **No Inline Callback Re-renders**: Heavy lists use `FlashList` or `FlatList` with `getItemLayout` and `memo`-wrapped render items.
- [ ] **Native Worklet Animations**: All continuous gesture tracking and layout animations run via Reanimated worklets on the native UI thread.
- [ ] **Safe Area & Dynamic Island Insets**: All top headers and bottom navigation bars respect `useSafeAreaInsets()` to prevent notch/island clipping.
- [ ] **Native Haptics**: Key interactions (swipes, successful submits, toggle changes) trigger subtle haptic feedback using `expo-haptics`.
