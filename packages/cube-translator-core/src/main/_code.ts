import { FIGMA_EVENT, STORAGE } from './api';

export function _selectionChange() {
  figma.ui.postMessage({ type: FIGMA_EVENT.SELECTION_CHANGE });
}

export async function _documentChange(event: DocumentChangeEvent) {
  const ids = Object.keys((await figma.clientStorage.getAsync(STORAGE.realtimeTextNodes)) || {});

  figma.ui.postMessage({
    type: FIGMA_EVENT.DOCUMENT_CHANGE,
    id: event.documentChanges?.[0]?.id,
  });

  if (ids?.includes(event.documentChanges?.[0]?.id)) {
    figma.ui.postMessage({
      type: FIGMA_EVENT.KEEP_REALTIME_TRANSLATE,
      realtimeNodeId: event.documentChanges?.[0]?.id,
    });
  }
}

export async function _close() {
  await figma.clientStorage.deleteAsync(STORAGE.realtimeTextNodes);
}
