// Utility to retrieve today's matches from the IPL 2026 schedule

const IPL_2026_SCHEDULE = require('../../data/ipl_2026_schedule');

/**
 * Returns the current date string in YYYY-MM-DD format using IST (UTC+5:30).
 */
function getTodayIST() {
  // Date.now() always returns UTC milliseconds; add IST offset to get IST time
  const istOffset = 5.5 * 60 * 60 * 1000; // 5h30m in ms
  const istDate = new Date(Date.now() + istOffset);
  return istDate.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Returns all matches scheduled for today (IST).
 * If no matches are scheduled today, returns the next upcoming match instead.
 *
 * @returns {{ matches: Array, isToday: boolean, nextMatchDate: string|null }}
 */
function getTodaysMatches() {
  const today = getTodayIST();

  const todaysMatches = IPL_2026_SCHEDULE.filter(
    (m) => m.date === today && !m.team1.startsWith('TBD') && !m.team2.startsWith('TBD')
  );

  if (todaysMatches.length > 0) {
    return { matches: todaysMatches, isToday: true, nextMatchDate: null };
  }

  // No matches today — find the next upcoming match
  const upcoming = IPL_2026_SCHEDULE.filter(
    (m) => m.date > today && !m.team1.startsWith('TBD') && !m.team2.startsWith('TBD')
  );

  if (upcoming.length > 0) {
    const nextDate = upcoming[0].date;
    const nextMatches = upcoming.filter((m) => m.date === nextDate);
    return { matches: nextMatches, isToday: false, nextMatchDate: nextDate };
  }

  return { matches: [], isToday: false, nextMatchDate: null };
}

/**
 * Formats a YYYY-MM-DD string into a human-readable date like "04 Apr 2026".
 */
function formatDate(dateStr) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`;
}

/**
 * Converts a 24-hour time string (HH:MM) to 12-hour format with AM/PM.
 */
function formatTime(timeStr) {
  const [hour, minute] = timeStr.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${period} IST`;
}

module.exports = { getTodaysMatches, getTodayIST, formatDate, formatTime };
