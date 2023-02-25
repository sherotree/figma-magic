import { message } from 'antd';

// ykekdyku@outlook.com----fsehyTBvMA9----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
export async function chat(question) {
  const url = 'https://api.openai.com/v1/completions';
  // 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
  const authorization = 'Bearer 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';
  const data = {
    model: 'text-davinci-003',
    prompt: question,
    temperature: 0.4,
    max_tokens: 2048,
    top_p: 1,
    n: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: 'None',
    // stop: ['!', '?', '.'],
  };

  const res: any = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      authorization,
    },
  })
    .then((response) => response.json())
    .then((result) => result)
    .catch((error) => console.log('error', error));

  const text = res?.choices?.[0]?.text;
  const error = res?.error?.message;

  if (error) {
    message.error(res?.error?.message);
  }

  return text;
}
