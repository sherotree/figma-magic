import { getFormatDate } from './utils';

figma.skipInvisibleInstanceChildren = true;

figma.showUI(__html__, { themeColors: true, height: 680, width: 480, title: 'ChatGPT' });

figma.on('selectionchange', () => {
  const currentSelectionTexts: any = figma.currentPage.selection.filter((x) => x.type === 'TEXT');
  const text = currentSelectionTexts?.[0]?.characters;

  figma.ui.postMessage({
    text,
    count: currentSelectionTexts.length,
    type: 'FIGMA_EVENT_GET_CURRENT_SELECTION_TEXT',
  });
});

figma.ui.onmessage = async (msg) => {
  const { type } = msg;
  const msgFromStorage = await figma.clientStorage.getAsync('msg');

  if (type === 'USER_EVENT_GET_SELECTION') {
    const currentSelectionTexts: any = figma.currentPage.selection.filter((x) => x.type === 'TEXT');
    const text = currentSelectionTexts?.[0]?.characters;

    figma.ui.postMessage({
      text,
      count: currentSelectionTexts.length,
      type: 'FIGMA_EVENT_GET_CURRENT_SELECTION_TEXT',
    });
  }

  if (type === 'USER_EVENT_GET_MSG') {
    figma.ui.postMessage({
      msg: msgFromStorage,
      type: 'FIGMA_EVENT_GET_MSG',
    });
  }

  if (type === 'USER_EVENT_GET_RESULT') {
    let limit = msgFromStorage?.limit || {};
    const date = getFormatDate(new Date());

    if (limit[date]) {
      limit[date] += 1;
    } else {
      limit = { [date]: 1 };
    }

    await setMsg({ limit });

    figma.ui.postMessage({
      msg: { ...msgFromStorage, limit },
      type: 'FIGMA_EVENT_GET_MSG',
    });

    const currentSelectionTexts: any = figma.currentPage.selection.filter((x) => x.type === 'TEXT');
    let text = currentSelectionTexts?.[0];
    if (!text) {
      text = figma.createText();
      text.x = 50;
      text.y = 50;
    }

    await figma.loadFontAsync(text.fontName as any);
    text.characters = msg.text;
    text.fontSize = 18;
    // text.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
    figma.currentPage.selection = [text];
    figma.viewport.scrollAndZoomIntoView([text]);
  }
};

async function getMsg(params: any) {
  // 初始化时给个 defaultSetting 的默认值
  const { msgFromStorage } = params;
  figma.ui.postMessage({
    msg: msgFromStorage,
    type: 'FIGMA_EVENT_GET_MSG',
  });
}

async function setMsg(msg: any) {
  const pre = (await figma.clientStorage.getAsync('msg')) || {};
  await figma.clientStorage.setAsync('msg', { ...pre, ...msg });
}
