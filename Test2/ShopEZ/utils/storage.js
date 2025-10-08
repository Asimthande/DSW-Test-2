import AsyncStorage from '@react-native-async-storage/async-storage';
export const save = async (key, value) => {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
};
export const load = async (key) => {
  try { const s = await AsyncStorage.getItem(key); return s ? JSON.parse(s) : null; } catch(e) { return null; }
};
