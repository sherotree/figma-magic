import { STORAGE } from './api';
import { LanguageValue } from './constants';

export async function updateRealtimeTextNodes(key: string, lang: LanguageValue, newTextId: string) {
  const realtimeTextNodes = (await figma.clientStorage.getAsync(STORAGE.realtimeTextNodes)) || {};
  if (realtimeTextNodes[key]) {
    realtimeTextNodes[key][lang] = newTextId;
  } else {
    realtimeTextNodes[key] = { [lang]: newTextId };
  }

  await figma.clientStorage.setAsync(STORAGE.realtimeTextNodes, realtimeTextNodes);
}
