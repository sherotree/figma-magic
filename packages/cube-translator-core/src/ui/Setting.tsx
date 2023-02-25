import { useState } from 'react';
import { ConfigProvider } from 'antd';
import { CubeSelect } from '../components/CubeSelect';
import { ReactComponent as SettingIcon } from '../assets/setting_2.svg';
import { ReactComponent as DeleteIcon } from '../assets/delete.svg';
import { ReactComponent as FoldIcon } from '../assets/fold.svg';
import { ISetting, uuid, DEFAULT_SETTING, IFontOption, clone } from '../main';
import i18n from 'i18next';

interface IProps {
  setting: ISetting;
  allFontOptions: IFontOption[];
  sourceFontOptions: IFontOption[];
  isDefaultSetting?: boolean;
  updateLanguage?: (value: ISetting) => void;
  removeLanguage?: () => void;
  setOpenIds: (id: any) => void;
  isOpen: boolean;
  languageOptions: { label: string; value: string }[];
  onlyOneRow?: boolean;
}

const enum MSG_TYPE {
  AUTO = 'AUTO',
  SET_ALL = 'SET_ALL',
  SET_COUNTER = 'SET_COUNTER',
  SET_DEFAULT = 'SET_DEFAULT',
}

export function Setting(props: IProps) {
  const {
    sourceFontOptions,
    allFontOptions,
    setting,
    updateLanguage,
    onlyOneRow,
    removeLanguage,
    languageOptions,
    setOpenIds,
    isOpen,
  } = props;

  const { value, label, rules, id } = setting;

  const theme = {
    components: {
      Select: {
        colorBorder: 'rgba(29, 119, 255, 0.3)',
      },
    },
  };

  const [fontSet, setFontSet] = useState<{
    key: keyof typeof MSG_TYPE;
    font: string;
  }>({
    key: 'AUTO',
    font: '',
  });

  const MSG = {
    [MSG_TYPE.AUTO]: i18n.t('Automatic selection means that all texts will keep the font of the source text'),
    [MSG_TYPE.SET_ALL]: i18n.t('After the translation, all fonts will be displayed as {data}', { data: fontSet.font }),
    [MSG_TYPE.SET_COUNTER]: i18n.t('when the target font is not set, the target text is displayed in the source font'),
    [MSG_TYPE.SET_DEFAULT]: i18n.t('when the target font is not set, the target text is displayed in {data}', {
      data: fontSet.font,
    }),
  };

  // SET_DEFAULT > SET_ALL > SET_COUNTER > auto

  const computeMsgKey = (rules) => {
    const len = rules.length;
    fontSet.key = 'AUTO';
    fontSet.font = '';
    setFontSet(fontSet);

    for (let i = 0; i < len; i++) {
      // 配置了目标字体
      if (rules[i].targetFont.family !== 'Auto') {
        // 一对一字体设置
        if (rules[i].sourceFont.family !== 'All fonts' && rules[i].sourceFont.family !== 'Auto') {
          switch (fontSet.key) {
            case MSG_TYPE.SET_ALL: {
              fontSet.key = MSG_TYPE.SET_DEFAULT;
              setFontSet(fontSet);
              break;
            }
            case MSG_TYPE.AUTO: {
              fontSet.key = MSG_TYPE.SET_COUNTER;
              setFontSet(fontSet);
              break;
            }
          }
        } else {
          // 多对一字体设置
          switch (fontSet.key) {
            case MSG_TYPE.AUTO: {
              fontSet.key = MSG_TYPE.SET_ALL;
              fontSet.font = rules[i].targetFont.family;
              setFontSet(fontSet);
              break;
            }
            case MSG_TYPE.SET_COUNTER: {
              fontSet.key = MSG_TYPE.SET_DEFAULT;
              fontSet.font = rules[i].targetFont.family;
              setFontSet(fontSet);
              break;
            }
          }
        }
      }
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <CubeSelect
          showSearch
          className="w-full flex-1"
          // style={{ width: 384 }}
          value={value}
          optionFilterProp="label"
          onChange={(value) => {
            const label = languageOptions.find((x) => x.value === value)?.label;
            updateLanguage({ ...setting, value, label: i18n.t(label) });
          }}
          filterOption={(input, option) => (option?.label ?? '')?.toLowerCase()?.includes(input?.toLowerCase())}
          options={languageOptions.map((x) => ({
            ...x,
            label: i18n.t(x.label),
          }))}
        />

        <div
          className={`flex items-center cursor-pointer justify-center px-1 py-2 rounded-md ${
            isOpen ? 'fold-hover bg-[var(--color-bg-secondary)]' : 'unfold-hover'
          }`}
          onClick={() => {
            setOpenIds((pre) => {
              const index = pre.indexOf(id);
              if (index === -1) {
                return [...pre, id];
              }
              const cloneArr = clone(pre);
              cloneArr.splice(index, 1);
              return cloneArr;
            });
          }}
        >
          {isOpen ? <FoldIcon className="w-4 h-4 text-primary" /> : <SettingIcon className="w-4 h-4 text-secondary" />}
        </div>

        <div
          className={`flex items-center justify-center px-1 py-2 rounded-md ${
            onlyOneRow ? 'cursor-not-allowed opacity-50' : 'cursor-pointer delete-hover'
          } `}
          onClick={() => {
            if (onlyOneRow) {
              return;
            }
            removeLanguage();
          }}
        >
          <DeleteIcon className="w-4 h-4 text-secondary" />
        </div>
      </div>

      {isOpen && (
        <ConfigProvider theme={theme}>
          <div>
            {rules.map((x, index) => (
              <div
                key={x.id}
                className="flex flex-row items-center gap-2 p-2 mb-2 bg-[var(--color-bg-secondary)] rounded-lg"
              >
                <div className="w-full">
                  <div className="flex flex-row items-center gap-2 mb-2">
                    <div className="text-secondary pr-3 w-20">{i18n.t('Source font')}</div>
                    <CubeSelect
                      value={x.sourceFont.family}
                      dropdownMatchSelectWidth={220}
                      showSearch
                      options={sourceFontOptions}
                      style={{ width: 172 }}
                      onChange={(family) => {
                        const children = sourceFontOptions.find((y) => y.value === family)?.children;
                        setting.rules[index].sourceFont = {
                          family,
                          style: children?.[0]?.value,
                        };
                        computeMsgKey(setting.rules);
                        updateLanguage(setting);
                      }}
                    />
                    <CubeSelect
                      dropdownMatchSelectWidth={false}
                      style={{ width: 96 }}
                      value={x.sourceFont.style}
                      options={sourceFontOptions.find((y) => y.value === x.sourceFont.family)?.children || []}
                      className="flex-1"
                      onChange={(style) => {
                        setting.rules[index].sourceFont.style = style;
                        updateLanguage(setting);
                      }}
                    />
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <div className="text-secondary pr-3 w-20">{i18n.t('Target font')}</div>
                    <CubeSelect
                      value={x.targetFont.family}
                      dropdownMatchSelectWidth={220}
                      showSearch
                      options={allFontOptions}
                      style={{ width: 172 }}
                      onChange={(family) => {
                        const children = allFontOptions.find((y) => y.value === family)?.children;
                        setting.rules[index].targetFont = {
                          family,
                          style: children?.[0]?.value,
                        };
                        computeMsgKey(setting.rules);
                        updateLanguage(setting);
                      }}
                    />
                    <CubeSelect
                      value={x.targetFont.style}
                      dropdownMatchSelectWidth={false}
                      className="flex-1"
                      options={allFontOptions.find((y) => y.value === x.targetFont.family)?.children || []}
                      style={{ width: 96 }}
                      onChange={(style) => {
                        setting.rules[index].targetFont.style = style;
                        updateLanguage(setting);
                      }}
                    />
                  </div>
                </div>
                <div
                  className={`flex items-center justify-center px-4 py-8 ${
                    setting.rules.length === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer delete-hover'
                  }`}
                  onClick={() => {
                    const onlyOneRow = setting.rules.length === 1;
                    if (onlyOneRow) {
                      return;
                    }
                    setting.rules.splice(index, 1);
                    computeMsgKey(setting.rules);
                    updateLanguage(setting);
                  }}
                >
                  <DeleteIcon className={`h-4 w-4 text-secondary`} />
                </div>
              </div>
            ))}

            <div
              className="mb-1 cursor-pointer text-primary font-bold inline-block py-1"
              onClick={() => {
                setting.rules.push({ ...DEFAULT_SETTING.rules[0], id: uuid() });
                computeMsgKey(setting.rules);
                updateLanguage(setting);
              }}
            >
              {i18n.t('Add font settings')}
            </div>
            <div className="text-secondary mb-4">{MSG[fontSet.key]}</div>
          </div>
        </ConfigProvider>
      )}
    </div>
  );
}
