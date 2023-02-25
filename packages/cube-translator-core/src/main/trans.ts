// https://ai.youdao.com/product-fanyi-text.s
// zh-CHS
// @ts-nocheck @ts-ignore

var hash = require('hash.js');

const truncate = (q: string) => {
  const len = q.length;
  if (len <= 20) return q;
  return `${q.substring(0, 10)}${len}${q.substring(len - 10, len)}`;
};

export async function trans(q: string, from: string, to: string) {
  if (q?.trim() === '') return q; // 空字符串直接返回

  const appKey = '7145be645cd35681';
  const secretKey = 'BuXzREpSjNKVQvG09hNPlkDy7eJ8jInk';
  const salt = new Date().getTime() - Math.round(Math.random() * 10000); // TODO: 避免出现重复的值
  const curtime = Math.round(new Date().getTime() / 1000);
  const signStr = `${appKey}${truncate(q)}${salt}${curtime}${secretKey}`;
  const sign = hash.sha256().update(signStr).digest('hex');
  const params = {
    from,
    to,
    q: encodeURIComponent(q),
    appKey,
    salt: String(salt),
    curtime: String(curtime),
    signType: 'v3',
    sign: String(sign),
  };

  let query = '';
  Object.keys(params).forEach((k) => {
    if (query !== '') {
      query += '&';
    }
    query += `${k}=${params[k]}`;
  });

  const res = await fetch(`https://noah-rec-testing-outer.nie.netease.com/other/youdao?${query}`)
    .then((response) => response.text())
    .then((result) => result)
    .catch((error) => console.log('error', error));

  let translation = q;

  if (res) {
    const _res = JSON.parse(res);

    if (_res.errorCode === '0') {
      translation = _res?.translation?.[0];

      // 英文首字母转大写
      if (to === 'en') {
        translation = translation?.slice(0, 1)?.toUpperCase() + translation?.slice(1);
      }
    } else {
      translation = `${to}_${q}`;
    }
  }

  return translation ?? `trans_failed`;
}
