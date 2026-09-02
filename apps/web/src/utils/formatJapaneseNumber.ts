const japaneseDigits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

export function formatJapaneseNumber(value: number) {
  if (value < 0 || value > 99 || !Number.isInteger(value)) {
    return String(value);
  }

  if (value < 10) return japaneseDigits[value];

  const tens = Math.floor(value / 10);
  const ones = value % 10;
  const tensText = tens === 1 ? "十" : `${japaneseDigits[tens]}十`;

  return ones === 0 ? tensText : `${tensText}${japaneseDigits[ones]}`;
}
