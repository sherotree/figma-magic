export function getPositions(nodes: any): { left: number; right: number; top: number; bottom: number } {
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;

  for (const node of nodes) {
    left = Math.min(left, node.x);
    right = Math.max(right, node.x + node.width);
    top = Math.min(top, node.y);
    bottom = Math.max(bottom, node.y + node.height);
  }

  return { left, right, top, bottom };
}
