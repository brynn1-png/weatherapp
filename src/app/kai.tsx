import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandColors, BrandGradients, BrandTypography, Spacing } from '@/constants/theme';
import { MotionAppear } from '@/components/motion/motion-appear';
import { AppScreen } from '@/components/app-screen';
import { useWeather } from '@/hooks/use-weather';
import { defaultAppPreferences, readAppPreferences, saveAppPreferences } from '@/services/preferences/app-preferences';
import { askKai, type KaiMessage } from '@/services/kai/kai-service';

const kaiChatHead = require('@/assets/characters/kai-chat-head-v1.png');

function TypingIndicator() {
  const reduceMotion = useReducedMotion();
  const [dots] = useState(() => [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);

  useEffect(() => {
    if (reduceMotion) return;
    const animation = Animated.loop(Animated.stagger(140, dots.map((dot) => Animated.sequence([
      Animated.timing(dot, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(dot, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]))));
    animation.start();
    return () => animation.stop();
  }, [dots, reduceMotion]);

  return <View accessibilityLabel="Kai is typing" accessibilityLiveRegion="polite" style={styles.typingDots}>
    {dots.map((dot, index) => <Animated.View key={index} style={[styles.typingDot, {
      opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.38, 1] }),
      transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [1, -2] }) }],
    }]} />)}
  </View>;
}

