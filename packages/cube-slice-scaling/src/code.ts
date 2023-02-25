import { onMessage } from 'cube-slice-scaling-core';

figma.skipInvisibleInstanceChildren = true;

figma.showUI(__html__, { themeColors: true, height: 640, width: 480, title: '9. Slice Scaling' });

figma.ui.onmessage = async (msg) => {
  onMessage(msg);
};
