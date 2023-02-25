import { transCurrentPage } from './transCurrentPage';
import { transSelection } from './transSelection';
import { cloneNodesOnSide } from './cloneNodesOnSide';
import { setMsg } from './setMsg';
import { realTimeTranslate } from './realTimeTranslate';
import { getFonts, renameTextNode } from './getFonts';
import { getTexts } from './getTexts';
import { transEntireFile } from './transEntireFile';
import { TransScope, USER_EVENT, FIGMA_EVENT, STORAGE, NODE_TYPES, IMsg, TransShowIn } from './api';
import { LanguageValue, TEXT_INVALID, FRAME_INVALID, DEFAULT_SETTING } from './constants';
import { rewriteNodes } from './rewriteNodes';

export async function onMessage(msg: IMsg) {
  // 每次触发事件都更新 selection
  await setMsg({
    selection: figma.currentPage.selection.map((x) => ({ id: x.id, type: x.type, parentType: x.parent.type })),
  });

  const msgFromStorage: IMsg = await figma.clientStorage.getAsync('msg');

  const defaultSetting = msgFromStorage?.defaultSetting;
  // 初始化时进行默认配置
  if (!defaultSetting) {
    await setMsg({ defaultSetting: [DEFAULT_SETTING] });
  }

  const fns = {
    [USER_EVENT.START_TRANSLATE]: startTranslate,
    [USER_EVENT.END_TRANSLATE]: endTranslate,
    [USER_EVENT.START_HUMAN_TRANSLATE]: startHumanTranslate,
    [USER_EVENT.START_REALTIME_TRANSLATE]: startRealtimeTranslate,
    [USER_EVENT.KEEP_REALTIME_TRANSLATE]: keepRealtimeTranslate,
    [USER_EVENT.STOP_REALTIME_TRANSLATE]: stopRealtimeTranslate,
    [USER_EVENT.GET_FONTS]: _getFonts,
    [USER_EVENT.SET_MSG]: async () => await setMsg(msg),
    [USER_EVENT.CHANGE_CURRENT_SELECTION]: changeCurrentSelection,
    [USER_EVENT.GET_MSG]: getMsg,
    [USER_EVENT.START_EXPORT]: startExport,
    [USER_EVENT.GET_FRAME_IDS]: getFrameIds,
    [USER_EVENT.GET_CURRENT_SELECTION]: getCurrentSelection,
    [USER_EVENT.START_RANDOM_TRANSLATE]: () => startRandomTranslate(msg),
  };

  fns[msg.type]?.({ msg, msgFromStorage });
}

interface IParams {
  msg?: IMsg;
  msgFromStorage?: IMsg;
}

function startRandomTranslate(msg) {
  const { randomLang } = msg;
  const isInvalid = figma.currentPage.selection.length === 0;

  if (isInvalid) {
    figma.notify(TEXT_INVALID);
    return;
  }

  rewriteNodes({ nodes: figma.currentPage.selection, lang: randomLang });
}

async function startTranslate(params: IParams) {
  const { msg } = params;

  await setMsg(msg);
  const notSelectContentOnSelection =
    msg.scope === TransScope.SelectedObject && figma.currentPage.selection.length === 0; // Selection 下未选择内容

  if (notSelectContentOnSelection) {
    figma.notify(TEXT_INVALID);
    return;
  }

  figma.ui.postMessage({ type: FIGMA_EVENT.START_TRANSLATE });

  const _children = figma.root.children.slice();
  const _selection = figma.currentPage.selection.slice();

  const fns = {
    [TransScope.SelectedObject]: (lang: LanguageValue) => {
      transSelection(lang, _selection);

      // Beside 和 Section 两种模式清空当前 selection
      if (msg.showIn === TransShowIn.Beside || msg.showIn === TransShowIn.Section) {
        figma.currentPage.selection = [];
      }
    },
    [TransScope.CurrentPage]: (lang: LanguageValue) => {
      // Section 模式清空当前 selection
      if (msg.showIn === TransShowIn.Section) {
        figma.currentPage.selection = [];
      }

      transCurrentPage(lang);
    },
    [TransScope.EntireFile]: (lang: LanguageValue) => transEntireFile(lang, _children),
  };

  msg.settings
    ?.map((x) => x.value)
    .forEach((lang: any) => {
      fns[msg.scope]?.(lang);
    });
}

async function startHumanTranslate(params: IParams) {
  const { msgFromStorage } = params;
  const humanLanguageSource = msgFromStorage?.humanLanguageSource;
  const frameIds = Object.keys(humanLanguageSource);
  const selectedFrames = figma.currentPage.children.filter((x) => frameIds?.includes(x.id));
  const isInvalid = selectedFrames.length === 0;

  if (isInvalid) {
    figma.notify(FRAME_INVALID);
    return;
  }

  const frameId = selectedFrames[0].id;
  const languages = Object.keys(Object.values?.(humanLanguageSource?.[frameId])?.[0]) as LanguageValue[];

  figma.currentPage.selection = [];
  languages?.forEach((lang) => {
    const nodes = selectedFrames;
    cloneNodesOnSide(nodes, lang);
  });
}

