import { trans } from './trans';
import { IMsg, FIGMA_EVENT, TransTab } from './api';
import { LanguageValue } from './constants';

interface IParams {
  text: TextNode;
  lang: LanguageValue;
  customText?: string;
  frameId?: string;
}

export async function rewriteText({ text, lang, customText, frameId }: IParams): Promise<TextNode> {
  const msg: IMsg = await figma.clientStorage.getAsync('msg');
  const tab = msg.tab;
  const characters = customText ?? text.characters;
  const isHumanTranslate = tab === TransTab.HumanTranslation;
  const humanLanguageSource = msg.humanLanguageSource;

  const translatedText = isHumanTranslate
    ? humanLanguageSource?.[frameId]?.[characters]?.[lang]
    : await trans(characters, 'auto', lang);

  let _fontName = text.fontName as any;
  if (_fontName === figma.mixed) {
    _fontName = { family: 'Mixed', style: 'Mixed' };
  }

  const currentSettings = msg.settings?.find((x) => x.value === lang)?.rules;

  let targetFont = isHumanTranslate
    ? { family: 'Auto', style: 'Auto' }
    : currentSettings
        ?.reverse()
        ?.find((x) => x.sourceFont.family === _fontName?.family && x.sourceFont.style === _fontName.style)
        ?.targetFont ||
      currentSettings?.reverse()?.find((x) => x.sourceFont.family === 'All fonts')?.targetFont ||
      text.fontName;

  if (targetFont.family === 'Auto') {
    targetFont = text.fontName;
  }

  await Promise.all(text.getRangeAllFontNames(0, text.characters.length).map(figma.loadFontAsync)).catch((err) => {
    console.log(err, text.characters);
  });

  if (targetFont === figma.mixed) {
    text.characters = String(translatedText);
  } else {
    await figma
      .loadFontAsync(targetFont as any)
      .then(() => {
        if (translatedText) {
          text.characters = String(translatedText);
          text.fontName = targetFont;
        }
      })
      .catch((err) => {
        figma.notify(err?.message, { timeout: 1 });
      });
  }

  figma.ui.postMessage({ type: FIGMA_EVENT.NODE_CHANGED });
  return text;
}
