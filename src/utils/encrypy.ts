import CryptoJS from 'crypto-js';
export const encrypt = (word: string) => {
  const keyStr = 'ReBfA5PbgUeWE88o';
  const ivStr = 'ABCDEFGHIJKLMNOP';
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const iv = CryptoJS.enc.Utf8.parse(ivStr);
  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
};

export const authKey = () => {
  let temp = window.returnCitySN;
  const comKey = temp['cip'] + '|66a9ae13-9856-4d17-9c8c-4444a9260c62d';
  const sendKey = encrypt(comKey);
  let authKeys = encodeURIComponent(sendKey);
  return authKeys;
};
