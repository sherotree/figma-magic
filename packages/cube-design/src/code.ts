import { onMessage as onSliceScalingMessage } from 'cube-slice-scaling-core';
// import { onMessage as onSliceScalingMessage } from './sliceScaling/util';
import { COMMON_EVENT_TYPE } from './api';
import {
  onMessage as onTransMessage,
  _close as transClose,
  _selectionChange as transSelectionChange,
  _documentChange as transDocumentChange,
} from 'cube-translator-core';

const HEADER_HEIGHT = 48;

figma.skipInvisibleInstanceChildren = true;

figma.showUI(__html__, { themeColors: true, height: 400, width: 350, title: 'Cube Design' });

figma.on('selectionchange', () => {
  transSelectionChange();
});

figma.on('documentchange', transDocumentChange);

figma.on('close', transClose);

figma.ui.onmessage = async (msg) => {
  if (msg.type === COMMON_EVENT_TYPE.SELECT_HOME) {
    figma.ui.resize(350, 400);
  }
  if (msg.type === COMMON_EVENT_TYPE.SELECT_TRANSLATOR) {
    figma.ui.resize(480, 680 + HEADER_HEIGHT);
  }
  if (msg.type === COMMON_EVENT_TYPE.SELECT_9_SLICE_SCALING) {
    figma.ui.resize(480, 640 + HEADER_HEIGHT);
  }
  onTransMessage(msg);
  onSliceScalingMessage(msg);
};
