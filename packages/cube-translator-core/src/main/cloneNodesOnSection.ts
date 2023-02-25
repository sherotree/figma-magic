import { rewriteNodes } from './rewriteNodes';
import { getPositions } from './getPositions';
import { rewriteText } from './rewriteText';
import { NODE_TYPES, IMsg } from './api';
import { isIgnoredNodeType } from './isIgnoredNodeType';
import { LanguageValue, LANGUAGES, clone, SECTION_PADDING } from './constants';

export async function cloneNodesOnSection(nodes, lang: LanguageValue) {
  const msg: IMsg = await figma.clientStorage.getAsync('msg');
  const targetLanguage = LANGUAGES.find((x) => x.value === lang);
  const { left, right, top, bottom } = getPositions(nodes);
  const frameWidth = right - left;
  const frameHeight = bottom - top;
  const frame = figma.createFrame();
  figma.currentPage.selection = figma.currentPage.selection.concat(frame);
  frame.name = 'Frame/' + targetLanguage.label;
  frame.cornerRadius = 2;
  const fills = clone(frame.fills);
  fills[0].color.r = 0;
  fills[0].color.g = 0;
  fills[0].color.b = 0;
  frame.fills = fills;
  const width = frameWidth + SECTION_PADDING * 2;

  const index = msg.settings.findIndex((x) => x.value === lang);
  frame.x = left + frameWidth + 100 + (width + 100) * index;
  frame.y = top;
  frame.resize(width, frameHeight + SECTION_PADDING * 2);

  for (const node of nodes) {
    if (node.type === NODE_TYPES.TEXT) {
      const text = node.clone();
      const newText = await rewriteText({ text, lang });
      newText.x = node.x - left + SECTION_PADDING;
      newText.y = node.y - top + SECTION_PADDING;
      frame.appendChild(newText);
      continue;
    }

    if (isIgnoredNodeType(node.type)) {
      continue;
    }

    if (node.children) {
      let parent = node.clone();
      parent.x = parent.x - left + SECTION_PADDING;
      parent.y = parent.y - top + SECTION_PADDING;
      frame.appendChild(parent);
      await rewriteNodes({ nodes: parent.children, lang });
    }
  }
}