async function startRealtimeTranslate(params: IParams) {
  const { msg } = params;
  await setMsg(msg);
  renameTextNode(figma.currentPage.selection);

  const isInvalid = figma.currentPage.selection.length === 0 || msg.sourceFontOptions.length < 2;
  if (isInvalid) {
    figma.notify(TEXT_INVALID);
    return;
  }

  figma.ui.postMessage({ type: FIGMA_EVENT.START_REALTIME_TRANSLATE });
  const arr = msg.settings.map((x) => x.value) as LanguageValue[];
  for (let lang of arr) {
    await realTimeTranslate(lang);
  }
}

async function keepRealtimeTranslate(params: IParams) {
  const { msg, msgFromStorage } = params;
  const arr = msgFromStorage.settings.map((x) => x.value) as LanguageValue[];
  for (let lang of arr) {
    await realTimeTranslate(lang, msg.realtimeNodeId);
  }
}

async function stopRealtimeTranslate(params: IParams) {
  await figma.clientStorage.deleteAsync(STORAGE.realtimeTextNodes);
}

async function changeCurrentSelection(params: IParams) {
  const { msg } = params;
  figma.currentPage.selection = figma.currentPage.findAll((x) => msg.selectedFrameIds?.includes(x.id));
}

async function getMsg(params: IParams) {
  // 初始化时给个 defaultSetting 的默认值
  const { msgFromStorage } = params;
  figma.ui.postMessage({
    msg: { defaultSetting: [DEFAULT_SETTING], ...msgFromStorage },
    type: FIGMA_EVENT.GET_MSG,
  });
}

async function startExport(params: IParams) {
  const { msgFromStorage } = params;
  const selectedFrameIds = msgFromStorage.selection
    ?.filter(
      (x) =>
        x.parentType === NODE_TYPES.PAGE &&
        (x.type === NODE_TYPES.FRAME || x.type === NODE_TYPES.INSTANCE || x.type === NODE_TYPES.SECTION)
    )
    .map((y) => y.id);
  const selectedFrames = figma.currentPage.children.filter((x) => selectedFrameIds?.includes(x.id));
  const isInvalid = selectedFrames.length === 0;
  const isSingleFrame = selectedFrames.length === 1;

  if (isInvalid) {
    figma.notify(FRAME_INVALID);
    return;
  }

  const fileName = figma.root.name;
  const pageName = figma.currentPage.name;
  const excelName = isSingleFrame
    ? `${fileName}_${pageName}_${selectedFrames[0].name} - translate document`
    : `${fileName}_${pageName}_${selectedFrames.length} Frames - translate document`;

  const dataSource = [];
  for (let node of selectedFrames) {
    const bytes = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 },
    });
    dataSource.push({
      bytes,
      data: getTexts([node]),
      frameName: node.name,
      frameId: node.id,
      aspectRatio: node.width / node.height,
    });
  }

  figma.ui.postMessage({
    type: FIGMA_EVENT.START_EXPORT,
    dataSource,
    excelName,
  });
}

async function getFrameIds(params: IParams) {
  const frameOptions = figma.currentPage.children
    .filter((x) => x.type === NODE_TYPES.FRAME || x.type === NODE_TYPES.INSTANCE || x.type === NODE_TYPES.SECTION)
    .map((y) => ({ value: y.id, label: y.name }));

  figma.ui.postMessage({
    type: FIGMA_EVENT.GET_FRAME_IDS,
    frameOptions,
  });
}

async function getCurrentSelection(params: IParams) {
  const { msgFromStorage } = params;
  figma.ui.postMessage({
    selection: msgFromStorage.selection,
    type: FIGMA_EVENT.GET_CURRENT_SELECTION_IDS,
  });
}

async function _getFonts(params: IParams) {
  const { msg } = params;
  figma
    .listAvailableFontsAsync()
    .then((allFonts) => {
      const _children = figma.root.children.slice();
      const fns = {
        [TransScope.SelectedObject]: () => getFonts(figma.currentPage.selection),
        [TransScope.CurrentPage]: () => getFonts(figma.currentPage.children),
        [TransScope.EntireFile]: () => getFonts(_children),
      };
      figma.ui.postMessage({
        allFonts: [{ fontName: { family: 'Auto', style: 'Auto' } }, ...allFonts],
        usedFonts: fns[msg.scope]?.(),
        type: FIGMA_EVENT.GET_FONTS,
      });
    })
    .catch((error) => {
      figma.notify('Loading failed. Please restart the plug-in');
    });
}

function endTranslate() {
  figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);
}
