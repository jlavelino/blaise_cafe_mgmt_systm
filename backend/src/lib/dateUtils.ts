/**
 * Date and timezone utilities for Blaise Café (Asia/Manila timezone, UTC+8)
 * Ensures consistent day bounds and hourly aggregation regardless of server timezone (e.g. Render UTC).
 */

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * Returns the current date formatted as "YYYY-MM-DD" in Asia/Manila (UTC+8)
 */
export function getManilaDateString(date: Date = new Date()): string {
  const manilaDate = new Date(date.getTime() + MANILA_OFFSET_MS);
  const year = manilaDate.getUTCFullYear();
  const month = String(manilaDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(manilaDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the start and end of day in Asia/Manila (UTC+8) as UTC Date objects
 * Start: YYYY-MM-DDT00:00:00.000+08:00 (16:00:00 UTC previous day)
 * End:   YYYY-MM-DDT23:59:59.999+08:00 (15:59:59.999 UTC current day)
 */
export function getManilaDayBounds(date: Date = new Date()): {
  startOfDay: Date;
  endOfDay: Date;
  dateStr: string;
} {
  const dateStr = getManilaDateString(date);
  const startOfDay = new Date(`${dateStr}T00:00:00.000+08:00`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999+08:00`);
  return { startOfDay, endOfDay, dateStr };
}

/**
 * Returns the hour of the day (0-23) in Asia/Manila (UTC+8)
 */
export function getManilaHour(date: Date): number {
  const manilaDate = new Date(date.getTime() + MANILA_OFFSET_MS);
  return manilaDate.getUTCHours();
}
