type Formatted = string | number;
type FormatObject<U extends Formatted> = {
  [key: string]: U;
};
/**
 * 格式化字符串，用提供的值替换形如{name}的占位符。
 *
 * @param {string} str - 要格式化的字符串
 * @param {...(Formatted|FormatObject<Formatted>)} values - 用于占位符的值的数组
 * @return {string} 格式化后的字符串
 */
export function formatString<T extends Formatted>(
  str: string,
  ...values: Array<T | FormatObject<T>>
): string {
  const _len = values.length;
  let valuesForPlaceholders = Array(_len);
  for (let _key = 0; _key < _len; _key++) {
    valuesForPlaceholders[_key] = values[_key];
  }

  if (!str) {
    return "";
  }

  return str.replace(/{(.*?)}/g, (match, key: string) => {
    const numKey = Number(key);
    if (Number.isNaN(numKey)) {
      return valuesForPlaceholders[0][key] || match;
    }
    return valuesForPlaceholders[numKey] || match;
  });
}
