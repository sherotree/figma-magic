import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { UI, initI18next } from 'cube-translator-core';
import './ui.less';
import 'antd/dist/reset.css';
import 'cube-translator-core/dist/tailwind.css';
import 'cube-translator-core/dist/custom.css';

import translatorLogo from './assets/translator-logo.png';
import scaleScalingLogo from './assets/scale-scaling-logo.png';
import homeSrc from './assets/home.png';
import settingSrc from './assets/setting.png';
import { COMMON_EVENT_TYPE } from './api';

import 'template-core/dist/tailwind.css';
import 'template-core/dist/custom.css';
import { UI as TemplateUI } from 'template-core';

// import { UI as SliceScalingUI } from './sliceScaling/Component';
import 'cube-slice-scaling-core/dist/tailwind.css';
import 'cube-slice-scaling-core/dist/custom.css';
import { UI as SliceScalingUI } from 'cube-slice-scaling-core';

initI18next();

const PLUGINS = [
  { name: 'Translator', desc: '多语言翻译', logo: translatorLogo, type: COMMON_EVENT_TYPE.SELECT_TRANSLATOR },
  {
    name: '9.Slice Scaling',
    desc: '九宫格切图',
    logo: scaleScalingLogo,
    type: COMMON_EVENT_TYPE.SELECT_9_SLICE_SCALING,
  },
];

function App() {
  const [type, setType] = useState(COMMON_EVENT_TYPE.SELECT_HOME);
  const [isSwitchToSetting, setIsSwitchToSetting] = useState(0);

  return (
    <div className="cube-design">
      {type === COMMON_EVENT_TYPE.SELECT_HOME && (
        <div className="px-2">
          {PLUGINS.map((x) => (
            <div
              key={x.type}
              className="flex items-center mb-1 p-2 cursor-pointer row-select"
              onClick={() => {
                setType(x.type);
                parent.postMessage({ pluginMessage: { type: x.type } }, '*');
              }}
            >
              <img src={x.logo} alt="" className="mr-3" style={{ borderRadius: 8, width: 32, height: 32 }} />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="font-bold text-primary">{x.name}</div>
                <div className="desc">{x.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {type !== COMMON_EVENT_TYPE.SELECT_HOME && (
        <div className="flex justify-between items-center py-2 px-4">
          <div className="flex items-center">
            <img
              src={homeSrc}
              className="w-8 h-8 cursor-pointer"
              alt=""
              onClick={() => {
                setType(COMMON_EVENT_TYPE.SELECT_HOME);
                parent.postMessage({ pluginMessage: { type: COMMON_EVENT_TYPE.SELECT_HOME } }, '*');
              }}
            />
            <span className="mx-3">/</span>
            <span className="text-base font-bold">{type}</span>
          </div>

          <img src={settingSrc} alt="" className="w-4 h-4" onClick={() => setIsSwitchToSetting((pre) => pre + 1)} />
        </div>
      )}

      {type === COMMON_EVENT_TYPE.SELECT_TRANSLATOR && (
        <div id="cube-translator">
          <UI isSubApp isSwitchToSetting={isSwitchToSetting} />
        </div>
      )}

      {/* TODO:样例 */}
      {type === COMMON_EVENT_TYPE.TEMPLATE && (
        <div id="cube-template">
          <TemplateUI />
        </div>
      )}

      {type === COMMON_EVENT_TYPE.SELECT_9_SLICE_SCALING && (
        <SliceScalingUI window={window} parent={parent} useShowSizeSlice={false} />
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('cube-design'));
root.render(<App />);
