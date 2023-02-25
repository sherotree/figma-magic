import { cloneNode } from './cloneNode';
import { LanguageValue, LANGUAGES } from './constants';

export async function cloneNodesOnNewPage(nodes: readonly SceneNode[], lang: LanguageValue) {
  const targetLanguage = LANGUAGES.find((x) => x.value === lang);
  const newPage = figma.createPage();
  newPage.name = figma.currentPage.name + '/' + targetLanguage.label;
  const currentPageIndex = figma.root.children.findIndex((x) => x.name === figma.currentPage.name);
  figma.root.insertChild(currentPageIndex + 1, newPage);

  for (const node of nodes) {
    await cloneNode({ node, newPage, isRoot: true, lang });
  }
}
