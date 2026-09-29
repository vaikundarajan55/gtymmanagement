// Calendar links for booked class sessions. Times are the gym's local time (Asia/Kolkata).
const TZ = 'Asia/Kolkata';
const pad = (n) => String(n).padStart(2, '0');

// "2026-10-05" + "6:30 PM" → local Date
export const sessionStart = (date, slot) => {
  const [y, m, d] = date.split('-').map(Number);
  const t = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(slot || '');
  const h = t ? (+t[1] % 12) + (t[3].toUpperCase() === 'PM' ? 12 : 0) : 0;
  return new Date(y, m - 1, d, h, t ? +t[2] : 0);
};

const stamp = (dt) => `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
const range = (s) => {
  const start = sessionStart(s.date, s.time);
  const end = new Date(start.getTime() + (s.durationMin || 60) * 60000);
  return [stamp(start), stamp(end)];
};

export const googleCalendarUrl = (s) => {
  const [start, end] = range(s);
  const params = new URLSearchParams({ action: 'TEMPLATE', text: s.title, dates: `${start}/${end}`, ctz: TZ, details: s.details, location: s.location });
  return `https://calendar.google.com/calendar/render?${params}`;
};

// RFC 5545 text escaping
const esc = (v = '') => String(v).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

export const icsFile = (sessions, uidPrefix) => {
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GymPro//Class Booking//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE', `TZID:${TZ}`, 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0530', 'TZOFFSETTO:+0530', 'TZNAME:IST', 'END:STANDARD', 'END:VTIMEZONE',
  ];
  sessions.forEach((s, i) => {
    const [start, end] = range(s);
    lines.push(
      'BEGIN:VEVENT', `UID:${uidPrefix}-${i + 1}@gympro`, `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=${TZ}:${start}`, `DTEND;TZID=${TZ}:${end}`,
      `SUMMARY:${esc(s.title)}`, `DESCRIPTION:${esc(s.details)}`, `LOCATION:${esc(s.location)}`,
      'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', `DESCRIPTION:${esc(s.title)} in 1 hour`, 'END:VALARM',
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

export const downloadIcs = (sessions, uidPrefix, filename) => {
  const blob = new Blob([icsFile(sessions, uidPrefix)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
