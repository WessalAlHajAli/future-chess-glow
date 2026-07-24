import { useEffect, useState } from "react";

import {
  DEFAULT_PREFS,
  loadPrefs,
  savePrefs,
  type Preferences,
} from "../lib/chess-preferences";

export function useChessPreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) savePrefs(prefs);
  }, [prefs, hydrated]);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  return { prefs, setPrefs, update, hydrated };
}