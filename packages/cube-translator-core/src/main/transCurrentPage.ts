import { cloneNodesOnSection } from './cloneNodesOnSection';
import { rewriteNodes } from './rewriteNodes';
import { IMsg, TransShowIn } from './api';
import { LANGUAGES, LanguageValue } from './constants';

export async function transCurrentPage(lang: LanguageValue) {
  const msg: IMsg = await figma.clientStorage.getAsync('msg');
  const targetLanguage = LANGUAGES.find((x) => x.value === lang);
  const fns = {
    [TransShowIn.DirectCoverage]: () => {
      const nodes = figma.currentPage.children;
      rewriteNodes({ nodes, lang });
      figma.currentPage.selection = figma.currentPage.children;
    },
    [TransShowIn.Section]: () => {
      cloneNodesOnSection(figma.currentPage.children, lang);
    },
    [TransShowIn.NewPage]: () => {
      const newPage = figma.currentPage.clone();
      newPage.selection = newPage.children;
      newPage.name = figma.currentPage.name + '/' + targetLanguage.label;
      const currentPageIndex = figma.root.children.findIndex((x) => x.name === figma.currentPage.name);
      figma.root.insertChild(currentPageIndex + 1, newPage);
      const nodes = newPage.children;
      rewriteNodes({ nodes, lang });
    },
  };
  fns[msg.showIn]?.();
}
