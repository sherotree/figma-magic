import { useState } from 'react';
import { ReactComponent as ExportCSVIcon } from '../assets/export-xlsx.svg';
import { ReactComponent as ImportCSVIcon } from '../assets/import-xlsx.svg';
import { ImportCSV } from './ImportCSV';
import { ExportCSV } from './ExportCSV';
import { USER_EVENT, STORAGE } from '../main';
import * as ExcelJS from 'exceljs';
import i18n from 'i18next';

enum Page {
  Home = 'Home',
  Export = 'Export',
  Import = 'Import',
}

interface IProps {
  defaultSetting: any;
}

export function HumanTranslate(props: IProps) {
  const { defaultSetting } = props;
  const [page, setPage] = useState(Page.Home);
  const [file, setFile] = useState<File>();

  const fileReader = new FileReader();

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    setFile(file);

    if (file) {
      fileReader.onload = async function () {
        const workbook = new ExcelJS.Workbook();
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = () => {
          const buffer = reader.result as ArrayBuffer;
          let res = {};
          let columns: ExcelJS.CellValue[] = [];

          workbook.xlsx.load(buffer).then((workbook) => {
            workbook.eachSheet((sheet) => {
              sheet.eachRow((row, rowIndex) => {
                const frameId = row.getCell(1).value as string;
                if (!frameId) {
                  return;
                }

                const id = row.getCell(4).value as string;
                if (rowIndex === 1) {
                  columns = row.values as ExcelJS.CellValue[];
                  return;
                }

                columns.forEach((k, index) => {
                  const cellValue = row.getCell(index).value as string;
                  if (k === 'frameId') {
                    if (!res[frameId]) {
                      res[frameId] = {};
                    }
                    return;
                  }
                  if (k === 'image' || k === 'frame') {
                    return;
                  }
                  if (k === 'text') {
                    if (!res[frameId]) {
                      return;
                    }
                    if (!res[frameId][id]) {
                      res[frameId][id] = {};
                    }
                    return;
                  }
                  const key = k.toString().split('(')?.[0]; // en(English) -> en

                  if (res[frameId] && res[frameId][id]) {
                    res[frameId][id][key] = cellValue;
                  }
                });
              });

              parent.postMessage(
                {
                  pluginMessage: {
                    [STORAGE.humanLanguageSource]: res,
                    type: USER_EVENT.SET_MSG,
                  },
                },
                '*'
              );
            });
          });
        };
      };

      fileReader.onloadend = function () {
        setPage(Page.Import);
      };

      fileReader.readAsText(file);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const goHome = () => setPage(Page.Home);

  return (
    <div className="human-translate">
      {page === Page.Home && (
        <div>
          <div className="box mt-6" onClick={() => setPage(Page.Export)}>
            <ExportCSVIcon className="text-primary" />
            <div className="mt-2 font-bold">{i18n.t('Export as an xlsx file')}</div>
            <div className="mt-1 text-center text-secondary">
              {i18n.t('Export the selected Frame as an xlsx file and send it to the translator')}
            </div>
          </div>
          <div className="box mt-2 relative">
            <ImportCSVIcon className="text-primary" />
            <div className="mt-2 font-bold">{i18n.t('Import xlsx file')}</div>
            <div className="mt-1 text-center text-secondary">
              {i18n.t('Upload the translated xlsx file and Output the translation result directly')}
            </div>
            <input
              type="file"
              id="csvFileInput"
              title={null}
              accept=".xlsx"
              onChange={handleOnChange}
              className="absolute opacity-0 w-full h-full cursor-pointer"
            />
          </div>
        </div>
      )}

      {page === Page.Export && <ExportCSV goHome={goHome} defaultSetting={defaultSetting} />}
      {page === Page.Import && (
        <ImportCSV removeFile={removeFile} goHome={goHome} handleOnChange={handleOnChange} file={file} />
      )}
    </div>
  );
}
