import { NODE_TYPES } from './api';

export function getAncestorNode(node, last = { x: 0, y: 0 }) {
  let res = node;

  if (node.parent.type === NODE_TYPES.PAGE || node.parent.type === NODE_TYPES.DOCUMENT || node.parent.type === null) {
    return { x: res.x + last.x, y: res.y + last.y };
  }

  return getAncestorNode(node.parent, { x: res.x + last.x, y: res.y + last.y });
}
