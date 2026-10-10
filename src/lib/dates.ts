const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const REFUND_CUTOFF_MINUTES = 120; // only used for the label text
const pad = (n: number) => String(n).padStart(2, "0");

// "2026-09-15" -> "Tue 15 Sep"
export function formatDay(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[weekday]} ${d} ${MONTHS[m - 1]}`;
}

// "14:30, Tue 15 Sep"
export function refundDeadline(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const t = new Date(y, m - 1, d, hh, mm - REFUND_CUTOFF_MINUTES);
  return `${pad(t.getHours())}:${pad(t.getMinutes())}, ${DAYS[t.getDay()]} ${t.getDate()} ${MONTHS[t.getMonth()]}`;
}

export type Day = { iso: string; weekday: string; day: number };

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function nextDays(count: number): Day[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    return { iso: toISODate(d), weekday: DAYS[d.getDay()], day: d.getDate() };
  });
}

const LONG_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const LONG_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "2026-09-15" -> "Tuesday 15 September"
export function formatLong(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${LONG_DAYS[weekday]} ${d} ${LONG_MONTHS[m - 1]}`;
}

// "2026-09-04" -> "4 September 2026"
export function formatLongDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${LONG_MONTHS[m - 1]} ${y}`;
}