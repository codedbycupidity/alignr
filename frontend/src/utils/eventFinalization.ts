import type { Block, TimeBlock } from '../types/block';

/**
 * Check if an event should be finalized based on its time block
 * Events are finalized when the event date has completely passed (end of day)
 */
export function shouldFinalizeEvent(blocks: Block[]): boolean {
  // Find the time block with a fixed date
  const timeBlock = blocks.find(
    (block): block is TimeBlock => block.type === 'time'
  );

  if (!timeBlock) {
    return false; // No time block, cannot determine if event should be finalized
  }

  const { content } = timeBlock;

  // Check if it's a fixed date/time
  if (content.mode === 'fixed' && content.fixedDate) {
    const eventDate = new Date(content.fixedDate);

    // Set to end of day for the event date
    eventDate.setHours(23, 59, 59, 999);

    const now = new Date();

    // Event should be finalized if the entire day has passed
    return now > eventDate;
  }

  // For availability or voting mode, check if any selected date has passed
  if (content.mode === 'availability' && content.selectedDates && content.selectedDates.length > 0) {
    // Find the latest date
    const latestDate = content.selectedDates
      .map(dateStr => new Date(dateStr))
      .reduce((latest, current) => current > latest ? current : latest);

    // Set to end of day
    latestDate.setHours(23, 59, 59, 999);

    const now = new Date();

    // Finalize if all dates have passed
    return now > latestDate;
  }

  // For voting mode with options
  if (content.mode === 'voting' && content.options && content.options.length > 0) {
    // Find the latest date from options
    const latestDate = content.options
      .map(option => new Date(option.date))
      .reduce((latest, current) => current > latest ? current : latest);

    // Set to end of day
    latestDate.setHours(23, 59, 59, 999);

    const now = new Date();

    // Finalize if all option dates have passed
    return now > latestDate;
  }

  return false;
}

/**
 * Get a human-readable reason for why an event should be finalized
 */
export function getFinalizationReason(blocks: Block[]): string | null {
  const timeBlock = blocks.find(
    (block): block is TimeBlock => block.type === 'time'
  );

  if (!timeBlock) return null;

  const { content } = timeBlock;

  if (content.mode === 'fixed' && content.fixedDate) {
    const eventDate = new Date(content.fixedDate);
    return `Event date (${eventDate.toLocaleDateString()}) has passed`;
  }

  if (content.mode === 'availability' && content.selectedDates && content.selectedDates.length > 0) {
    const latestDate = content.selectedDates
      .map(dateStr => new Date(dateStr))
      .reduce((latest, current) => current > latest ? current : latest);
    return `Last available date (${latestDate.toLocaleDateString()}) has passed`;
  }

  if (content.mode === 'voting' && content.options && content.options.length > 0) {
    const latestDate = content.options
      .map(option => new Date(option.date))
      .reduce((latest, current) => current > latest ? current : latest);
    return `Last voting option date (${latestDate.toLocaleDateString()}) has passed`;
  }

  return null;
}
