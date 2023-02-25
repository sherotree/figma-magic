import { useState, useRef, useEffect } from 'react';
import { Button, Select } from 'antd';
import { CubeSelect } from '../components/CubeSelect';
import { ReactComponent as DirectCoverageSrc } from '../assets/cover-directly.svg';
import { ReactComponent as SectionSrc } from '../assets/section.svg';
import { ReactComponent as NewPageSrc } from '../assets/new-page.svg';
import { ReactComponent as BesideSrc } from '../assets/side.svg';
import { ReactComponent as LeftSrc } from '../assets/left.svg';
import { ReactComponent as RightSrc } from '../assets/right.svg';
import { ReactComponent as AboveSrc } from '../assets/above.svg';
import { ReactComponent as BottomSrc } from '../assets/bottom.svg';
import { Setting } from './Setting';
import {
  TransShowIn,
  TransScope,
  SHOW_INS_OF_SCOPE_MAP,
  LANGUAGES,
  clone,
  TransTab,
  FIGMA_EVENT,
  USER_EVENT,
  uuid,
  DEFAULT_SETTING,
  IFontOption,
  ISetting,
  TransPosition,
} from '../main';
import i18n from 'i18next';

interface IProps {
  allFontOptions: IFontOption[];
  sourceFontOptions: IFontOption[];
  settings: ISetting[];
  setSettings: any;
  type: TransTab;
}

const SHOW_IN_LOGO_MAP = {
  [TransShowIn.DirectCoverage]: <DirectCoverageSrc className="text-primary w-10 h-10" />,
  [TransShowIn.Beside]: <BesideSrc className="text-primary w-10 h-10" />,
  [TransShowIn.Section]: <SectionSrc className="text-primary w-10 h-10" />,
  [TransShowIn.NewPage]: <NewPageSrc className="text-primary w-10 h-10" />,
};

const POSITION_LOGO_MAP = {
  [TransPosition.Right]: <RightSrc className="text-primary w-10 h-6" />,
  [TransPosition.Left]: <LeftSrc className="text-primary w-10 h-6" />,
  [TransPosition.Above]: <AboveSrc className="text-primary w-10 h-6" />,
  [TransPosition.Bottom]: <BottomSrc className="text-primary w-10 h-6" />,
};

const SHOW_IN_MSG_MAP = {
  [TransShowIn.DirectCoverage]: 'The translation result will directly overwrite the source text',
  [TransShowIn.Beside]: 'The translation result will be displayed next to the selected object',
  [TransShowIn.Section]: 'The translation result will be displayed in a new artboard under the current page',
  [TransShowIn.NewPage]: 'The translation result will be displayed in a new page',
};

const BESIDE_MSG_MAP = {
  [TransPosition.Right]: 'The translation result will be displayed to the right of the selected object',
  [TransPosition.Left]: 'The translation result will be displayed to the left of the selected object',
  [TransPosition.Above]: 'The translation result will be displayed above the selected object',
  [TransPosition.Bottom]: 'The translation result will be displayed below the selected object',
};

enum PROGRESS {
  IDLE = 'IDLE',
  START = 'START',
  END = 'END',
}

