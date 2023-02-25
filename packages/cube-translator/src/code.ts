import { onMessage, _close, _selectionChange, _documentChange } from 'cube-translator-core';

figma.skipInvisibleInstanceChildren = true;

figma.showUI(__html__, { themeColors: true, height: 680, width: 480, title: 'Cube Translator' });

figma.on('selectionchange', _selectionChange);

figma.on('documentchange', _documentChange);

figma.ui.onmessage = async (msg) => {
  onMessage(msg);
};

figma.on('close', _close);
