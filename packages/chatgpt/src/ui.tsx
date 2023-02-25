import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';
import { getFormatDate } from './utils';
import './base.css';
import { useEffect, useState } from 'react';
import { Input, Button, Typography, Tabs, Spin, Select, Skeleton } from 'antd';
import { chat } from './chat';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;
const DAILY_LIMIT = 20;
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh-CHS', label: 'Chinese (Simplified)' },
  { value: 'zh-CHT', label: 'Chinese (Traditional)' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
  { value: 'id', label: 'Indonesian' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'es', label: 'Spanish' },
  { value: 'th', label: 'Thai' },
  { value: 'vi', label: 'Vietnamese' },
];

const PROMPTS = [
  { label: 'Make shorter', value: 'Make shorter this text:' },
  { label: 'Make longer', value: 'Make longer text:' },
  { label: 'Funnier', value: 'Make funnier this text:' },
  { label: 'Casual', value: 'Make casual this text:' },
  { label: 'Formal', value: 'Make more formal this text:' },
  { label: 'Fix spelling', value: 'Fix spelling of this text:' },
  { label: 'Improve', value: 'Improve writing of this text:' },
  { label: 'To Emojis', value: 'Convert to emojis. text:' },
];

const FunnyPrompt = ({ setFunnyPromptResult, setLoading, hasSelectionText, funnyPromptText }) => (
  <>
    <div className="mb-3 font-bold">FunnyPrompt</div>
    <div className="flex flex-wrap gap-2">
      {PROMPTS.map((x) => (
        <Button
          ghost
          disabled={!hasSelectionText}
          key={x.value}
          type="primary"
          onClick={async () => {
            setLoading(true);
            const res = await chat(`${x.value} ${funnyPromptText}`);
            parent.postMessage({ pluginMessage: { text: res, type: 'USER_EVENT_GET_RESULT' } }, '*');
            setLoading(false);
            setFunnyPromptResult(res);
          }}
        >
          {x.label}
        </Button>
      ))}
    </div>
  </>
);

const AskQuestion = ({ text, setText }) => (
  <>
    <div className="mb-3 font-bold">Question</div>
    <TextArea
      placeholder="Write down your question."
      rows={4}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
      }}
    />
  </>
);

const Translate = ({ text, setText, lang, setLang }) => (
  <>
    <div className="mb-3 font-bold">Text</div>
    <TextArea
      placeholder="Write down what you need to translate."
      rows={4}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
      }}
    />
    <div className="my-3 font-bold">Translate to</div>
    <Select
      className="w-full"
      optionFilterProp="label"
      value={lang?.value}
      onChange={(value) => {
        const label = LANGUAGES.find((x) => x.value === value)?.label;
        setLang({ value, label });
      }}
      options={LANGUAGES}
    />
  </>
);

function UI() {
  const [questionText, setQuestionText] = useState<string>();
  const [translateText, setTranslateText] = useState<string>();
  const [funnyPromptText, setFunnyPromptText] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [questionResult, setQuestionResult] = useState();
  const [translateResult, setTranslateResult] = useState();
  const [funnyPromptResult, setFunnyPromptResult] = useState();
  const [activeKey, setActiveKey] = useState('0');
  const [limitCount, setLimitCount] = useState(Infinity);
  const [hasSelectionText, setHasSelectionText] = useState(false);

  const isAskQuestion = activeKey === '1';
  const result = [funnyPromptResult, questionResult, translateResult][activeKey];
  const text = isAskQuestion ? questionText : `translate to ${lang.label}: ${translateText}`;
  const isExceedLimit = limitCount > DAILY_LIMIT;

  const items = [
    {
      key: '0',
      label: 'Funny Prompt',
      children: (
        <FunnyPrompt
          setFunnyPromptResult={setFunnyPromptResult}
          funnyPromptText={funnyPromptText}
          setLoading={setLoading}
          hasSelectionText={hasSelectionText}
        />
      ),
    },
    {
      key: '1',
      label: 'Ask Question',
      children: <AskQuestion text={questionText} setText={setQuestionText} />,
    },
    {
      key: '2',
      label: 'Translate',
      children: <Translate setLang={setLang} lang={lang} text={translateText} setText={setTranslateText} />,
    },
  ];

  useEffect(() => {
    // 同步缓存的默认设置
    parent.postMessage({ pluginMessage: { type: 'USER_EVENT_GET_MSG' } }, '*');
    parent.postMessage({ pluginMessage: { type: 'USER_EVENT_GET_SELECTION' } }, '*');

    window.addEventListener('message', fn);
    return () => window.removeEventListener('message', fn);

    function fn(event) {
      const { type, msg, text, count } = (event.data.pluginMessage || {}) as any;

      if (type === 'FIGMA_EVENT_GET_MSG') {
        const date = getFormatDate(new Date());
        const limitCount = msg?.limit?.[date] ?? 0;
        setLimitCount(limitCount);
      }
      if (type === 'FIGMA_EVENT_GET_CURRENT_SELECTION_TEXT') {
        console.log(text, count);
        setHasSelectionText(count > 0);
        setFunnyPromptText(text);
      }
    }
  }, []);

  return (
    <Spin spinning={loading} size="large" tip="Loading" className="h-full">
      <div className="flex justify-between flex-col h-full px-4">
        <div>
          <Tabs
            activeKey={activeKey}
            items={items}
            onChange={(key) => {
              setActiveKey(key);
            }}
          />

          <div>
            <div className="my-3 font-bold">Result</div>
            {!loading && !!result ? (
              <Paragraph
                style={{ maxHeight: 240, overflow: 'auto' }}
                copyable={{ text: result }}
                ellipsis={{ rows: 10, expandable: true }}
              >
                {result}
              </Paragraph>
            ) : (
              <Skeleton paragraph={{ rows: 5 }} />
            )}
          </div>
        </div>

        <div className="my-4">
          {activeKey !== '0' && (
            <Button
              disabled={isExceedLimit}
              className="w-full"
              size="large"
              loading={loading}
              type="primary"
              onClick={async () => {
                setLoading(true);
                const res = await chat(text);
                parent.postMessage({ pluginMessage: { text: res, type: 'USER_EVENT_GET_RESULT' } }, '*');
                setLoading(false);
                if (isAskQuestion) {
                  setQuestionResult(res);
                } else {
                  setTranslateResult(res);
                }
              }}
            >
              Get Result
            </Button>
          )}
          {isExceedLimit && (
            <div className="mt-2">
              <Text type="secondary">Can only be used 20 times a day, please try again tomorrow.</Text>
            </div>
          )}
        </div>
      </div>
    </Spin>
  );
}

const root = createRoot(document.getElementById('chat-gpt'));

root.render(<UI />);
