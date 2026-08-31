import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/pressable-scale';
import { BrandColors, BrandRadius, BrandTypography, Spacing } from '@/constants/theme';
import { getKaiPortrait, type KaiPortraitMood } from '@/data/kai-weather';

type KaiShortcutProps = {
  mood: KaiPortraitMood;
  title: string;
  subtitle: string;
};

export function KaiShortcut({ mood, title, subtitle }: KaiShortcutProps) {
  const router = useRouter();

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={() => router.push('/kai')}
      scaleTo={0.98}
      style={styles.pressable}
      contentStyle={styles.container}>
      <Image
        accessibilityLabel={`Kai looks ${mood}`}
        contentFit="cover"
        contentPosition="top"
        source={getKaiPortrait(mood)}
        style={styles.portrait}
      />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.arrow}>
        <SymbolView name={{ android: 'arrow_forward', web: 'arrow_forward' } as never} size={17} tintColor={BrandColors.text} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pressable: { marginTop: Spacing.three },
  container: {
    minHeight: 88,
    borderRadius: BrandRadius.card,
    backgroundColor: BrandColors.dockPurpleDeep,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.two,
    paddingRight: Spacing.three,
    overflow: 'hidden',
  },
  portrait: { width: 82, height: 88 },
  copy: { flex: 1, paddingLeft: Spacing.two },
  title: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 14 },
  subtitle: { color: '#D1C7E7', fontFamily: BrandTypography.regular, fontSize: 11, lineHeight: 16, marginTop: 2 },
  arrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF14', alignItems: 'center', justifyContent: 'center' },
});
