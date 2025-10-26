/**
 * Generates an ICS (iCalendar) file content for calendar export
 * Compatible with Google Calendar, Apple Calendar, Outlook, and other calendar apps
 */

interface ICSEventData {
  title: string;
  description?: string;
  location?: string;
  startDate: string | Date;
  endDate?: string | Date;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  organizer?: string;
  url?: string;
}

/**
 * Formats a date to ICS format: YYYYMMDDTHHmmssZ
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes special characters for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates a unique identifier for the calendar event
 */
function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@alignr.app`;
}

/**
 * Combines date string (YYYY-MM-DD) with time string (HH:MM) to create a Date object
 */
function parseDateTime(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr + 'T00:00:00');
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Generates ICS file content from event data
 */
export function generateICS(eventData: ICSEventData): string {
  const now = formatICSDate(new Date());
  const uid = generateUID();

  // Convert date and time strings to Date objects
  let startDate: Date;
  let endDate: Date;

  if (eventData.startDate instanceof Date) {
    startDate = eventData.startDate;
  } else if (eventData.startTime) {
    // Combine date string with time string
    startDate = parseDateTime(eventData.startDate, eventData.startTime);
  } else {
    startDate = new Date(eventData.startDate);
  }

  if (eventData.endDate instanceof Date) {
    endDate = eventData.endDate;
  } else if (eventData.endTime && typeof eventData.startDate === 'string') {
    // Combine date string with end time string
    endDate = parseDateTime(eventData.startDate, eventData.endTime);
  } else if (eventData.endDate) {
    endDate = new Date(eventData.endDate);
  } else {
    // Default to 1 hour after start
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  }

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alignr//Event Planning//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeICSText(eventData.title)}`,
  ];

  if (eventData.description) {
    lines.push(`DESCRIPTION:${escapeICSText(eventData.description)}`);
  }

  if (eventData.location) {
    lines.push(`LOCATION:${escapeICSText(eventData.location)}`);
  }

  if (eventData.organizer) {
    lines.push(`ORGANIZER;CN=${escapeICSText(eventData.organizer)}:mailto:noreply@alignr.app`);
  }

  if (eventData.url) {
    lines.push(`URL:${eventData.url}`);
  }

  lines.push(
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return lines.join('\r\n');
}

/**
 * Downloads an ICS file to the user's device
 */
export function downloadICS(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(link.href);
}

/**
 * Parses event description to extract date/time information
 * Expected format: "Monday, January 15, 2025 • 2:00 PM - 4:00 PM" or "Monday • 2:00 PM - 4:00 PM"
 */
export function parseEventDescription(description: string): { startDate: Date; endDate: Date } | null {
  // Extract time range (e.g., "2:00 PM - 4:00 PM")
  const timeMatch = description.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);

  if (!timeMatch) {
    return null;
  }

  const startTimeStr = timeMatch[1];
  const endTimeStr = timeMatch[2];

  // Try to extract full date
  const fullDateMatch = description.match(/([A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2},\s+\d{4})/);

  let baseDate: Date;

  if (fullDateMatch) {
    // Full date provided (e.g., "Monday, January 15, 2025")
    baseDate = new Date(fullDateMatch[1]);
  } else {
    // Only day of week provided (e.g., "Monday")
    const dayMatch = description.match(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/);
    if (dayMatch) {
      // Use next occurrence of that day
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDay = dayNames.indexOf(dayMatch[1]);
      baseDate = new Date();
      const currentDay = baseDate.getDay();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7; // If 0, use 7 (next week)
      baseDate.setDate(baseDate.getDate() + daysUntilTarget);
    } else {
      // Default to tomorrow
      baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 1);
    }
  }

  // Parse times and combine with date
  const parseTime = (timeStr: string, date: Date): Date => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return date;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };

  const startDate = parseTime(startTimeStr, new Date(baseDate));
  const endDate = parseTime(endTimeStr, new Date(baseDate));

  return { startDate, endDate };
}
