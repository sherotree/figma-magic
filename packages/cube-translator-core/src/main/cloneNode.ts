import { rewriteText } from './rewriteText';
import { NODE_TYPES } from './api';
import { isIgnoredNodeType } from './isIgnoredNodeType';
import { LanguageValue } from './constants';

interface IParams {
  node: any;
  newPage: PageNode;
  isRoot: boolean;
  lang: LanguageValue;
}

export async function cloneNode({ node, newPage, isRoot, lang }: IParams) {
  if (node.type === NODE_TYPES.TEXT) {
    if (isRoot) {
      const text = node.clone();
      const newText = await rewriteText({ text, lang });
      newPage.appendChild(newText);
    } else {
      await rewriteText({ text: node, lang });
    }

    return;
  }

  if (isIgnoredNodeType(node.type)) {
    return;
  }

  if (node.children) {
    let parent = node;
    if (isRoot) {
      parent = node.clone();
      newPage.appendChild(parent);
    }
    for (const child of parent.children) {
      await cloneNode({ node: child, newPage, isRoot: false, lang });
    }
  }
}
