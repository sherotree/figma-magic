import { useState, useEffect, useRef } from 'react';
import { Select, Button } from 'antd';
import { TransScope, USER_EVENT, FIGMA_EVENT } from '../main';
import { CubeSelect } from '../components/CubeSelect';
import { ReactComponent as Sheet } from '../assets/sheet.svg';
import { ReactComponent as ArrowLeft } from '../assets/arrow_left.svg';
import { ReactComponent as CloseIcon } from '../assets/close.svg';
import i18n from 'i18next';

interface IProps {
  handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  goHome: () => void;
  removeFile: () => void;
  file: File;
}

export function ImportCSV(props: IProps) {
  const { handleOnChange, file, goHome, removeFile } = props;
  const [scope, setScope] = useState<TransScope>(TransScope.SelectedObject);
  const [loading, setLoading] = useState(false);
  const changeTimeRef = useRef<number>(Infinity);
  const scopeOptions = Object.values(TransScope).slice(0, 1);

  const startTranslate = () => {
    changeTimeRef.current = Infinity;
    parent.postMessage({ pluginMessage: { scope, type: USER_EVENT.START_HUMAN_TRANSLATE } }, '*');
  };

  useEffect(() => {
    window.addEventListener('message', fn);
    return () => window.removeEventListener('message', fn);

    function fn(event) {
      const { type } = event.data.pluginMessage || {};

      if (type === FIGMA_EVENT.NODE_CHANGED) {
        setLoading(true);
        changeTimeRef.current = new Date().getTime();
      }
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - changeTimeRef.current;

      if (diff > 500) {
        setLoading(false);
      }
    }, 500);
    return () => clearInterval(id);
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
          {file?.name ? (
            <div style={{ position: 'relative', height: 48 }}>
              <div className="upload">
                <Sheet className="w-8 h-8" />
                <span className="mx-4 flex-1">{file?.name || i18n.t('Import xlsx file')}</span>
                <div className="arrow-left-icon" onClick={removeFile}>
                  <CloseIcon className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <input
                type="file"
                id="csvFileInput"
                style={{ left: 52, right: 52 }}
                accept=".xlsx"
                onChange={handleOnChange}
                className="absolute opacity-0 h-full cursor-pointer"
              />
            </div>
          ) : (
            <div style={{ position: 'relative', height: 48 }}>
              <Button type="default" size="large" className="w-full">
                + {i18n.t('Import xlsx file')}
              </Button>
              <input
                type="file"
                id="csvFileInput"
                style={{ left: 4, right: 4 }}
                accept=".xlsx"
                onChange={handleOnChange}
                className="absolute opacity-0 h-full cursor-pointer"
              />
            </div>
          )}
        </div>
        <div className="mb-4 w-full">
          <div className="mb-2 font-bold">{i18n.t('Select object')}</div>
          <CubeSelect
            className="w-full"
            value={scope}
            onChange={(value) => {
              setScope(value as TransScope);
            }}
          >
            {scopeOptions.map((x) => (
              <Select.Option value={x} key={x}>
                {i18n.t(x)}
              </Select.Option>
            ))}
          </CubeSelect>
        </div>
      </div>

      <div className="flex flex-row gap-2 bottom-4">
        <Button
          className="w-full"
          type="default"
          size="large"
          onClick={() => {
            setLoading(false);
            goHome();
          }}
        >
          {i18n.t('Cancel')}
        </Button>
        <Button
          disabled={!file?.name}
          className={`brand w-full ${loading ? 'cursor-not-allowed' : ''}`}
          loading={loading}
          size="large"
          type="primary"
          onClick={() => {
            if (loading) {
              return;
            }
            startTranslate();
          }}
        >
          <span>{i18n.t('Translate')}</span>
        </Button>
      </div>
    </>
  );
}
