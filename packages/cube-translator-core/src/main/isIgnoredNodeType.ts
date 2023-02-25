import { NODE_TYPES } from './api';

export function isIgnoredNodeType(nodeType: NODE_TYPES) {
  return [
    NODE_TYPES.SLICE,
    NODE_TYPES.VECTOR,
    NODE_TYPES.STAR,
    NODE_TYPES.ELLIPSE,
    NODE_TYPES.RECTANGLE,
    NODE_TYPES.STICKY,
    NODE_TYPES.CONNECTOR,
    NODE_TYPES.SHAPE_WITH_TEXT,
    NODE_TYPES.CODE_BLOCK,
    NODE_TYPES.STAMP,
    NODE_TYPES.WIDGET,
    NODE_TYPES.POLYGON,
    NODE_TYPES.EMBED,
    NODE_TYPES.LINK_UNFURL,
    NODE_TYPES.MEDIA,
    NODE_TYPES.HIGHLIGHT,
    NODE_TYPES.WASHI_TAPE,
    NODE_TYPES.LINE,
  ].includes(nodeType);
}
