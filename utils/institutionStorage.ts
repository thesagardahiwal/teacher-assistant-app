import AsyncStorage from "@react-native-async-storage/async-storage";

const INSTITUTION_KEY = "TEACHORA_INSTITUTION_ID";

export const institutionStorage = {
  async setInstitutionId(id: string) {
    await AsyncStorage.setItem(INSTITUTION_KEY, id);
  },

  async getInstitutionId() {
    return await AsyncStorage.getItem(INSTITUTION_KEY);
  },

  async clear() {
    await AsyncStorage.removeItem(INSTITUTION_KEY);
  },
};
