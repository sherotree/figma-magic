import { createRoot } from 'react-dom/client';
import { UI } from 'cube-slice-scaling-core';
import 'antd/dist/reset.css';
import 'cube-slice-scaling-core/dist/tailwind.css';
import 'cube-slice-scaling-core/dist/custom.css';

const root = createRoot(document.getElementById('cube-slice-scaling'));

root.render(<UI window={window} parent={parent} useShowSizeSlice={false} />);
