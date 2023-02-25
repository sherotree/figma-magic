import { rewriteNodes } from './rewriteNodes';
import { cloneNodesOnSection } from './cloneNodesOnSection';
import { IMsg, TransShowIn } from './api';
import { LanguageValue, LANGUAGES } from './constants';

export async function transEntireFile(lang: LanguageValue, _children: PageNode[]) {
  const msg: IMsg = await figma.clientStorage.getAsync('msg');
  const targetLanguage = LANGUAGES.find((x) => x.value === lang);

  const fns = {
    [TransShowIn.DirectCoverage]: () => {
      for (const page of _children) {
        const nodes = page.children;
        rewriteNodes({ nodes, lang });
      }
    },
    [TransShowIn.Section]: () => {
      for (const page of _children) {
        figma.currentPage = page;
        cloneNodesOnSection(page.children, lang);
      }
    },
    [TransShowIn.NewPage]: () => {
      for (const page of _children) {
        const newPage = page.clone();
        newPage.name = page.name + '/' + targetLanguage.label;
        const currentPageIndex = _children.findIndex((x) => x.name === page.name);
        figma.root.insertChild(currentPageIndex * 2 + 1, newPage);
        const nodes = newPage.children;
        rewriteNodes({ nodes, lang });
      }
    },
  };
  fns[msg.showIn]?.();
}