export function Translate(props: IProps) {
  const { allFontOptions, sourceFontOptions, settings, setSettings, type } = props;
  const [loading, setLoading] = useState(false);
  const [openIds, setOpenIds] = useState([]);
  const [progress, setProgress] = useState(PROGRESS.IDLE);
  const changeTimeRef = useRef<number>(Infinity);

  const { data: translateData, update: updateTranslateData } = useStructuredState({
    scope: TransScope.SelectedObject,
    showIn: TransShowIn.DirectCoverage,
    position: TransPosition.Right,
  });
  const { scope, showIn, position } = translateData;

  const showInOptions = settings.length > 1 ? SHOW_INS_OF_SCOPE_MAP[scope].slice(1) : SHOW_INS_OF_SCOPE_MAP[scope];
  const scopeOptions = type === TransTab.Translate ? Object.values(TransScope) : Object.values(TransScope).slice(0, 1);
  const positionOptions = Object.values(TransPosition);

  const startTranslate = () => {
    const _type = type === TransTab.Translate ? USER_EVENT.START_TRANSLATE : USER_EVENT.START_REALTIME_TRANSLATE;
    const _showIn = type === TransTab.Translate ? showIn : TransShowIn.Beside;
    parent.postMessage(
      {
        pluginMessage: {
          scope,
          showIn: _showIn,
          position,
          sourceFontOptions,
          settings,
          type: _type,
        },
      },
      '*'
    );
  };

  const getFonts = () => {
    parent.postMessage(
      {
        pluginMessage: {
          scope,
          showIn,
          sourceFontOptions,
          type: USER_EVENT.GET_FONTS,
        },
      },
      '*'
    );
  };

  useEffect(() => {
    window.addEventListener('message', fn);
    return () => window.removeEventListener('message', fn);

    function fn(event) {
      const { type, realtimeNodeId } = event.data.pluginMessage || {};

      if (type === FIGMA_EVENT.SELECTION_CHANGE) {
        getFonts();
      }
      if (type === FIGMA_EVENT.NODE_CHANGED) {
        changeTimeRef.current = new Date().getTime();
      }
      if (type === FIGMA_EVENT.START_TRANSLATE) {
        setLoading(true);
        setProgress(PROGRESS.START);
        changeTimeRef.current = Infinity;
      }
      if (type === FIGMA_EVENT.START_REALTIME_TRANSLATE) {
        setLoading(true);
        changeTimeRef.current = Infinity;
      }
      if (type === FIGMA_EVENT.KEEP_REALTIME_TRANSLATE) {
        parent.postMessage(
          {
            pluginMessage: {
              type: USER_EVENT.KEEP_REALTIME_TRANSLATE,
              realtimeNodeId,
            },
          },
          '*'
        );
      }
    }
  }, []);

  useEffect(() => {
    if (type === TransTab.CubeLab) {
      return;
    }

    const id = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - changeTimeRef.current;

      if (diff > 500) {
        setLoading(false);
        setProgress(PROGRESS.END);
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (progress === PROGRESS.END) {
      parent.postMessage({ pluginMessage: { type: USER_EVENT.END_TRANSLATE } }, '*');
    }
  }, [progress]);

  useEffect(() => {
    getFonts();
    updateTranslateData('showIn', showInOptions[0]);
    updateTranslateData('position', positionOptions[0]);
  }, [scope]);

  useEffect(() => {
    if (settings.length > 1 && showIn === TransShowIn.DirectCoverage) {
      updateTranslateData('showIn', showInOptions[0]);
    }
  }, [settings.length]);

  const ids = settings.map((x) => x.value);

  return (
    <>
      <div className="overflow-auto h-full mb-4">
        <div className="mb-4 w-full">
          <div className="mb-2 font-bold">{i18n.t('Select object')}</div>
          <CubeSelect
            className="w-full"
            value={scope}
            onChange={(value) => {
              updateTranslateData('scope', value as TransScope);
            }}
          >
            {scopeOptions.map((x) => (
              <Select.Option value={x} key={x}>
                {i18n.t(x)}
              </Select.Option>
            ))}
          </CubeSelect>
        </div>

        <>
          <div className="mb-2 w-full">
            <div className="mb-2 font-bold">{i18n.t('Translate to')}</div>
            <div>
              {settings.map((x, index) => (
                <Setting
                  key={x.id}
                  setting={x}
                  setOpenIds={setOpenIds}
                  isOpen={openIds?.includes(x.id)}
                  allFontOptions={allFontOptions}
                  sourceFontOptions={sourceFontOptions}
                  languageOptions={LANGUAGES.filter((y) => y.value === x.value || !ids?.includes(y.value))}
                  updateLanguage={(value) => {
                    settings[index] = value;
                    setSettings([...settings]);
                  }}
                  removeLanguage={() => {
                    const res = settings.filter((y) => y.id !== x.id);
                    setSettings(res);
                  }}
                  onlyOneRow={settings.length === 1}
                  isDefaultSetting
                />
              ))}
            </div>
          </div>

          <Button
            type="default"
            className="w-full bg-[var(--figma-color-bg-hover)]"
            onClick={() => {
              const lastLanguageIndex = LANGUAGES.findIndex((x) => x.value === settings[settings.length - 1].value);
              const nextLanguage = LANGUAGES[(lastLanguageIndex + 1) % LANGUAGES.length];

              setSettings((pre) => [
                ...pre,
                {
                  ...DEFAULT_SETTING,
                  value: nextLanguage.value,
                  label: nextLanguage.label,
                  id: uuid(),
                },
              ]);
            }}
          >
            + {i18n.t('Add Language')}
          </Button>
        </>

        {type === TransTab.Translate && (
          <div className="mb-4 mt-4 w-full">
            <div className="mb-2 font-bold">{i18n.t('Show in')}</div>
            <div className="flex gap-2">
              {showInOptions.map((x, index) => (
                <div
                  className={`show-in-cell ${x === showIn ? 'show-in-cell-active' : 'show-in-cell-inactive'}`}
                  key={x}
                  onClick={() => {
                    updateTranslateData('showIn', x);
                    if (x === TransShowIn.Beside) {
                      updateTranslateData('position', TransPosition.Right);
                    }
                  }}
                >
                  {SHOW_IN_LOGO_MAP[x]}
                  {i18n.t(x)}
                </div>
              ))}
            </div>
            {showIn === TransShowIn.Beside && (
              <div className="flex gap-2 mt-2 p-2 justify-between position-wrapper">
                {positionOptions.map((x) => (
                  <div
                    className={`position-cell ${x === position ? 'position-cell-active' : 'show-in-cell-inactive'}`}
                    key={x}
                    onClick={() => updateTranslateData('position', x)}
                  >
                    {POSITION_LOGO_MAP[x]}
                    {i18n.t(x)}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 text-secondary">
              {showIn === TransShowIn.Beside ? i18n.t(BESIDE_MSG_MAP[position]) : i18n.t(SHOW_IN_MSG_MAP[showIn])}
            </div>
          </div>
        )}
      </div>

      <div className="text-center bottom-4 mt-auto">
        {type === TransTab.CubeLab && (
          <div className="text-secondary mb-2 text-left">
            {loading
              ? i18n.t('Make sure to keep the plugin running when using the real-time translation feature')
              : i18n.t('The translation result will be displayed next to the selected object')}
          </div>
        )}

        <div className="flex flex-row gap-2">
          <Button
            className={`w-full ${loading ? 'cursor-not-allowed' : ''}`}
            type="primary"
            size="large"
            loading={loading}
            onClick={() => {
              if (loading) {
                return;
              }
              startTranslate();
            }}
          >
            <span>{loading ? i18n.t('Translating') : i18n.t('Translate')}</span>
          </Button>

          {type === TransTab.CubeLab && loading && (
            <>
              <Button
                type="primary"
                size="large"
                danger
                className="w-full"
                onClick={() => {
                  setLoading(false);
                  parent.postMessage(
                    {
                      pluginMessage: {
                        type: USER_EVENT.STOP_REALTIME_TRANSLATE,
                      },
                    },
                    '*'
                  );
                }}
              >
                {i18n.t('Quit')}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function useStructuredState(defaultData: object = {}): any {
  const [data, setData] = useState(defaultData || {});

  function update(field: string, value: unknown) {
    setData((pre: object) => {
      const newData = clone(pre);
      newData[field] = value;
      return newData;
    });
  }

  return { data, setData, update };
}
