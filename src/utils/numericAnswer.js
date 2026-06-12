/** 数字题正确答案最大输入长度。 */
export const NUMERIC_ANSWER_MAX_LENGTH = 16;

/**
 * 校验并清洗数字题答案输入。
 * 仅允许数字、首位负号、单个小数点，最长 16 位。
 * @param {string|number|null|undefined} raw 原始输入
 * @param {number} [maxLength=16] 最大长度
 * @returns {string}
 */
export function sanitizeNumericAnswerInput(raw, maxLength = NUMERIC_ANSWER_MAX_LENGTH) {
  const input = String(raw ?? "");
  let result = "";
  let hasDot = false;

  for (let i = 0; i < input.length && result.length < maxLength; i += 1) {
    const ch = input[i];

    if (ch >= "0" && ch <= "9") {
      result += ch;
      continue;
    }

    if (ch === "-" && result.length === 0) {
      result += ch;
      continue;
    }

    if (ch === "." && !hasDot) {
      hasDot = true;
      result += ch;
    }
  }

  return result;
}