export default function KaiScreen() {
  const { data, error: weatherError, isLoading, isStale } = useWeather();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<KaiMessage[]>([]);
  const [preferences, setPreferences] = useState(defaultAppPreferences);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAwaitingName, setIsAwaitingName] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const current = data?.current;
  const rain = current?.precipitationProbability ?? 0;
  const weatherStatus = isLoading
    ? 'Connecting to weather'
    : data
      ? `${isStale ? 'Saved forecast' : 'Live forecast'} · ${data.location.name}`
      : weatherError ? 'Weather unavailable' : 'Connecting to weather';

  useEffect(() => {
    let active = true;
    void readAppPreferences().then((stored) => {
      if (!active) return;
      setPreferences(stored);
      setUserName(stored.userName);
      if (!stored.userName) {
        setIsAwaitingName(true);
        setMessages([{ role: 'assistant', content: 'Before we start, what should I call you?' }]);
      } else {
        setMessages([{ role: 'assistant', content: `Hi ${stored.userName}, how can I help with your weather today?` }]);
      }
      setPreferencesReady(true);
    });
    return () => { active = false; };
  }, []);

  async function ask(value: string, appendQuestion = true) {
    const text = value.trim(); if (!text) return;
    if (isAwaitingName) {
      const nextName = text.slice(0, 40);
      setQuestion('');
      setMessages((items) => [...items, { role: 'user', content: nextName }, { role: 'assistant', content: `Nice to meet you, ${nextName}. What would you like to know?` }]);
      setUserName(nextName);
      setIsAwaitingName(false);
      const nextPreferences = { ...preferences, userName: nextName };
      setPreferences(nextPreferences);
      try { await saveAppPreferences(nextPreferences); } catch { setError('Your name could not be saved on this device.'); }
      return;
    }
    if (appendQuestion) setMessages((items) => [...items, { role: 'user', content: text }]);
    setQuestion(''); setIsSending(true); setError(null); setLastFailedQuestion(null);
    try {
      if (!data) throw new Error('Weather data is still loading.');
      const answer = await askKai(text, data.location, messages, userName);
      setMessages((items) => [...items, { role: 'assistant', content: answer }]);
    } catch {
      const forecastKind = isStale ? 'saved forecast' : 'current forecast';
      const fallback = data
        ? rain >= 50
          ? `The ${forecastKind} shows a ${rain}% rain chance in ${data.location.name}. I’d keep an umbrella nearby.`
          : `Kai Cloud is unavailable. The ${forecastKind} shows a ${rain}% rain chance. Check the hourly forecast before heading out.`
        : 'Kai Cloud and weather data are unavailable right now. Please reconnect and try again before making weather-sensitive plans.';
      setMessages((items) => [...items, { role: 'assistant', content: fallback }]);
      setError('Kai could not connect. You can retry, or keep using the offline weather answer.');
      setLastFailedQuestion(text);
    } finally { setIsSending(false); }
  }
  return <AppScreen><KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <LinearGradient colors={[...BrandGradients.page]} style={StyleSheet.absoluteFill} />
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}><View style={styles.headerCopy}><Text style={styles.title}>Ask Kai</Text><View accessibilityLiveRegion="polite" style={styles.statusRow}><View style={[styles.statusDot, isStale && styles.statusDotSaved, !data && styles.statusDotOffline]} /><Text style={styles.status}>{weatherStatus}</Text></View></View></View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.conversation} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
        {messages.map((message, index) => <MotionAppear key={`${message.content}-${index}`} style={[styles.messageRow, message.role === 'user' && styles.userMessageRow]}>{message.role === 'assistant' && <Image source={kaiChatHead} style={styles.avatar} contentFit="cover" contentPosition="top" accessibilityLabel={index === 0 ? 'Kai, your weather assistant' : undefined} />}<View accessibilityLiveRegion={message.role === 'assistant' ? 'polite' : 'none'} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.kaiBubble]}><Text style={styles.bubbleText}>{message.content}</Text></View></MotionAppear>)}
        {isSending && <View style={styles.messageRow}><Image source={kaiChatHead} style={styles.avatar} contentFit="cover" contentPosition="top" /><View style={[styles.bubble, styles.kaiBubble, styles.loadingBubble]}><TypingIndicator /></View></View>}
        {error && <View accessibilityRole="alert" style={styles.errorCard}><Text style={styles.error}>{error}</Text>{lastFailedQuestion && <Pressable accessibilityRole="button" disabled={isSending} onPress={() => void ask(lastFailedQuestion, false)} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}><Text style={styles.retryText}>Try again</Text></Pressable>}</View>}
      </ScrollView>
      <View style={styles.composer}><TextInput value={question} onChangeText={setQuestion} onSubmitEditing={() => void ask(question)} editable={!isSending && preferencesReady} multiline maxLength={isAwaitingName ? 40 : 1000} autoCapitalize={isAwaitingName ? 'words' : 'sentences'} placeholder={isAwaitingName ? 'Type your name…' : 'Message Kai…'} placeholderTextColor={BrandColors.textSubtle} returnKeyType="send" submitBehavior="submit" accessibilityLabel={isAwaitingName ? 'Your name' : 'Message Kai'} style={styles.input} /><Pressable accessibilityRole="button" accessibilityLabel={isAwaitingName ? 'Save name' : 'Send message'} disabled={!question.trim() || isSending || !preferencesReady} onPress={() => void ask(question)} style={({ pressed }) => [styles.send, (!question.trim() || isSending || !preferencesReady) && styles.disabled, pressed && styles.pressed]}><SymbolView name={{ android: 'arrow_upward', web: 'arrow_upward' } as never} size={23} tintColor={BrandColors.text} /></Pressable></View>
    </SafeAreaView>
  </KeyboardAvoidingView></AppScreen>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BrandColors.canvas }, safeArea: { flex: 1 }, header: { minHeight: 72, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: BrandColors.divider }, headerCopy: { flex: 1 }, title: { color: BrandColors.text, fontFamily: BrandTypography.extrabold, fontSize: 22 }, statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: BrandColors.rain }, statusDotSaved: { backgroundColor: BrandColors.sun }, statusDotOffline: { backgroundColor: BrandColors.textSubtle }, status: { color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 11 }, conversation: { flexGrow: 1, paddingHorizontal: 18, paddingTop: Spacing.five, paddingBottom: Spacing.four }, messageRow: { maxWidth: '92%', flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two, marginBottom: Spacing.three }, userMessageRow: { alignSelf: 'flex-end', justifyContent: 'flex-end' }, avatar: { width: 38, height: 44 }, bubble: { flexShrink: 1, borderRadius: 20, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three }, userBubble: { backgroundColor: BrandColors.dockPurple, borderBottomRightRadius: 7 }, kaiBubble: { backgroundColor: BrandColors.surfaceRaised, borderBottomLeftRadius: 7 }, bubbleText: { color: BrandColors.text, fontFamily: BrandTypography.regular, fontSize: 14, lineHeight: 21 }, composer: { paddingHorizontal: 18, paddingTop: Spacing.three, paddingBottom: 104, flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two, backgroundColor: BrandColors.canvas, borderTopWidth: 1, borderTopColor: BrandColors.divider }, input: { flex: 1, minHeight: 54, maxHeight: 116, borderRadius: 27, backgroundColor: BrandColors.surface, color: BrandColors.text, fontFamily: BrandTypography.regular, fontSize: 15, lineHeight: 21, paddingHorizontal: Spacing.four, paddingTop: 16, paddingBottom: 15, borderWidth: 1, borderColor: BrandColors.outline }, send: { width: 54, height: 54, borderRadius: 27, backgroundColor: BrandColors.pink, alignItems: 'center', justifyContent: 'center' }, disabled: { opacity: 0.4 }, pressed: { opacity: 0.72 },
  loadingBubble: { minWidth: 66, minHeight: 46, alignItems: 'center', justifyContent: 'center' }, typingDots: { height: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: BrandColors.textMuted }, errorCard: { marginBottom: Spacing.three, padding: Spacing.three, borderRadius: 16, backgroundColor: '#34231F', flexDirection: 'row', alignItems: 'center', gap: Spacing.two }, error: { flex: 1, color: '#FFD5C2', fontFamily: BrandTypography.regular, fontSize: 12, lineHeight: 18 }, retryButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: Spacing.three }, retryText: { color: '#FFB77C', fontFamily: BrandTypography.bold, fontSize: 12 },
});
