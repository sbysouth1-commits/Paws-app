// Given a medication's daily dose times and today's "given" logs, works out
// what to show: overdue, next up, or done for the day. Assumes doses are
// given roughly in schedule order through the day — simple and good enough
// for the common case, without needing to match a specific log to a specific
// scheduled slot.
export function getMedicationStatus(medication, logsToday) {
  const times = [...(medication.times ?? [])].sort();
  if (times.length === 0) {
    return { label: 'No times set', tone: 'none' };
  }

  const givenToday = (logsToday ?? []).filter((l) => l.status === 'given').length;
  if (givenToday >= times.length) {
    return { label: 'Given today', tone: 'done' };
  }

  const now = new Date();
  const nextTime = times[givenToday];
  const [hour, minute] = nextTime.split(':').map(Number);
  const nextAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

  if (nextAt <= now) {
    return { label: `Overdue — ${formatTime(nextTime)}`, tone: 'overdue' };
  }
  return { label: `Next: ${formatTime(nextTime)}`, tone: 'upcoming' };
}

// "08:00" -> "8:00am"
export function formatTime(hhmm) {
  const [hour, minute] = hhmm.split(':').map(Number);
  const period = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')}${period}`;
}

export function isToday(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
