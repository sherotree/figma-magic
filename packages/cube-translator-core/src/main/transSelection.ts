import { cloneNodesOnNewPage } from './cloneNodesOnNewPage';
import { cloneNodesOnSide } from './cloneNodesOnSide';
import { rewriteNodes } from './rewriteNodes';
import { cloneNodesOnSection } from './cloneNodesOnSection';
import { IMsg, TransShowIn } from './api';
import { LanguageValue } from './constants';

export async function transSelection(lang: LanguageValue, nodes: any) {
  const msg: IMsg = await figma.clientStorage.getAsync('msg');

  const fns = {
    [TransShowIn.DirectCoverage]: () => rewriteNodes({ nodes, lang }),
    [TransShowIn.Beside]: () => cloneNodesOnSide(nodes, lang),
    [TransShowIn.Section]: () => cloneNodesOnSection(nodes, lang),
    [TransShowIn.NewPage]: () => cloneNodesOnNewPage(nodes, lang),
  };
  fns[msg.showIn]?.();
}
