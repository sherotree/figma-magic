import { Select } from 'antd';
import { ReactComponent as SelectDownIcon } from '../assets/select_down.svg';
// import type { SelectProps } from 'antd';

// TODO:props类型

export function CubeSelect(props) {
  return <Select suffixIcon={<SelectDownIcon className="w-4 color-[var(text-secondary)]" />} {...props} />;
}
