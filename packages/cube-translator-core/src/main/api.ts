export enum TransMode {
  Selection = 'Selection',
  CurrentPage = 'Current page',
  EntireFile = 'Entire file',
}

export enum TransShowIn {
  DirectCoverage = 'Direct coverage',
  Beside = 'Beside',
  Section = 'Section',
  NewPage = 'New page',
}

export enum TransPosition {
  Right = 'Right',
  Left = 'Left',
  Above = 'Above',
  Bottom = 'Bottom',
}

export enum TransTab {
  Translate = 'Translate',
  HumanTranslation = 'Human Translate',
  CubeLab = 'Cube Lab',
  Setting = 'Setting',
}

export enum TransScope {
  SelectedObject = 'Selected object',
  CurrentPage = 'Current page',
  EntireFile = 'Entire file',
}

export interface ISetting {
  id: string;
  value: string; // TODO:
  label: string;
  rules: { targetFont: IFontName; sourceFont: IFontName; id: string }[];
}

export interface IFontOption extends ILanguage {
  children: ILanguage[];
}

export interface IFontName {
  family: string;
  style: string;
}

export interface ILanguage {
  value: string;
  label: string;
}

export enum NODE_TYPES {
  BOOLEAN_OPERATION = 'BOOLEAN_OPERATION',
  CODE_BLOCK = 'CODE_BLOCK',
  COMPONENT = 'COMPONENT',
  COMPONENT_SET = 'COMPONENT_SET',
  CONNECTOR = 'CONNECTOR',
  DOCUMENT = 'DOCUMENT',
  ELLIPSE = 'ELLIPSE',
  EMBED = 'EMBED',
  FRAME = 'FRAME',
  GROUP = 'GROUP',
  HIGHLIGHT = 'HIGHLIGHT',
  INSTANCE = 'INSTANCE',
  LINE = 'LINE',
  LINK_UNFURL = 'LINK_UNFURL',
  MEDIA = 'MEDIA',
  PAGE = 'PAGE',
  POLYGON = 'POLYGON',
  RECTANGLE = 'RECTANGLE',
  SECTION = 'SECTION',
  SHAPE_WITH_TEXT = 'SHAPE_WITH_TEXT',
  SLICE = 'SLICE',
  STAMP = 'STAMP',
  STAR = 'STAR',
  STICKY = 'STICKY',
  TEXT = 'TEXT',
  VECTOR = 'VECTOR',
  WASHI_TAPE = 'WASHI_TAPE',
  WIDGET = 'WIDGET',
}

export enum FIGMA_EVENT {
  START_EXPORT = 'START_EXPORT',
  NODE_CHANGED = 'NODE_CHANGED',
  GET_FONTS = 'GET_FONTS',
  START_TRANSLATE = 'START_TRANSLATE',
  SELECTION_CHANGE = 'SELECTION_CHANGE',
  KEEP_REALTIME_TRANSLATE = 'KEEP_REALTIME_TRANSLATE',
  START_REALTIME_TRANSLATE = 'START_REALTIME_TRANSLATE',
  GET_FRAME_IDS = 'GET_FRAME_IDS',
  GET_MSG = 'GET_MSG',
  DOCUMENT_CHANGE = 'DOCUMENT_CHANGE',
  GET_CURRENT_SELECTION_IDS = 'GET_CURRENT_SELECTION_IDS',
}

export enum USER_EVENT {
  START_EXPORT = 'START_EXPORT',
  GET_FONTS = 'GET_FONTS',
  START_HUMAN_TRANSLATE = 'START_HUMAN_TRANSLATE',
  START_REALTIME_TRANSLATE = 'START_REALTIME_TRANSLATE',
  START_TRANSLATE = 'START_TRANSLATE',
  END_TRANSLATE = 'END_TRANSLATE',
  KEEP_REALTIME_TRANSLATE = 'KEEP_REALTIME_TRANSLATE',
  STOP_REALTIME_TRANSLATE = 'STOP_REALTIME_TRANSLATE',
  GET_FRAME_IDS = 'GET_FRAME_IDS',
  GET_CURRENT_SELECTION = 'GET_CURRENT_SELECTION',
  SET_MSG = 'SET_MSG',
  GET_MSG = 'GET_MSG',
  CHANGE_CURRENT_SELECTION = 'CHANGE_CURRENT_SELECTION',
  START_RANDOM_TRANSLATE = 'START_RANDOM_TRANSLATE',
}

export enum STORAGE {
  realtimeTextNodes = 'realtimeTextNodes',
  humanLanguageSource = 'humanLanguageSource',
  tab = 'tab',
}

export interface IMsg {
  scope?: TransScope;
  sourceFontOptions?: IFontOption[];
  settings?: any;
  realtimeNodeId?: any;
  type?: USER_EVENT;
  showIn?: TransShowIn;
  tab?: TransTab;
  selectedFrameIds?: string[];
  humanLanguageSource?: any;
  defaultSetting?: any;
  selection?: any[];
  userLanguage?: 'en' | 'ja' | 'zh';
  position?: TransPosition;
  randomLang?: any;
}
