import { useState, useRef, useEffect, useMemo } from 'react';
import type { TimeSlot } from '../types/availability';

interface AvailabilityGridProps {
  dates: string[] | number[]; // YYYY-MM-DD format for specific dates, or 0-6 for days of week
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  intervalMinutes?: number;
  initialAvailability?: TimeSlot[]; // Pre-populate with existing availability
  onAvailabilityChange: (timeSlots: TimeSlot[]) => void;
  dateType?: 'specific' | 'days';
}

export default function AvailabilityGrid({
  dates,
  startTime,
  endTime,
  intervalMinutes = 30,
  initialAvailability,
  onAvailabilityChange,
  dateType = 'specific'
}: AvailabilityGridProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');
  const gridRef = useRef<HTMLDivElement>(null);
  const initialAppliedRef = useRef(false);

  // Convert days of week to day names for display
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Compute the date list based on dateType
  const dateList = useMemo(() => {
    return dateType === 'days'
      ? (dates as number[]).map(day => dayNames[day])
      : dates as string[];
  }, [dates, dateType]);

  // Generate empty time slots
  useEffect(() => {
    const newSlots: TimeSlot[] = [];

    for (const date of dateList) {
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

        newSlots.push({
          date,
          startTime: `${startH}:${startM}`,
          endTime: `${endH}:${endM}`,
          available: false
        });

        currentMinutes = nextMinutes;
      }
    }

    setSlots(newSlots);
    initialAppliedRef.current = false; // Reset when grid structure changes
  }, [dateList, startTime, endTime, intervalMinutes]);

  // Apply initial availability once when component mounts
  useEffect(() => {
    if (!initialAppliedRef.current && initialAvailability && initialAvailability.length > 0 && slots.length > 0) {
      console.log('Applying initial availability:', initialAvailability.length, 'slots');
      setSlots(prevSlots => {
        return prevSlots.map(slot => {
          const existingSlot = initialAvailability.find(
            s => s.date === slot.date && s.startTime === slot.startTime
          );
          return existingSlot ? { ...slot, available: existingSlot.available } : slot;
        });
      });
      initialAppliedRef.current = true;
    }
  }, [initialAvailability, slots.length]);

  // Notify parent of changes
  useEffect(() => {
    onAvailabilityChange(slots);
  }, [slots, onAvailabilityChange]);

  const toggleSlot = (index: number) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], available: !newSlots[index].available };
    setSlots(newSlots);
  };

  const handleMouseDown = (index: number) => {
    setIsDragging(true);
    setDragMode(slots[index].available ? 'deselect' : 'select');
    toggleSlot(index);
  };

  const handleMouseEnter = (index: number) => {
    if (isDragging) {
      const newSlots = [...slots];
      newSlots[index] = { ...newSlots[index], available: dragMode === 'select' };
      setSlots(newSlots);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Get unique time slots (from first date)
  const uniqueTimeSlots = useMemo(() => {
    const timeSlots: { startTime: string; endTime: string }[] = [];
    if (dateList.length > 0 && slots.length > 0) {
      const firstDateSlots = slots.filter(s => s.date === dateList[0]);
      firstDateSlots.forEach(slot => {
        timeSlots.push({ startTime: slot.startTime, endTime: slot.endTime });
      });
    }
    return timeSlots;
  }, [dateList, slots]);

  const formatDate = (dateStr: string) => {
    // For days mode, dateStr is already a day name like "Monday"
    if (dateType === 'days') {
      return dateStr;
    }
    // For specific dates, format as "Mon, Jan 1"
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (time: string) => {
    const [hour, min] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${min.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="text-xs text-gray-500 mb-2">
        Click and drag to mark your available times
      </div>
      <div
        ref={gridRef}
        className="inline-block min-w-full border border-gray-200 rounded-lg overflow-hidden"
        onMouseUp={handleMouseUp}
        style={{ userSelect: 'none' }}
      >
        {/* Header */}
        <div className="grid" style={{ gridTemplateColumns: `80px repeat(${dateList.length}, minmax(60px, 1fr))` }}>
          <div className="bg-gray-50 border-r border-b border-gray-200 px-2 py-1 font-semibold text-xs text-gray-700 sticky left-0 z-10">
            Time
          </div>
          {dateList.map(date => (
            <div
              key={date}
              className="bg-gray-50 border-r border-b border-gray-200 px-1 py-1 font-semibold text-xs text-gray-700 text-center"
            >
              {formatDate(date)}
            </div>
          ))}
        </div>

        {/* Time rows */}
        {uniqueTimeSlots.map((timeSlot, timeIndex) => (
          <div
            key={timeIndex}
            className="grid"
            style={{ gridTemplateColumns: `80px repeat(${dateList.length}, minmax(60px, 1fr))` }}
          >
            <div className="bg-gray-50 border-r border-b border-gray-200 px-2 py-1 text-xs text-gray-600 sticky left-0 z-10">
              {formatTime(timeSlot.startTime)}
            </div>
            {dateList.map((date) => {
              const slotIndex = slots.findIndex(
                s => s.date === date && s.startTime === timeSlot.startTime
              );
              const slot = slots[slotIndex];
              return (
                <div
                  key={`${date}-${timeSlot.startTime}`}
                  className={`border-r border-b border-gray-200 h-7 cursor-pointer transition-colors ${
                    slot?.available
                      ? 'bg-[#4a3d63] hover:bg-[#3a2f4f]'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onMouseDown={() => slotIndex >= 0 && handleMouseDown(slotIndex)}
                  onMouseEnter={() => slotIndex >= 0 && handleMouseEnter(slotIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
