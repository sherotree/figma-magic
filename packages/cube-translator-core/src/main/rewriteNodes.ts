import { rewriteText } from './rewriteText';
import { isIgnoredNodeType } from './isIgnoredNodeType';
import { updateRealtimeTextNodes } from './updateRealtimeTextNodes';
import { NODE_TYPES } from './api';
import { LanguageValue } from './constants';

interface IParams {
  nodes: readonly any[];
  lang: LanguageValue;
  origin?: any;
  frameId?: string;
}

export async function rewriteNodes({ nodes, lang, origin, frameId }: IParams) {
  for (const node of nodes) {
    if (node.type === NODE_TYPES.TEXT) {
      if (origin) {
        // realtime-translate 模式需要记录 realtimeTextNodes
        const preText = origin.findOne((item) => item.name === node.name);
        await updateRealtimeTextNodes(preText.id, lang, node.id);
      }

      await rewriteText({ text: node, lang, frameId });
      continue;
    }

    if (isIgnoredNodeType(node.type)) {
      continue;
    }

    if (node.children) {
      await rewriteNodes({ nodes: node.children, lang, origin, frameId });
    }
  }
}
