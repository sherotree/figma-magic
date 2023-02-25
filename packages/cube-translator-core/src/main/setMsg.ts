import { IMsg } from './api';

export async function setMsg(msg: IMsg) {
  const pre = (await figma.clientStorage.getAsync('msg')) || {};
  await figma.clientStorage.setAsync('msg', { ...pre, ...msg });
}
