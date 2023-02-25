import { rewriteNodes } from './rewriteNodes';
import { getAncestorNode } from './getAncestorNode';
import { rewriteText } from './rewriteText';
import { isIgnoredNodeType } from './isIgnoredNodeType';
import { updateRealtimeTextNodes } from './updateRealtimeTextNodes';
import { STORAGE, NODE_TYPES, IMsg } from './api';
import { LanguageValue, LANGUAGES } from './constants';

export async function realTimeTranslate(lang: LanguageValue, realtimeNodeId = undefined) {
  const nodes = figma.currentPage.selection;
  await cloneNodesOnSide(nodes, lang, realtimeNodeId);
}

async function cloneNodesOnSide(nodes: readonly any[], lang: LanguageValue, realtimeNodeId) {
  const msg: IMsg = await figma.clientStorage.getAsync('msg');
  const targetLanguage = LANGUAGES.find((x) => x.value === lang);
  const realtimeTextNodes = await figma.clientStorage.getAsync(STORAGE.realtimeTextNodes);
  const index = msg.settings.findIndex((x) => x.value === lang);

  // 已翻译的 TextNode
  const preText = figma.currentPage.findOne((x) => x.id === realtimeTextNodes?.[realtimeNodeId]?.[lang]);

  if (preText) {
    rewriteText({ text: preText as TextNode, lang, customText: nodes[0]?.characters ?? '' });
    return;
  }

  for (const node of nodes) {
    const ancestorNode = getAncestorNode(node);
    const { x: ancestorX, y: ancestorY } = ancestorNode;

    if (node.type === NODE_TYPES.TEXT) {
      const text = node.clone();
      const parent = node.parent;
      const newText = await rewriteText({ text, lang });

      if (parent.type === NODE_TYPES.PAGE) {
        newText.x = node.x + (node.width + 100) * (index + 1);
      } else {
        newText.x = ancestorX + (node.width + 100) * (index + 1);
        newText.y = ancestorY;
      }

      figma.currentPage.appendChild(newText);
      await updateRealtimeTextNodes(node.id, lang, newText.id);

      continue;
    }

    if (isIgnoredNodeType(node.type)) {
      continue;
    }

    if (node.children) {
      const parent = node.clone();
      parent.name = parent.name + '/' + targetLanguage.label;
      parent.x = ancestorX + (parent.width + 100) * (index + 1);
      parent.y = ancestorY;
      await rewriteNodes({ nodes: parent.children, lang, origin: node });
    }
  }
}
