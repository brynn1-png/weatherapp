import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors, BrandRadius, BrandTypography, Spacing } from '@/constants/theme';
import { AppScreen } from '@/components/app-screen';
import { defaultAppPreferences, readAppPreferences, saveAppPreferences, type AppPreferences } from '@/services/preferences/app-preferences';

function Icon({ name, size = 22, color = BrandColors.iconMuted }: { name: string; size?: number; color?: string }) {
  return <SymbolView name={{ android: name, web: name } as never} size={size} tintColor={color} weight="regular" />;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState(defaultAppPreferences);
  const [isReady, setIsReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    readAppPreferences().then((value) => { if (active) { setSettings(value); setNameDraft(value.userName); } }).finally(() => { if (active) setIsReady(true); });
    return () => { active = false; if (savedTimer.current) clearTimeout(savedTimer.current); };
  }, []);

  async function update(next: AppPreferences) {
    setSettings(next);
    setSaved(false);
    try {
      await saveAppPreferences(next);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 1600);
    } catch {
      setSettings(settings);
    }
  }

  function saveName() {
    const userName = nameDraft.trim().slice(0, 40);
    setNameDraft(userName);
    void update({ ...settings, userName });
  }

  if (!isReady) return <View style={styles.loading}><ActivityIndicator color={BrandColors.pinkSoft} size="large" /></View>;

  return (
    <AppScreen><SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}><View><Text style={styles.title}>Settings</Text><Text style={styles.subtitle}>Make WeatherAI work your way.</Text></View>{saved && <View style={styles.saved}><Icon name="check" size={16} color={BrandColors.text} /><Text style={styles.savedText}>Saved</Text></View>}</View>

        <Text style={styles.sectionTitle}>Weather units</Text>
        <View style={styles.unitControl}>
          {(['celsius', 'fahrenheit'] as const).map((unit) => {
            const selected = settings.temperatureUnit === unit;
            return <Pressable key={unit} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => void update({ ...settings, temperatureUnit: unit })} style={({ pressed }) => [styles.unitOption, selected && styles.unitSelected, pressed && styles.pressed]}><Text style={[styles.unitSymbol, selected && styles.unitTextSelected]}>°{unit === 'celsius' ? 'C' : 'F'}</Text><Text style={[styles.unitLabel, selected && styles.unitTextSelected]}>{unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}</Text></Pressable>;
          })}
        </View>

        <Text style={styles.sectionTitle}>Kai personalization</Text>
        <View style={styles.nameCard}>
          <View style={styles.nameCopy}><Text style={styles.nameTitle}>What should Kai call you?</Text><Text style={styles.nameHint}>Stored only on this device. Leave blank to let Kai ask next time.</Text></View>
          <View style={styles.nameForm}><TextInput value={nameDraft} onChangeText={setNameDraft} onSubmitEditing={saveName} maxLength={40} returnKeyType="done" autoCapitalize="words" placeholder="Your name" placeholderTextColor={BrandColors.textSubtle} accessibilityLabel="Name Kai should use" style={styles.nameInput} /><Pressable accessibilityRole="button" accessibilityLabel="Save name" onPress={saveName} style={({ pressed }) => [styles.nameSave, pressed && styles.pressed]}><Text style={styles.nameSaveText}>Save</Text></Pressable></View>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.group}><InfoRow icon="cloud" title="Weather data" value="Open-Meteo" /><View style={styles.divider} /><InfoRow icon="notification_important" title="Weather alerts" value="Coming later" /><View style={styles.divider} /><InfoRow icon="info" title="WeatherAI version" value="1.0.0" /></View>

        <View style={styles.privacyNote}><View style={styles.privacyIcon}><Icon name="shield" color={BrandColors.rain} /></View><View style={styles.privacyCopy}><Text style={styles.privacyTitle}>Your location stays private</Text><Text style={styles.privacyBody}>WeatherAI uses foreground location only to retrieve your local forecast. No account is required.</Text></View></View>
      </ScrollView>
    </SafeAreaView></AppScreen>
  );
}

function InfoRow({ icon, title, value }: { icon: string; title: string; value: string }) {
  return <View style={styles.infoRow}><View style={styles.rowIcon}><Icon name={icon} /></View><Text style={styles.infoTitle}>{title}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.canvas }, scroll: { paddingHorizontal: 18, paddingBottom: 116 }, loading: { flex: 1, backgroundColor: BrandColors.canvas, alignItems: 'center', justifyContent: 'center' },
  header: { minHeight: 102, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, title: { color: BrandColors.text, fontFamily: BrandTypography.extrabold, fontSize: 32, lineHeight: 40, letterSpacing: -0.7 }, subtitle: { color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 13, marginTop: 2 },
  saved: { minHeight: 36, borderRadius: 18, backgroundColor: BrandColors.dockPurple, paddingHorizontal: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.one }, savedText: { color: BrandColors.text, fontFamily: BrandTypography.semibold, fontSize: 11 }, sectionTitle: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 18, marginTop: Spacing.five, marginBottom: Spacing.three },
  unitControl: { flexDirection: 'row', gap: Spacing.three }, unitOption: { flex: 1, minHeight: 98, borderRadius: BrandRadius.card, backgroundColor: BrandColors.surfaceRaised, padding: Spacing.four, justifyContent: 'center', borderWidth: 1, borderColor: BrandColors.outline }, unitSelected: { backgroundColor: BrandColors.dockPurpleDeep, borderColor: '#C69AFF88' }, unitSymbol: { color: BrandColors.textMuted, fontFamily: BrandTypography.bold, fontSize: 26, fontVariant: ['tabular-nums'] }, unitLabel: { color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 12, marginTop: Spacing.one }, unitTextSelected: { color: BrandColors.text },
  nameCard: { borderRadius: BrandRadius.card, backgroundColor: BrandColors.surfaceRaised, padding: Spacing.four, gap: Spacing.four, borderWidth: 1, borderColor: BrandColors.outline }, nameCopy: { gap: Spacing.one }, nameTitle: { color: BrandColors.text, fontFamily: BrandTypography.semibold, fontSize: 14 }, nameHint: { color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 11, lineHeight: 17 }, nameForm: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two }, nameInput: { flex: 1, minHeight: 50, borderRadius: 18, backgroundColor: BrandColors.surfaceDeep, borderWidth: 1, borderColor: BrandColors.outline, color: BrandColors.text, fontFamily: BrandTypography.regular, fontSize: 14, paddingHorizontal: Spacing.four }, nameSave: { minWidth: 70, minHeight: 50, borderRadius: 18, backgroundColor: BrandColors.pink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three }, nameSaveText: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 12 },
  group: { borderRadius: BrandRadius.card, backgroundColor: BrandColors.surface, overflow: 'hidden' }, rowIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF0B', alignItems: 'center', justifyContent: 'center' }, divider: { height: 1, backgroundColor: BrandColors.divider, marginLeft: 70 },
  infoRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, gap: Spacing.three }, infoTitle: { flex: 1, color: BrandColors.text, fontFamily: BrandTypography.semibold, fontSize: 13 }, infoValue: { color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 12 },
  privacyNote: { marginTop: Spacing.five, minHeight: 112, borderRadius: BrandRadius.card, backgroundColor: '#101F2B', padding: Spacing.four, flexDirection: 'row', gap: Spacing.three }, privacyIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#77D8FF16', alignItems: 'center', justifyContent: 'center' }, privacyCopy: { flex: 1 }, privacyTitle: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 14 }, privacyBody: { color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 11, lineHeight: 17, marginTop: Spacing.one }, pressed: { opacity: 0.72 },
});
