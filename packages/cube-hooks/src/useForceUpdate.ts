import { useReducer } from 'react';

interface IRes {
  ignore: number;
  forceUpdate: () => void;
}

export function useForceUpdate(): IRes {
  const [ignore, forceUpdate] = useReducer((x) => x + 1, 0);

  return { ignore, forceUpdate };
}
