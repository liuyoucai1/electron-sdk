/**
 * 判断已设置答案是否有效（非空）。
 * @param {{ type?: string, value?: unknown }|unknown} savedAnswer
 * @returns {boolean}
 */
export function hasDistributionAnswer(savedAnswer) {
  if (!savedAnswer) {
    return false;
  }

  if (typeof savedAnswer === "object" && savedAnswer !== null && "value" in savedAnswer) {
    const { value } = savedAnswer;
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== "" && value != null;
  }

  if (Array.isArray(savedAnswer)) {
    return savedAnswer.length > 0;
  }

  return savedAnswer !== "" && savedAnswer != null;
}

/**
 * 判断分布项标签是否与正确答案一致。
 * @param {{ type?: string, value?: unknown }|unknown} savedAnswer
 * @param {string} optionLabel
 * @returns {boolean}
 */
export function isDistributionOptionCorrect(savedAnswer, optionLabel) {
  if (!savedAnswer) {
    return false;
  }

  const type =
    typeof savedAnswer === "object" && savedAnswer !== null && "type" in savedAnswer
      ? savedAnswer.type
      : "single";
  const value =
    typeof savedAnswer === "object" && savedAnswer !== null && "value" in savedAnswer
      ? savedAnswer.value
      : savedAnswer;

  if (type === "single") {
    return optionLabel === value;
  }

  if (type === "multiple") {
    const correctKey = Array.isArray(value) ? [...value].sort().join("") : "";
    const optionKey = String(optionLabel)
      .split("")
      .filter((char) => /[A-Z]/.test(char))
      .sort()
      .join("");
    return optionKey === correctKey;
  }

  if (type === "judge") {
    const judgeLabel = value === "true" ? "✓" : "✕";
    return optionLabel === judgeLabel;
  }

  if (type === "numerical") {
    return String(optionLabel) === String(value);
  }

  return optionLabel === value;
}

/**
 * 获取分布项展示状态：default | correct | wrong | unanswered。
 * @param {{ type?: string, value?: unknown }|unknown|null} savedAnswer
 * @param {string} optionLabel
 * @returns {'default'|'correct'|'wrong'|'unanswered'}
 */
export function getDistributionOptionStatus(savedAnswer, optionLabel) {
  if (optionLabel === "未答") {
    return "unanswered";
  }

  if (!hasDistributionAnswer(savedAnswer)) {
    return "default";
  }

  return isDistributionOptionCorrect(savedAnswer, optionLabel) ? "correct" : "wrong";
}
