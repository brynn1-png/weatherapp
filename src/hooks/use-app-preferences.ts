import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { defaultAppPreferences, readAppPreferences } from '@/services/preferences/app-preferences';

export function useAppPreferences() {
  const [preferences, setPreferences] = useState(defaultAppPreferences);

  useFocusEffect(useCallback(() => {
    let active = true;
    void readAppPreferences().then((stored) => {
      if (active) setPreferences(stored);
    });
    return () => { active = false; };
  }, []));

  return preferences;
}
