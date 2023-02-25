import { useState, useRef, useEffect } from 'react';
import { Select, Button } from 'antd';
import { uuid, saveAs, USER_EVENT, TransScope, LANGUAGES, FIGMA_EVENT } from '../main';
import { CubeSelect } from '../components/CubeSelect';
import { ReactComponent as Delete } from '../assets/delete.svg';
import { ReactComponent as ArrowLeft } from '../assets/arrow_left.svg';
import { ReactComponent as MultiChecked } from '../assets/multi_checked.svg';
import * as ExcelJS from 'exceljs';
import { NODE_TYPES } from '../main';
import i18n from 'i18next';

interface IProps {
  goHome: () => void;
  defaultSetting: any;
}

export function ExportCSV(props: IProps) {
  const { goHome, defaultSetting } = props;
  const [frames, setFrames] = useState([]);
  const [settings, setSettings] = useState<any[]>(defaultSetting);
  const [loading, setLoading] = useState(false);
  const [frameOptions, setFrameOptions] = useState([]);
  const settingsRef = useRef(settings);

  const startExport = () => {
    parent.postMessage(
      {
        pluginMessage: {
          scope: TransScope.SelectedObject,
          settings,
          type: USER_EVENT.START_EXPORT,
        },
      },
      '*'
    );
  };

  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: USER_EVENT.GET_FRAME_IDS } }, '*');
    parent.postMessage({ pluginMessage: { type: USER_EVENT.GET_CURRENT_SELECTION } }, '*');

    window.addEventListener('message', fn);
    return () => window.removeEventListener('message', fn);

    async function fn(event) {
      const { type, dataSource, excelName, frameOptions, selection } = event.data.pluginMessage || {};

      if (type === FIGMA_EVENT.START_EXPORT) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');
        worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
        const headers = ['image', 'text', ...new Set(settingsRef.current.map((x) => x.value + '(' + x.label + ')'))];
        worksheet.properties.defaultRowHeight = 30;
        worksheet.columns = [
          { header: 'frameId', key: 'frameId', width: 20, hidden: true },
          { header: 'frame', key: 'frame', width: 20 },
          ...headers.map((x) => ({
            header: x,
            key: x,
            width: 40,
          })),
        ];

        let rows = 1;
        for (const { data, bytes, frameName, aspectRatio, frameId } of dataSource) {
          const dataRows = data.length;

          // TODO: 空 Frame 进行更细致处理
          if (dataRows === 0) {
            // 跳过空 Frame
            continue;
          }

          data.forEach((x: any, index: number) => {
            if (index === 0) {
              worksheet.addRow({ text: x, frame: frameName, frameId });
            } else {
              worksheet.addRow({ text: x });
            }
          });
          const base64 = btoa(
            new Uint8Array(bytes).reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, '')
          );
          const logo = workbook.addImage({
            base64: base64,
            extension: 'png',
          });

          worksheet.mergeCells(`A${rows + 1}:A${dataRows + rows}`);
          worksheet.mergeCells(`B${rows + 1}:B${dataRows + rows}`);
          worksheet.mergeCells(`C${rows + 1}:C${dataRows + rows}`);

          let maxHeight = 40 * dataRows;
          let height = Math.min(240, maxHeight);
          let width = 40 * 8;
          if (aspectRatio < 1) {
            width = height * aspectRatio;
          } else {
            height = width / aspectRatio;

            // 高度不足时进行缩放
            const heightRatio = maxHeight / height;
            if (heightRatio < 1) {
              height = heightRatio * height;
              width = height * aspectRatio;
            }
          }

          worksheet.addImage(logo, {
            tl: { col: 2, row: rows },
            // tl: { col: 2.5, row: rows + dataRows / 2 - 1 },
            ext: { width, height },
            editAs: 'undefined',
          });
          rows += dataRows;
        }

        worksheet.eachRow({ includeEmpty: false }, function (row) {
          row.eachCell(function (cell) {
            cell.alignment = { vertical: 'top', wrapText: true };
          });
        });

        workbook.xlsx.writeBuffer().then(function (buffer) {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${excelName}.xlsx`);
          setLoading(false);
        });
      }

      if (type === FIGMA_EVENT.GET_FRAME_IDS) {
        setFrameOptions(frameOptions);
      }

      if (type === FIGMA_EVENT.DOCUMENT_CHANGE) {
        parent.postMessage({ pluginMessage: { type: USER_EVENT.GET_FRAME_IDS } }, '*');
      }

      if (type === FIGMA_EVENT.SELECTION_CHANGE) {
        parent.postMessage({ pluginMessage: { type: USER_EVENT.GET_CURRENT_SELECTION } }, '*');
      }

      if (type === FIGMA_EVENT.GET_CURRENT_SELECTION_IDS) {
        //  只识别最外层的 Frame
        setFrames(
          selection
            .filter(
              (x) =>
                x.parentType === NODE_TYPES.PAGE &&
                (x.type === NODE_TYPES.FRAME || x.type === NODE_TYPES.INSTANCE || x.type === NODE_TYPES.SECTION)
            )
            .map((y) => y.id)
        );
      }
    }
  }, []);

  return (
    <>
      <div className="overflow-auto h-full mb-4">
        <div className="flex flex-row items-center mb-6">
          <div className="arrow-left-icon" onClick={goHome}>
            <ArrowLeft />
          </div>
          <span>{i18n.t('Human Translate')}</span>
        </div>
        <div className="mb-4 w-full">
          <div className="mb-2 font-bold">{i18n.t('Select object')}</div>
          <CubeSelect
            className="w-full"
            placeholder={i18n.t('Select Frame')}
            showArrow
            mode="multiple"
            menuItemSelectedIcon={<MultiChecked className="w-4 color-[var(--figma-color-bg-brand)]" />}
            value={frames}
            onChange={(value) => {
              setFrames(value);
              // parent.postMessage({ pluginMessage: { selectedFrames: value, type: USER_EVENT.SET_MSG } }, '*');
              parent.postMessage(
                {
                  pluginMessage: {
                    selectedFrameIds: value,
                    type: USER_EVENT.CHANGE_CURRENT_SELECTION,
                  },
                },
                '*'
              );
            }}
          >
            {frameOptions?.map((x) => (
              <Select.Option value={x.value} key={x.value}>
                {x.label}
              </Select.Option>
            ))}
          </CubeSelect>
        </div>
        <div className="mb-4 w-full">
          <div className="mb-2 font-bold">{i18n.t('Translate to')}</div>
          <div className="flex-1 mr-2">
            {settings.map((targetLanguage, index) => (
              // 处理重复
              <div key={targetLanguage.id} className="flex">
                <CubeSelect
                  className="mb-2 w-full"
                  optionFilterProp="label"
                  value={targetLanguage?.value}
                  onChange={(value) => {
                    const label = LANGUAGES.find((x) => x.value === value)?.label;
                    const index = settings.findIndex((x) => x.id === targetLanguage.id);
                    settings[index].value = value;
                    settings[index].label = label;
                    setSettings([...settings]);
                    settingsRef.current = [...settings];
                  }}
                  options={LANGUAGES.map((x) => ({
                    ...x,
                    label: i18n.t(x.label),
                  }))}
                />

                <div
                  style={{ height: 30 }}
                  className={`ml-2 flex items-center justify-center px-1 mb-2 ${
                    settings.length === 1 ? 'cursor-not-allowed' : 'cursor-pointer delete-hover'
                  }`}
                >
                  <Delete
                    className="w-4 h-4 text-secondary"
                    onClick={() => {
                      if (settings.length === 1) {
                        return;
                      }
                      const index = settings.findIndex((x) => x.id === targetLanguage.id);
                      settings.splice(index, 1);
                      setSettings([...settings]);
                      settingsRef.current = [...settings];
                    }}
                  />
                </div>
              </div>
            ))}
            <Button
              className="w-full bg-[var(--figma-color-bg-hover)]"
              type="default"
              onClick={() => {
                const lastLanguageIndex = LANGUAGES.findIndex((x) => x.value === settings[settings.length - 1].value);
                const nextLanguage = LANGUAGES[(lastLanguageIndex + 1) % LANGUAGES.length];

                setSettings((pre) => [...pre, { ...nextLanguage, id: uuid() }]);
                settingsRef.current = [...settings, { ...nextLanguage, id: uuid() }];
              }}
            >
              + {i18n.t('Add Language')}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-2 bottom-4">
        <Button
          type="default"
          className="w-full"
          size="large"
          onClick={() => {
            setLoading(false);
            goHome();
          }}
        >
          {i18n.t('Cancel')}
        </Button>
        <Button
          type="primary"
          size="large"
          disabled={frames.length === 0}
          className={`w-full ${loading ? 'cursor-not-allowed' : ''}`}
          loading={loading}
          onClick={() => {
            if (loading) {
              return;
            }
            setLoading(true);
            startExport();
          }}
        >
          <span>{i18n.t('Export')}</span>
        </Button>
      </div>
    </>
  );
}
