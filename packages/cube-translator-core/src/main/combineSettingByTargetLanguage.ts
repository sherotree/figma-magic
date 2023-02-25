export const combineSettingByTargetLanguage = (settings) =>
  settings.reduce((acc, x) => {
    const { targetLanguage } = x;
    if (acc[targetLanguage.value]) {
      acc[targetLanguage.value].push(x);
    } else {
      acc[targetLanguage.value] = [x];
    }
    return acc;
  }, {});
