import { Calendar, Clock, Globe } from 'lucide-react';

interface FixedDateTimeDisplayProps {
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string;
}

export default function FixedDateTimeDisplay({ date, startTime, endTime, timezone }: FixedDateTimeDisplayProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime12Hour = (time24: string) => {
    const [hour, min] = time24.split(':').map(Number);
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${hour12}:${min.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="space-y-4">
      {/* Date */}
      <div className="bg-gradient-to-br from-[#75619D] to-[#624F8A] rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5" strokeWidth={2} />
          <h3 className="text-sm font-medium uppercase tracking-wide opacity-90">Date</h3>
        </div>
        <p className="text-2xl font-bold">{formatDate(date)}</p>
      </div>

      {/* Time */}
      <div className="bg-white border-2 border-[#75619D] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-[#75619D]" strokeWidth={2} />
          <h3 className="text-sm font-medium uppercase tracking-wide text-[#75619D]">Time</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Start</p>
            <p className="text-xl font-bold text-gray-900">{formatTime12Hour(startTime)}</p>
          </div>
          <div className="text-gray-300 text-2xl font-light">→</div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">End</p>
            <p className="text-xl font-bold text-gray-900">{formatTime12Hour(endTime)}</p>
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-600" strokeWidth={2} />
          <p className="text-sm text-gray-700">
            <span className="font-medium">Timezone:</span> {timezone.replace('_', ' ')}
          </p>
        </div>
      </div>
    </div>
  );
}
