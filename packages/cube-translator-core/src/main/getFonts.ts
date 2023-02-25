import { NODE_TYPES } from './api';

export function getFonts(nodes: any) {
  const res = [];
  traverseNodes(nodes);
  return res;

  function traverseNodes(nodes) {
    for (let node of nodes) {
      if (node.type === NODE_TYPES.TEXT) {
        if (node.fontName === figma.mixed) {
          res.push({ family: 'Mixed', style: 'Mixed' });
        } else {
          res.push(node.fontName);
        }
      }
      if (node.children) {
        traverseNodes(node.children);
      }
    }
  }
}

export function renameTextNode(nodes: any) {
  for (let node of nodes) {
    if (node.type === NODE_TYPES.TEXT) {
      node.autoRename = false;
      node.name = Math.random().toString(16).slice(2);
    }
    if (node.children) {
      renameTextNode(node.children);
    }
  }
}
