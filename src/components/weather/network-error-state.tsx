import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/motion/pressable-scale';
import { BrandColors, BrandRadius, BrandTypography, Spacing } from '@/constants/theme';
import { getKaiPortrait } from '@/data/kai-weather';

type NetworkErrorStateProps = {
  isRetrying: boolean;
  onRetry: () => void;
};

export function NetworkErrorState({ isRetrying, onRetry }: NetworkErrorStateProps) {
  const router = useRouter();

  return (
    <SafeAreaView accessibilityRole="alert" style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.artwork}>
          <View style={styles.glow} />
          <Image
            accessibilityLabel="Kai is waiting for the connection to return"
            contentFit="cover"
            contentPosition="top"
            source={getKaiPortrait('neutral')}
            style={styles.kai}
          />
          <View style={styles.offlineBadge}>
            <SymbolView name={{ android: 'cloud_off', web: 'cloud_off' } as never} size={24} tintColor={BrandColors.text} />
          </View>
        </View>

        <Text style={styles.title}>Unable to connect</Text>
        <Text style={styles.message}>Check your internet connection, then try again to get the latest weather.</Text>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Try loading weather again"
          accessibilityState={{ busy: isRetrying, disabled: isRetrying }}
          disabled={isRetrying}
          onPress={onRetry}
          style={[styles.primaryButton, isRetrying && styles.disabled]}
          contentStyle={styles.primaryContent}>
          {isRetrying ? <ActivityIndicator color={BrandColors.text} /> : <SymbolView name={{ android: 'refresh', web: 'refresh' } as never} size={22} tintColor={BrandColors.text} />}
          <Text style={styles.primaryText}>{isRetrying ? 'Trying again…' : 'Try again'}</Text>
        </PressableScale>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Choose another location"
          onPress={() => router.push('/location')}
          style={styles.secondaryButton}
          contentStyle={styles.secondaryContent}>
          <SymbolView name={{ android: 'location_on', web: 'location_on' } as never} size={21} tintColor={BrandColors.iconMuted} />
          <Text style={styles.secondaryText}>Choose another location</Text>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 24, paddingBottom: 106 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  artwork: { width: 190, height: 190, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.five },
  glow: { position: 'absolute', width: 166, height: 166, borderRadius: 83, backgroundColor: '#6D4EA03D' },
  kai: { width: 170, height: 184 },
  offlineBadge: { position: 'absolute', right: 4, bottom: 12, width: 48, height: 48, borderRadius: 24, backgroundColor: BrandColors.dockPurple, borderWidth: 3, borderColor: BrandColors.canvas, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  title: { color: BrandColors.text, fontFamily: BrandTypography.extrabold, fontSize: 28, lineHeight: 36, textAlign: 'center' },
  message: { maxWidth: 320, color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: Spacing.two, marginBottom: Spacing.five },
  primaryButton: { width: '100%', maxWidth: 340, minHeight: 56, borderRadius: BrandRadius.control, backgroundColor: BrandColors.pink },
  primaryContent: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingHorizontal: Spacing.four },
  primaryText: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 15 },
  secondaryButton: { width: '100%', maxWidth: 340, minHeight: 52, marginTop: Spacing.three, borderRadius: BrandRadius.control, borderWidth: 1, borderColor: BrandColors.outline },
  secondaryContent: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingHorizontal: Spacing.four },
  secondaryText: { color: BrandColors.iconMuted, fontFamily: BrandTypography.semibold, fontSize: 14 },
  disabled: { opacity: 0.56 },
});
