import { createRoot } from 'react-dom/client';
import { UI, initI18next } from 'cube-translator-core';
import 'antd/dist/reset.css';
import 'cube-translator-core/dist/tailwind.css';
import 'cube-translator-core/dist/custom.css';

initI18next();

const root = createRoot(document.getElementById('cube-translator'));

root.render(<UI />);
