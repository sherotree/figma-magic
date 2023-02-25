import { NODE_TYPES } from './api';

export function getTexts(nodes: any) {
  let res = new Set();
  traverseNodes(nodes);
  return [...res];

  function traverseNodes(nodes) {
    for (let node of nodes) {
      if (node.type === NODE_TYPES.TEXT) {
        res.add(node.characters);
      }
      if (node.children) {
        traverseNodes(node.children);
      }
    }
  }
}
