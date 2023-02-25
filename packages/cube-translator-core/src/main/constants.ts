import { TransShowIn, TransScope, ISetting } from './api';

export const uuid = () => Math.random().toString(16).slice(2);

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh-CHS', label: 'Chinese (Simplified)' },
  { value: 'zh-CHT', label: 'Chinese (Traditional)' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
  { value: 'id', label: 'Indonesian' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'es', label: 'Spanish' },
  { value: 'th', label: 'Thai' },
  { value: 'vi', label: 'Vietnamese' },
] as const;

export type LanguageValue = typeof LANGUAGES[number]['value'];

export const DEFAULT_SETTING: ISetting = {
  id: uuid(),
  value: 'en',
  label: 'English',
  rules: [
    {
      sourceFont: { family: 'All fonts', style: 'Auto' },
      targetFont: { family: 'Auto', style: 'Auto' },
      id: uuid(),
    },
  ],
};

export const TRANSLATE_SOURCES = [{ value: 'youdao', label: 'YoudaoTranslation' }];

export const SECTION_PADDING = 100;

export const SHOW_INS_OF_SCOPE_MAP = {
  [TransScope.SelectedObject]: [
    TransShowIn.DirectCoverage,
    TransShowIn.Beside,
    TransShowIn.Section,
    TransShowIn.NewPage,
  ],
  [TransScope.CurrentPage]: [TransShowIn.DirectCoverage, TransShowIn.Section, TransShowIn.NewPage],
  [TransScope.EntireFile]: [TransShowIn.DirectCoverage, TransShowIn.Section, TransShowIn.NewPage],
};

export const TEXT_INVALID = 'No valid text in selection';

export const FRAME_INVALID = 'No valid frame in selection';

export function clone(val) {
  return JSON.parse(JSON.stringify(val));
}

export const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};
