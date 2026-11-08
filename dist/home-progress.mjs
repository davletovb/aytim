export const xpPerActivity = 10;
export const goals = { minutes: 10, lessons: 3, days: 3, recalled: 10 };

function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

function shiftDay(date, days) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

export function recordActivity(course, { seconds, lessonId, recalled = [] }, now = Date.now()) {
  const key = dateKey(new Date(now));
  const days = course.activityDays ??= {};
  const entry = days[key] ??= { seconds: 0, sessions: 0, lessons: [], recalled: [] };
  entry.seconds += seconds;
  entry.sessions++;
  // Each day's unique items are only needed up to the weekly goal.
  if (lessonId && entry.lessons.length < goals.lessons && !entry.lessons.includes(lessonId)) {
    entry.lessons.push(lessonId);
  }
  entry.recalled = [...new Set([...entry.recalled, ...recalled])].slice(0, goals.recalled);
}

export function activitySummary(course, now = Date.now()) {
  const date = new Date(now);
  const entries = course.activityDays ?? {};
  const key = dateKey(date);
  const today = entries[key] ?? { seconds: 0, sessions: 0 };
  const monday = shiftDay(date, -((date.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, index) => {
    const weekday = shiftDay(monday, index);
    const day = dateKey(weekday);
    return { date: weekday, key: day, isToday: day === key, activity: entries[day] };
  });
  const practiced = week.flatMap(({ activity }) => activity?.sessions ? [activity] : []);
  let cursor = today.sessions ? date : shiftDay(date, -1);
  let streak = 0;
  while (entries[dateKey(cursor)]?.sessions) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return {
    date,
    key,
    today,
    week,
    streak,
    xp: xpPerActivity * Object.values(entries).reduce((total, entry) => total + entry.sessions, 0),
    wins: {
      lessons: new Set(practiced.flatMap(entry => entry.lessons)).size,
      days: practiced.length,
      recalled: new Set(practiced.flatMap(entry => entry.recalled)).size
    }
  };
}
