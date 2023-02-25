import { rewriteNodes } from './rewriteNodes';
import { rewriteText } from './rewriteText';
import { NODE_TYPES, TransTab, IMsg, TransShowIn, TransPosition } from './api';
import { isIgnoredNodeType } from './isIgnoredNodeType';
import { LanguageValue, LANGUAGES } from './constants';
import { getAncestorNode } from './getAncestorNode';

export async function cloneNodesOnSide(nodes: readonly any[], lang: LanguageValue) {
  const msg: IMsg = await figma.clientStorage.getAsync('msg');
  const { tab, humanLanguageSource, showIn, position } = msg;

  const isHumanTranslate = tab === TransTab.HumanTranslation;
  const targetLanguage = LANGUAGES.find((x) => x.value === lang);

  for (const node of nodes) {
    const frameId = node.id;
    const index = (
      isHumanTranslate
        ? Object.keys?.(Object.values?.(humanLanguageSource?.[frameId])?.[0])
        : msg.settings.map((x) => x.value)
    ).findIndex((x) => x === lang);

    const ancestorNode = getAncestorNode(node);
    const { x: ancestorX, y: ancestorY } = ancestorNode;

    if (node.type === NODE_TYPES.TEXT) {
      const text = node.clone();
      figma.currentPage.selection = figma.currentPage.selection.concat(text);
      const parent = node.parent;
      const newText = await rewriteText({ text, lang, frameId });

      if (parent.type === NODE_TYPES.PAGE) {
        newText.x = node.x + (node.width + 100) * (index + 1);
        if (showIn === TransShowIn.Beside) {
          if (position === TransPosition.Left) {
            newText.x = node.x - (node.width + 100) * (index + 1);
          }
          if (position === TransPosition.Above) {
            newText.x = node.x;
            newText.y = node.y - (node.height + 100) * (index + 1);
          }
          if (position === TransPosition.Bottom) {
            newText.x = node.x;
            newText.y = node.y + (node.height + 100) * (index + 1);
          }
        }
      } else {
        newText.x = ancestorX + (node.width + 100) * (index + 1);
        newText.y = ancestorY;

        if (showIn === TransShowIn.Beside) {
          if (position === TransPosition.Left) {
            newText.x = ancestorX - (node.width + 100) * (index + 1);
          }
          if (position === TransPosition.Above) {
            newText.x = ancestorX;
            newText.y = ancestorY - (node.height + 100) * (index + 1);
          }
          if (position === TransPosition.Bottom) {
            newText.x = ancestorX;
            newText.y = ancestorY + (node.height + 100) * (index + 1);
          }
        }
      }

      figma.currentPage.appendChild(newText);

      continue;
    }

    if (isIgnoredNodeType(node.type)) {
      continue;
    }

    if (node.children) {
      const parent = node.clone();
      figma.currentPage.selection = figma.currentPage.selection.concat(parent);
      parent.name = parent.name + '/' + targetLanguage.label;
      parent.x = ancestorX + (parent.width + 100) * (index + 1);
      parent.y = ancestorY;

      if (showIn === TransShowIn.Beside) {
        if (position === TransPosition.Left) {
          parent.x = ancestorX - (parent.width + 100) * (index + 1);
        }
        if (position === TransPosition.Above) {
          parent.x = ancestorX;
          parent.y = ancestorY - (parent.height + 100) * (index + 1);
        }
        if (position === TransPosition.Bottom) {
          parent.x = ancestorX;
          parent.y = ancestorY + (parent.height + 100) * (index + 1);
        }
      }
      rewriteNodes({ nodes: parent.children, lang, frameId });
    }
  }
}
