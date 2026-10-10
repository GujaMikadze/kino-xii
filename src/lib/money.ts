export const money = (n: number) => `₾${Number.isInteger(n) ? n : n.toFixed(2)}`;

// ბილეთის ფასი = სეანსის ფასი × priceRatio (ratio /filter-options-იდან მოდის)
export const ticketPrice = (base: number, ratio: number) =>
  Math.round(base * ratio * 100) / 100;