import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEvent, updateEvent } from '../services/events';
import { Calendar as CalendarIcon, ChevronLeft, Clock, X, Loader2 } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import type { EventData } from '../services/events';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EditEvent = () => {
  const { user } = useAuth();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventData | null>(null);
  const [dateType, setDateType] = useState<'specific' | 'days'>('specific');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const loadEvent = async () => {
      try {
        const eventData = await getEvent(eventId);
        if (!eventData) {
          navigate('/dashboard');
          return;
        }

        // Check if user is the organizer
        if (user?.id !== eventData.organizerId) {
          navigate(`/event/${eventId}`);
          return;
        }

        setEvent(eventData);
        setDateType(eventData.dateType || 'specific');

        if (eventData.selectedDates) {
          setSelectedDates(eventData.selectedDates.map(d => new Date(d + 'T00:00:00')));
        }

        if (eventData.selectedDays) {
          setSelectedDays(eventData.selectedDays);
        }

        setStartTime(eventData.startTime || '09:00');
        setEndTime(eventData.endTime || '17:00');
      } catch (error) {
        console.error('Error loading event:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, user, navigate]);

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const h = hour.toString().padStart(2, '0');
        const m = min.toString().padStart(2, '0');
        const time24 = `${h}:${m}`;
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const time12 = `${hour12}:${m} ${ampm}`;
        times.push({ value: time24, label: time12 });
      }
    }
    return times;
  };

  const formatTime12Hour = (time24: string) => {
    const [hour, min] = time24.split(':').map(Number);
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${hour12}:${min.toString().padStart(2, '0')} ${ampm}`;
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventId) return;

    if (dateType === 'specific' && selectedDates.length === 0) {
      alert('Please select at least one date');
      return;
    }

    if (dateType === 'days' && selectedDays.length === 0) {
      alert('Please select at least one day of the week');
      return;
    }

    setSaving(true);

    try {
      const updates: any = {
        dateType,
        startTime,
        endTime,
      };

      if (dateType === 'specific') {
        updates.selectedDates = selectedDates
          .map(d => d.toISOString().split('T')[0])
          .sort();
        updates.selectedDays = null;
      } else {
        updates.selectedDays = selectedDays;
        updates.selectedDates = null;
      }

      await updateEvent(eventId, updates);
      navigate(`/event/${eventId}`);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#75619D] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading event...</p>
        </div>
      </div>
    );
  }

  const getDateSummary = () => {
    if (dateType === 'specific') {
      return selectedDates.length > 0
        ? `${selectedDates.length} date${selectedDates.length !== 1 ? 's' : ''} selected`
        : 'No dates selected';
    } else {
      return selectedDays.length > 0
        ? `${selectedDays.length} day${selectedDays.length !== 1 ? 's' : ''} selected`
        : 'No days selected';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-[#75619D] rounded-md flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-base font-semibold text-[#75619D]">Alignr</span>
            </Link>
            <Link
              to={`/event/${eventId}`}
              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-900">Edit Event Dates & Times</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Modify when participants can indicate their availability
          </p>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-3">
          {/* Date Selection - Full Width */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Dates
            </label>
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-left
                hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span className={selectedDates.length === 0 && selectedDays.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
                {getDateSummary()}
              </span>
              <CalendarIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Time Range */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <Clock className="w-3 h-3 inline mr-1" />
              Time Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-xs text-gray-500 mb-1 font-medium">Start</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowStartTimePicker(!showStartTimePicker)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium
                      bg-gray-50 hover:bg-white transition-colors text-left
                      focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                      flex items-center justify-between"
                  >
                    <span>{formatTime12Hour(startTime)}</span>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </button>
                  {showStartTimePicker && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {generateTimeOptions().map((time) => (
                        <button
                          key={time.value}
                          type="button"
                          onClick={() => {
                            setStartTime(time.value);
                            setShowStartTimePicker(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                            time.value === startTime ? 'bg-[#4a3d63] text-white hover:bg-[#4a3d63]' : ''
                          }`}
                        >
                          {time.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-gray-500 mb-1 font-medium">End</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium
                      bg-gray-50 hover:bg-white transition-colors text-left
                      focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                      flex items-center justify-between"
                  >
                    <span>{formatTime12Hour(endTime)}</span>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </button>
                  {showEndTimePicker && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {generateTimeOptions().map((time) => (
                        <button
                          key={time.value}
                          type="button"
                          onClick={() => {
                            setEndTime(time.value);
                            setShowEndTimePicker(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                            time.value === endTime ? 'bg-[#4a3d63] text-white hover:bg-[#4a3d63]' : ''
                          }`}
                        >
                          {time.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons - Full Width */}
          <div className="col-span-2 flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/event/${eventId}`)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-[#75619D] text-white rounded-md text-sm font-semibold hover:bg-[#75619D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Date Picker Popup */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div
            className="absolute inset-0"
            onClick={() => setShowDatePicker(false)}
          />
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200"
            data-state="open"
            style={{
              animation: 'zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <style>{`
              @keyframes zoomIn {
                from {
                  opacity: 0;
                  transform: scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              [data-state="open"] {
                animation: zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
              }

              .rdp-root {
                --rdp-accent-color: #4a3d63;
                --rdp-accent-background-color: #4a3d63;
              }

              .rdp {
                margin: 0;
                font-family: inherit;
              }

              .rdp-month_caption {
                font-size: 1rem;
                font-weight: 700;
                color: #111827;
                letter-spacing: -0.025em;
                margin-bottom: 1.25rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
              }

              .rdp-nav {
                display: flex;
                gap: 0.5rem;
              }

              .rdp-chevron {
                fill: #6b7280;
                transition: fill 0.15s ease;
                width: 18px;
                height: 18px;
              }

              .rdp-button_previous,
              .rdp-button_next {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background-color: white;
                border: 1px solid #e5e7eb;
                transition: all 0.15s ease;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .rdp-button_previous:hover,
              .rdp-button_next:hover {
                background-color: #f9fafb;
                border-color: #4a3d63;
                box-shadow: 0 2px 6px rgba(74, 61, 99, 0.15);
              }

              .rdp-button_previous:hover .rdp-chevron,
              .rdp-button_next:hover .rdp-chevron {
                fill: #4a3d63;
              }

              .rdp-button_previous:active,
              .rdp-button_next:active {
                background-color: #f3f4f6;
                transform: scale(0.95);
              }

              .rdp-weekday {
                font-weight: 700;
                font-size: 0.65rem;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                padding: 0.5rem 0;
              }

              .rdp-day {
                border-radius: 10px;
                font-size: 0.85rem;
                font-weight: 500;
                text-align: center;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                width: 36px;
                height: 36px;
              }

              .rdp-day:hover:not([class*="selected"]) {
                background-color: #f9fafb;
                transform: scale(1.05);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
              }

              .rdp-day_today:not([class*="selected"]) {
                font-weight: 700;
                color: #4a3d63;
                background: linear-gradient(135deg, #f5f3f7 0%, #ede9f1 100%);
                border: 2px solid #9b8bb8;
                box-shadow: 0 2px 4px rgba(155, 139, 184, 0.2);
              }

              .rdp-day_today:not([class*="selected"]):hover {
                background: linear-gradient(135deg, #ede9f1 0%, #e5dfe9 100%);
                transform: scale(1.05);
                box-shadow: 0 3px 8px rgba(155, 139, 184, 0.3);
              }

              .rdp-day_outside {
                opacity: 0.25;
                color: #d1d5db;
              }

              .rdp-day_disabled {
                opacity: 0.2;
                cursor: not-allowed;
              }

              .rdp-cell {
                padding: 1px;
              }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Select Dates</h2>
              <button
                onClick={() => setShowDatePicker(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Date Type Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setDateType('specific')}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    dateType === 'specific'
                      ? 'bg-[#75619D] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Specific Dates
                </button>
                <button
                  type="button"
                  onClick={() => setDateType('days')}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    dateType === 'days'
                      ? 'bg-[#75619D] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Days of the Week
                </button>
              </div>

              {/* Specific Dates Calendar */}
              {dateType === 'specific' && (
                <div className="flex justify-center">
                  <DayPicker
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    numberOfMonths={1}
                    className="border-0"
                    classNames={{
                      selected: "!bg-[#4a3d63] !text-white !font-semibold shadow-lg"
                    }}
                  />
                </div>
              )}

              {/* Days of Week Selection - Horizontal Circles */}
              {dateType === 'days' && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex justify-center gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((letter, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`w-9 h-9 rounded-full text-xs font-medium transition-all flex items-center justify-center ${
                          selectedDays.includes(index)
                            ? 'bg-[#75619D] text-white shadow-md transform scale-110'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {selectedDays.length > 0 ? (
                      <span>
                        {selectedDays.map(i => DAYS_OF_WEEK[i]).join(', ')}
                      </span>
                    ) : (
                      'Select days of the week'
                    )}
                  </div>
                </div>
              )}

              {/* Selection Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  {getDateSummary()}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowDatePicker(false)}
                className="w-full px-4 py-2 bg-[#75619D] text-white rounded-md text-sm font-medium hover:bg-[#75619D]/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEvent;
