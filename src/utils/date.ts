const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
] as const;

const UZ_SHORT_MONTHS = [
  "yan",
  "fev",
  "mar",
  "apr",
  "may",
  "iyun",
  "iyul",
  "avg",
  "sen",
  "okt",
  "noy",
  "dek",
] as const;

export function formatUzDate(value: string | Date, compact = false) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const day = date.getDate();
  const month = compact
    ? UZ_SHORT_MONTHS[date.getMonth()]
    : UZ_MONTHS[date.getMonth()];

  return compact
    ? `${day} ${month}`
    : `${day} ${month} ${date.getFullYear()}`;
}
