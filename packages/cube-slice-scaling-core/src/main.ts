export function onMessage(msg) {
  switch (msg.type) {
    case 'ONLOAD':
      ready();
      break;
    case 'SLICE_COMPLETED':
      const { sliceData, nodeName, showRect, originalImageData, originalNode } = msg;
      onSliceCompleted(sliceData, nodeName, showRect, originalImageData, originalNode);
      break;
  }
}

/*就绪 */
async function ready() {
  const selection: readonly SceneNode[] = figma.currentPage.selection;
  if (selection.length < 1) {
    figma.ui.postMessage({ type: 'NO_SELECTION' });
    return;
  }
  const node: SceneNode = selection[0];
  //加载原始图像
  // const imagePaint: ImagePaint = getNodeImagePaint(<GeometryMixin>node);
  // if (imagePaint == null) {
  //   figma.ui.postMessage({type: 'NO_SELECTION'});
  //   return;
  // }

  // const image = figma.getImageByHash(imagePaint.imageHash);
  //const bytes = await image.getBytesAsync();
  //加载目前显示的图像
  const bytes = await node.exportAsync();
  figma.ui.postMessage({
    type: 'INITIALIZE',
    data: bytes,
    nodeName: node.name,
    showRect: { x: node.x, y: node.y, width: node.width, height: node.height },
    originalNode: node,
  });
}
/*获取节点的ImagePaint */
function getNodeImagePaint(geometry: GeometryMixin): ImagePaint {
  const paints: ReadonlyArray<Paint> = geometry.fills as ReadonlyArray<Paint>;
  for (let i = 0; i < paints.length; i++) {
    if (paints[i].type === 'IMAGE') {
      return paints[i] as ImagePaint;
    }
  }
  return null;
}
/**裁剪碎片信息 */
interface Fragment {
  readonly rect: Rect;
  readonly data: Uint8Array;
}
/**切片信息 */
interface SliceData {
  readonly fragments: Fragment[];
  readonly width: number;
  readonly height: number;
}
/*约束元素 */
const fragmentConstraints = ['MIN', 'STRETCH', 'MAX'];
/**拼合碎片 */
function onSliceCompleted(
  sliceData: SliceData,
  nodeName: string,
  showRect: Rect,
  originalImageData: Uint8Array,
  originalNode: SceneNode
) {
  const foundNode = figma.currentPage.findOne((n) => {
    return n.id === originalNode.id;
  });
  let parentNode: any = foundNode == null ? figma.currentPage : foundNode.parent;
  let foundId = foundNode == null ? '' : foundNode.id;
  let nodeIndex = 0;
  //裁剪的节点可能在打开插件之后就被删掉了
  if (foundNode != null) {
    //如果没删掉的话就看看它祖宗上面有没有ComponentNode吧，毕竟组件下面不能套组件
    let checkNode = foundNode.parent;
    while (checkNode.type !== 'PAGE') {
      if (checkNode.type === 'COMPONENT') {
        foundId = checkNode.id;
        parentNode = checkNode.parent;
      }
      checkNode = checkNode.parent;
    }
    nodeIndex = getNodeIndex(parentNode, foundId);
  }
  //用个组件把碎片装起来吧
  const componentNode = figma.createComponent();
  const sliceOutput = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const el = sliceData.fragments[i * 3 + j];
      if (!((i * 3 + j) % 8)) {
        sliceOutput.push(el.rect.width, el.rect.height);
      }
      if (!el.data) {
        continue;
      }
      const rect = figma.createRectangle();
      rect.fills = [
        {
          type: 'IMAGE',
          scaleMode: 'CROP',
          imageHash: figma.createImage(el.data).hash,
        },
      ];
      componentNode.appendChild(rect);
      rect.locked = true;
      rect.x = el.rect.x;
      rect.y = el.rect.y;
      rect.constraints = {
        horizontal: <ConstraintType>fragmentConstraints[j],
        vertical: <ConstraintType>fragmentConstraints[i],
      };
      rect.resize(el.rect.width, el.rect.height);
      rect.setSharedPluginData('9slice', 'type', 'frag');
    }
  }
  //目前只是看到组件下不能套组件，不知道还有没有其它情况，这里再设个关卡咯
  while (true) {
    try {
      parentNode.insertChild(nodeIndex, componentNode);
    } catch (error) {
      parentNode = parentNode.parent;
      nodeIndex = 0;
      continue;
    }
    if (foundNode != null) {
      foundNode.remove();
    }
    break;
  }

  componentNode.x = showRect.x;
  componentNode.y = showRect.y;
  componentNode.setSharedPluginData('9slice', 'type', 'origin');
  componentNode.setSharedPluginData('9slice', 'sliceData', JSON.stringify(sliceOutput));
  componentNode.resizeWithoutConstraints(sliceData.width, sliceData.height);
  componentNode.resize(showRect.width, showRect.height);
  componentNode.name = nodeName;
  componentNode.fills = [
    {
      type: 'IMAGE',
      scaleMode: 'CROP',
      imageHash: figma.createImage(originalImageData).hash,
      visible: false,
    },
  ];
  const selectionNodes = <SceneNode[]>[componentNode];
  figma.currentPage.selection = selectionNodes;
  componentNode.expanded = false;

  figma.closePlugin();
}

function getNodeIndex(parent, id): number {
  for (let i = 0; i < parent.children.length; i++) {
    const node = parent.children[i];
    if (node.id === id) {
      return i;
    }
  }
  return 0;
}
