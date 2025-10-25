import { useMemo } from 'react';
import type { ParticipantAvailability } from '../types/availability';

interface AvailabilityHeatmapProps {
  availability: ParticipantAvailability[];
  dates: string[];
  startTime: string;
  endTime: string;
  intervalMinutes?: number;
}

export default function AvailabilityHeatmap({
  availability,
  dates,
  startTime,
  endTime,
  intervalMinutes = 30
}: AvailabilityHeatmapProps) {
  // Generate all time slots
  const timeSlots = useMemo(() => {
    const slots: { startTime: string; endTime: string }[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
      const nextMinutes = Math.min(currentMinutes + intervalMinutes, endMinutes);

      const startH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
      const startM = (currentMinutes % 60).toString().padStart(2, '0');
      const endH = Math.floor(nextMinutes / 60).toString().padStart(2, '0');
      const endM = (nextMinutes % 60).toString().padStart(2, '0');

      slots.push({
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`
      });

      currentMinutes = nextMinutes;
    }

    return slots;
  }, [startTime, endTime, intervalMinutes]);

  // Get available participants for a slot
  const getAvailableParticipants = (date: string, slotStart: string): string[] => {
    return availability
      .filter(participant =>
        participant.timeSlots.some(slot =>
          slot.date === date &&
          slot.startTime === slotStart &&
          slot.available
        )
      )
      .map(p => p.participantName);
  };

  // Get color based on availability count
  const getHeatmapColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100';
    const maxParticipants = availability.length;
    const intensity = count / maxParticipants;

    if (intensity >= 0.8) return 'bg-[#4a3d63]';
    if (intensity >= 0.6) return 'bg-[#6b5d85]';
    if (intensity >= 0.4) return 'bg-[#8c7da7]';
    if (intensity >= 0.2) return 'bg-[#ad9dc9]';
    return 'bg-[#cebdeb]';
  };

  if (availability.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E2F] mb-3">Participant Availability</h3>
        <p className="text-sm text-gray-500">No availability data yet</p>
      </div>
    );
  }

  const containerWidth = 60 + (dates.length * 40) + 24; // time column + (dates × date width) + padding

  return (
    <div className="bg-white rounded-lg border border-gray-200/50 shadow-sm p-3 inline-block" style={{ width: `${containerWidth}px` }}>
      <div className="mb-2">
        <h3 className="text-base font-bold text-[#1E1E2F] mb-0.5">Availability Overview</h3>
        <p className="text-[10px] text-gray-600">
          {availability.length} {availability.length === 1 ? 'participant' : 'participants'}
        </p>
      </div>

      {/* Heatmap grid */}
      <div>
        <div>
          {/* Header row with dates */}
          <div className="grid mb-1" style={{ gridTemplateColumns: `60px repeat(${dates.length}, 40px)` }}>
            <div className="h-10"></div>
            {dates.map((date, i) => {
              const dateObj = new Date(date + 'T00:00:00');
              return (
                <div key={i} className="h-10 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-[9px] font-medium text-gray-500 uppercase leading-none">
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-xs font-bold text-gray-700 leading-none">
                    {dateObj.toLocaleDateString('en-US', { day: 'numeric' })}
                  </span>
                  <span className="text-[9px] font-medium text-gray-500 uppercase leading-none">
                    {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time slot rows */}
          {timeSlots.map((slot, timeIndex) => (
            <div key={timeIndex} className="grid" style={{ gridTemplateColumns: `60px repeat(${dates.length}, 40px)` }}>
              {/* Time label */}
              <div className="h-6 flex items-center pr-2">
                <span className="text-xs text-gray-700 font-medium">
                  {slot.startTime}
                </span>
              </div>

              {/* Availability cells */}
              {dates.map((date, dateIndex) => {
                const availableNames = getAvailableParticipants(date, slot.startTime);
                const count = availableNames.length;
                const colorClass = getHeatmapColor(count);
                const tooltipText = count > 0
                  ? `Available (${count}/${availability.length}):\n${availableNames.join(', ')}`
                  : 'No one available';

                return (
                  <div
                    key={dateIndex}
                    className={`h-6 border border-gray-200 flex items-center justify-center cursor-pointer hover:ring-1 hover:ring-[#7B61FF] transition-all relative group ${colorClass}`}
                    title={tooltipText}
                  >
                    {count > 0 && (
                      <span className="text-[10px] font-semibold text-white">
                        {count}
                      </span>
                    )}
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#1E1E2F] text-white text-[10px] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 pointer-events-none">
                      {count > 0 ? (
                        <div>
                          <div className="font-semibold mb-0.5">Available ({count}/{availability.length}):</div>
                          <div>{availableNames.join(', ')}</div>
                        </div>
                      ) : (
                        'No one available'
                      )}
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="border-[3px] border-transparent border-t-[#1E1E2F]"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
