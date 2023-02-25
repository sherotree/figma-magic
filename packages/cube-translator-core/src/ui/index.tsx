import { useState, useRef, useEffect } from 'react';
import { ConfigProvider, Button } from 'antd';
import { HumanTranslate } from './HumanTranslate';
import { Translate } from './Translate';
import { Setting } from './Setting';
import { CubeLab } from './CubeLab';
import {
  TransTab,
  TRANSLATE_SOURCES,
  ISetting,
  clone,
  DEFAULT_SETTING,
  LANGUAGES,
  USER_EVENT,
  FIGMA_EVENT,
  uuid,
  IFontOption,
  IMsg,
} from '../main';
import { useForceUpdate } from 'cube-hooks';
import { CubeSelect } from '../components/CubeSelect';
import { ChangeLanguage } from './ChangeLanguage';
import i18n from 'i18next';
import '../tailwind.css';
import '../custom.less';

interface IProps {
  isSubApp?: boolean;
  isSwitchToSetting?: number;
}

export function UI(props: IProps) {
  const { isSubApp, isSwitchToSetting } = props;
  const [tab, setTab] = useState(TransTab.Translate);
  const [theme, setTheme] = useState({});
  const [openIds, setOpenIds] = useState([]);
  const [allFontOptions, setAllFontOptions] = useState<IFontOption[]>([]);
  const [sourceFontOptions, setSourceFontOptions] = useState<IFontOption[]>([]);
  const [translateSettings, setTranslateSettings] = useState<ISetting[]>([]);
  const [realTimeTranslateSettings, setRealTimeTranslateSettings] = useState<ISetting[]>([]);
  const defaultSettingRef = useRef<ISetting[]>([{ ...clone(DEFAULT_SETTING), id: uuid() }]);
  const { forceUpdate } = useForceUpdate();

  const tabCls = (current: TransTab) =>
    `mr-8 font-bold cursor-pointer whitespace-nowrap ${current === tab ? 'tab-active-border pb-1' : 'text-secondary'}`;

  // 作为子应用时隐藏 Setting
  const tabOptions = isSubApp ? Object.values(TransTab).filter((x) => x !== TransTab.Setting) : Object.values(TransTab);

  useEffect(() => {
    console.log({ isSwitchToSetting }); // TODO:
  }, [isSwitchToSetting]);

  useEffect(() => {
    // 同步缓存的默认设置
    parent.postMessage({ pluginMessage: { type: USER_EVENT.GET_MSG } }, '*');

    // 默认设置当前的tab
    parent.postMessage(
      {
        pluginMessage: { type: USER_EVENT.SET_MSG, tab: TransTab.Translate },
      },
      '*'
    );

    window.addEventListener('message', fn);
    return () => window.removeEventListener('message', fn);

    function fn(event) {
      const { allFonts, usedFonts, type, msg } = (event.data.pluginMessage || {}) as { msg: IMsg; [key: string]: any };

      if (type === FIGMA_EVENT.GET_FONTS) {
        setAllFontOptions(arrToTree(allFonts.map((y) => y.fontName)));
        setSourceFontOptions(arrToTree([{ family: 'All fonts', style: 'Auto' }, ...usedFonts]));
      }
      if (type === FIGMA_EVENT.GET_MSG) {
        defaultSettingRef.current = clone(msg.defaultSetting);
        setTranslateSettings(clone(msg.defaultSetting));
        setRealTimeTranslateSettings(clone(msg.defaultSetting));
        i18n.changeLanguage(msg.userLanguage ?? 'en');
      }
    }
  }, []);

  useEffect(() => {
    const seedToken = {
      fontSize: 12,
      borderRadius: 8,
      colorBgBase: getComputedStyle(document.documentElement).getPropertyValue('--color-bg')?.trim(),
      colorTextBase: getComputedStyle(document.documentElement).getPropertyValue('--color-text')?.trim(),
      // colorPrimary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary')?.trim(),
    };
    const mapToken = {
      colorBgContainer: getComputedStyle(document.documentElement).getPropertyValue('--color-bg')?.trim(),
      colorBgElevated: getComputedStyle(document.documentElement).getPropertyValue('--color-bg')?.trim(),
      colorInfoBg: getComputedStyle(document.documentElement).getPropertyValue('--figma-color-bg-onselected')?.trim(), // TODO:
      colorPrimaryBg: getComputedStyle(document.documentElement)
        .getPropertyValue('--figma-color-bg-onselected')
        ?.trim(), // TODO:
      colorInfoBgHover: '',
      colorBorder: getComputedStyle(document.documentElement).getPropertyValue('--figma-color-border')?.trim(),
    };
    const aliasToken = {
      colorBgTextHover: getComputedStyle(document.documentElement).getPropertyValue('--color-bg')?.trim(),
    };
    const components = {
      Select: {
        colorBgContainer: 'transparent',
      },
    };
    const theme = {
      token: { ...seedToken, ...mapToken, ...aliasToken },
      // components: components,
    };
    setTheme(theme);
  }, []);

  const ids = defaultSettingRef.current?.map((x) => x.value);

  return (
    <ConfigProvider theme={theme}>
      <main className="cube-translator text-xs overflow-hidden" style={{ maxHeight: 680 }}>
        <div className="flex mb-4">
          {tabOptions.map((x) => (
            <div
              className={tabCls(x)}
              key={x}
              onClick={() => {
                // 切换tab时结束实时翻译
                parent.postMessage(
                  {
                    pluginMessage: { type: USER_EVENT.STOP_REALTIME_TRANSLATE },
                  },
                  '*'
                );
                parent.postMessage({ pluginMessage: { type: USER_EVENT.SET_MSG, tab: x } }, '*');
                setTab(x);
              }}
            >
              {i18n.t(x)}
            </div>
          ))}
        </div>

        <div className="h-full w-full flex flex-col overflow-hidden">
          {tab === TransTab.Translate && (
            <Translate
              type={TransTab.Translate}
              settings={translateSettings}
              setSettings={setTranslateSettings}
              sourceFontOptions={sourceFontOptions}
              allFontOptions={allFontOptions}
            />
          )}

          {tab === TransTab.CubeLab && (
            <CubeLab
              settings={realTimeTranslateSettings}
              setSettings={setRealTimeTranslateSettings}
              sourceFontOptions={sourceFontOptions}
              allFontOptions={allFontOptions}
            />
          )}

          {tab === TransTab.Setting && (
            <>
              <div className="overflow-auto h-full mb-4">
                <ChangeLanguage forceUpdate={forceUpdate} />
                <div className="mb-4 w-full">
                  <div className="mb-2 font-bold">{i18n.t('Translate source')}</div>
                  <CubeSelect
                    onChange={() => {}}
                    className="w-full"
                    value={TRANSLATE_SOURCES[0].value}
                    options={TRANSLATE_SOURCES.map((x) => ({
                      ...x,
                      label: i18n.t(x.label),
                    }))}
                  />
                </div>

                <div className="mb-4 w-full">
                  <div className="mb-2 font-bold">{i18n.t('Translate to')}</div>
                  {defaultSettingRef.current?.map((x, index) => (
                    <Setting
                      key={x.id}
                      setting={x}
                      setOpenIds={setOpenIds}
                      isOpen={openIds?.includes(x.id)}
                      allFontOptions={allFontOptions}
                      sourceFontOptions={[
                        { value: 'All fonts', label: 'All fonts', children: [{ value: 'Auto', label: 'Auto' }] },
                        { value: 'Mixed', label: 'Mixed', children: [{ value: 'Mixed', label: 'Mixed' }] },
                        ...allFontOptions.filter((x) => x.value !== 'Auto'),
                      ]}
                      languageOptions={LANGUAGES.filter((y) => y.value === x.value || !ids?.includes(y.value))}
                      updateLanguage={(value) => {
                        defaultSettingRef.current[index] = value;
                        forceUpdate();
                      }}
                      removeLanguage={() => {
                        const res = defaultSettingRef.current.filter((y) => y.id !== x.id);
                        defaultSettingRef.current = res;
                        forceUpdate();
                      }}
                      onlyOneRow={defaultSettingRef.current.length === 1}
                      isDefaultSetting
                    />
                  ))}
                  <Button
                    className="w-full bg-[var(--figma-color-bg-hover)]"
                    type="default"
                    onClick={() => {
                      const lastLanguageIndex = LANGUAGES.findIndex(
                        (x) => x.value === defaultSettingRef.current[defaultSettingRef.current.length - 1].value
                      );
                      const nextLanguage = LANGUAGES[(lastLanguageIndex + 1) % LANGUAGES.length];
                      defaultSettingRef.current = [
                        ...defaultSettingRef.current,
                        {
                          ...DEFAULT_SETTING,
                          value: nextLanguage.value,
                          label: nextLanguage.label,
                          id: uuid(),
                        },
                      ];
                      forceUpdate();
                    }}
                  >
                    + {i18n.t('Add Language')}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 bottom-4 mt-auto">
                <Button
                  type="default"
                  className="w-full"
                  size="large"
                  onClick={() => {
                    // TODO:
                    setTab(TransTab.Translate);
                  }}
                >
                  {i18n.t('Cancel')}
                </Button>
                <Button
                  type="primary"
                  size="large"
                  className="w-full"
                  onClick={() => {
                    // TODO:
                    setTab(TransTab.Translate);
                    parent.postMessage(
                      {
                        pluginMessage: {
                          defaultSetting: defaultSettingRef.current,
                          type: USER_EVENT.SET_MSG,
                        },
                      },
                      '*'
                    );
                  }}
                >
                  {i18n.t('Save')}
                </Button>
              </div>
            </>
          )}

          {tab === TransTab.HumanTranslation && <HumanTranslate defaultSetting={defaultSettingRef.current} />}
        </div>
      </main>
    </ConfigProvider>
  );
}

function arrToTree(allFonts) {
  let map = new Set();

  // Auto 和 All fonts 需要国际化
  const labelWithI18n = (label: string) => {
    return label;
    // TODO:暂时不支持
    if (['Auto', 'All fonts'].includes(label)) {
      return i18n.t(label);
    }
    return label;
  };

  const res = allFonts.reduce((acc, x) => {
    const { family, style } = x;
    if (map.has(family)) {
      const targetIndex = acc.findIndex((y) => y.value === family);
      const currentChildren = acc[targetIndex].children;
      const isExist = currentChildren.some((x) => x.value === style);
      if (!isExist) {
        // style 去重
        acc[targetIndex].children.push({ value: style, label: style });
      }
    } else {
      acc.push({
        value: family,
        label: labelWithI18n(family),
        children: [{ value: style, label: labelWithI18n(style) }],
      });
    }
    map.add(family);
    return acc;
  }, []);

  return res;
}
