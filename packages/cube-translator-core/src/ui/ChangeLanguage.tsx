import i18n from 'i18next';
import { USER_EVENT } from '../main';
import { CubeSelect } from '../components/CubeSelect';

const LANGUAGES = [
  {
    label: 'English',
    value: 'en',
  },
  {
    label: '中文',
    value: 'zh',
  },
  {
    label: '日本語',
    value: 'ja',
  },
];

interface IProps {
  forceUpdate: () => void;
}

export function ChangeLanguage(props: IProps) {
  const { forceUpdate } = props;

  return (
    <div className="mb-4 w-full">
      <div className="mb-2 font-bold">{i18n.t('Language settings')}</div>
      <CubeSelect
        className="w-full"
        defaultValue={i18n.language}
        onChange={(value) => {
          i18n.changeLanguage(value);
          parent.postMessage({ pluginMessage: { type: USER_EVENT.SET_MSG, userLanguage: value } }, '*');
          forceUpdate();
        }}
        options={LANGUAGES}
      />
    </div>
  );
}
