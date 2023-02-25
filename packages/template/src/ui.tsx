import { createRoot } from 'react-dom/client';
import { UI } from 'template-core';
import 'antd/dist/reset.css';
import 'template-core/dist/tailwind.css';
import 'template-core/dist/custom.css';

const root = createRoot(document.getElementById('template'));

root.render(<UI />);
