import { onMessage } from 'template-core';

figma.skipInvisibleInstanceChildren = true;

figma.showUI(__html__, { themeColors: true, height: 680, width: 480, title: 'Template' });

figma.ui.onmessage = async (msg) => {
  onMessage();
};
