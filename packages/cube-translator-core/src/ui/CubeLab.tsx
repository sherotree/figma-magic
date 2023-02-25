import { useState } from 'react';
import { Translate } from './Translate';
import { Tag, Button } from 'antd';
import { TransTab, IFontOption, ISetting, LANGUAGES, USER_EVENT } from '../main';
import { ReactComponent as RealTimeTranslateIcon } from '../assets/realtime-translate.svg';
import { ReactComponent as ArrowLeft } from '../assets/arrow_left.svg';
import { ReactComponent as RandomSrc } from '../assets/random.svg';
import i18n from 'i18next';

enum Page {
  Home = 'Home',
  REALTIME = 'REALTIME',
  Random = 'Random',
}

interface IProps {
  settings: ISetting[];
  setSettings: any;
  sourceFontOptions: IFontOption[];
  allFontOptions: IFontOption[];
}

export function CubeLab(props: IProps) {
  const { settings, setSettings, sourceFontOptions, allFontOptions } = props;
  const [page, setPage] = useState(Page.Home);

  const startRandomTranslate = (randomLang) => {
    parent.postMessage({ pluginMessage: { type: USER_EVENT.START_RANDOM_TRANSLATE, randomLang } }, '*');
  };

  return (
    <>
      {page === Page.Home && (
        <>
          <div className="box mt-6 relative" onClick={() => setPage(Page.REALTIME)}>
            <Tag className="absolute right-4 top-4">Beta</Tag>
            <RealTimeTranslateIcon className="text-primary w-12 h-12" />
            <div className="mt-2 font-bold">{i18n.t('Real-time Translate')}</div>
            <div className="mt-1 text-center text-secondary">
              {i18n.t(
                'It can help you translate the text in the selected Frame into other languages in real time, suitable for multilingual designers to collaborate in real time'
              )}
            </div>
          </div>

          <div className="box mt-2 relative" onClick={() => setPage(Page.Random)}>
            <Tag className="absolute right-4 top-4">Beta</Tag>
            <RealTimeTranslateIcon className="text-primary w-12 h-12" />
            <div className="mt-2 font-bold">{i18n.t('Random Translate')}</div>
            <div className="mt-1 text-center text-secondary">
              {i18n.t('This function supports you to randomly translate the selected object into another language')}
            </div>
          </div>
        </>
      )}

      {page === Page.REALTIME && (
        <>
          <div className="flex flex-row items-center mb-6">
            <div
              className="p-1 cursor-pointer mr-3 hover:bg-[var(--figma-color-bg-hover)] rounded-md"
              onClick={() => setPage(Page.Home)}
            >
              <ArrowLeft />
            </div>
            <span>{i18n.t('Real-time Translate')}</span>
          </div>
          <Translate
            type={TransTab.CubeLab}
            settings={settings}
            setSettings={setSettings}
            sourceFontOptions={sourceFontOptions}
            allFontOptions={allFontOptions}
          />
        </>
      )}

      {page === Page.Random && (
        <>
          <div className="flex flex-row items-center mb-6">
            <div
              className="p-1 cursor-pointer mr-3 hover:bg-[var(--figma-color-bg-hover)] rounded-md"
              onClick={() => setPage(Page.Home)}
            >
              <ArrowLeft />
            </div>
            <span>{i18n.t('Random Translate')}</span>
          </div>
          <div className="mb-2 w-full">
            <div className="mb-3 font-bold">{i18n.t('Translate to')}</div>
            <div className="grid-wrapper">
              {LANGUAGES.map((x) => (
                <Button
                  className="w-full bg-[var(--figma-color-bg-hover)]"
                  type="default"
                  onClick={() => startRandomTranslate(x.value)}
                >
                  {i18n.t(x.label)}
                </Button>
              ))}
            </div>
            <Button
              className="mt-2 w-full bg-[var(--figma-color-bg-hover)] flex items-center justify-center"
              type="default"
              onClick={() => {
                const randomIndex = Math.ceil(Math.random() * 16);
                const randomLang = LANGUAGES[randomIndex]?.value;
                startRandomTranslate(randomLang);
              }}
            >
              <RandomSrc className="mr-1 w-4 h-4" />
              <span>{i18n.t('Random Translate')}</span>
            </Button>
          </div>
        </>
      )}
    </>
  );
}
