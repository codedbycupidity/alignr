import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import { Sparkles, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface EventSummaryProps {
  eventId: string;
  isOrganizer: boolean;
  eventStatus: string;
  blockCount: number;
}

export default function EventSummary({ eventId, isOrganizer, eventStatus, blockCount }: EventSummaryProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncMethod, setSyncMethod] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load existing insight from Firestore
  useEffect(() => {
    if (blockCount <= 2) return;
    loadInsight();
  }, [eventId, blockCount]);

  const loadInsight = async () => {
    try {
      setLoading(true);
      const analyticsRef = doc(db, 'events', eventId, 'analytics', 'summary');
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        const data = analyticsDoc.data();
        setInsight(data.snowflakeInsight || null);
        setSyncMethod(data.syncMethod || null);
        setGeneratedAt(data.generatedAt?.toDate() || null);
      } else {
        setInsight(null);
      }
    } catch (err) {
      console.error('Error loading insight:', err);
      setError('Failed to load event summary');
    } finally {
      setLoading(false);
    }
  };

  // Manually trigger insight generation
  const generateInsight = async () => {
    try {
      setGenerating(true);
      setError(null);

      const manualInsightSync = httpsCallable(functions, 'manualInsightSync');
      const result = await manualInsightSync({ eventId });

      const data = result.data as { success: boolean; data?: string; error?: string };

      if (data.success && data.data) {
        setInsight(data.data);
        setSyncMethod('manual');
        setGeneratedAt(new Date());
      } else {
        setError(data.error || 'Failed to generate summary');
      }
    } catch (err: any) {
      console.error('Error generating insight:', err);
      setError(err.message || 'Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  // Don't show component if there are 2 or fewer blocks
  if (blockCount <= 2) {
    return null;
  }

  // Don't show anything if event is not finalized and no insight exists
  if (eventStatus !== 'finalized' && !insight) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-2" />
          <span className="text-sm text-gray-500">Loading event summary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-6 hover:border-[#BEAEDB] transition-colors">
      {/* Header - Always visible and clickable */}
      <div
        className="flex items-start justify-between p-6 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#75619D] rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#1E1E2F]">Event Summary</h3>
            <p className="text-xs text-gray-500">
              AI-powered insights by Snowflake Cortex
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Generate/Refresh Button (Organizer only) */}
          {isOrganizer && eventStatus === 'finalized' && !isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                generateInsight();
              }}
              disabled={generating}
              className="flex items-center gap-2 px-3 py-2 bg-[#75619D] text-white rounded-lg text-sm font-medium hover:bg-[#75619D]/90 disabled:opacity-50 transition-colors"
              title={insight ? 'Regenerate summary' : 'Generate summary'}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {insight ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </>
              )}
            </button>
          )}

          {/* Collapse/Expand Icon */}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
          >
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="px-6 pb-6">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Insight Display */}
          {insight ? (
            <div>
              <div className="bg-[#BEAEDB]/10 border border-[#BEAEDB]/30 rounded-xl p-4 mb-3">
                <p className="text-[#1E1E2F] text-base leading-relaxed">
                  "{insight}"
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {generatedAt && (
                  <span>
                    Generated {generatedAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                )}
                {syncMethod && (
                  <span className="px-2 py-0.5 bg-[#BEAEDB]/20 text-[#75619D] rounded-full font-medium">
                    {syncMethod === 'auto-finalize' ? 'Auto-generated' :
                     syncMethod === 'manual' ? 'Manual' :
                     syncMethod === 'scheduled-backfill' ? 'Backfilled' :
                     syncMethod}
                  </span>
                )}
              </div>
            </div>
          ) : eventStatus === 'finalized' && !generating ? (
            <div className="text-center py-6">
              <Sparkles className="w-12 h-12 text-[#BEAEDB] mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                No summary generated yet.
                {isOrganizer && ' Click "Generate" to create an AI-powered event summary!'}
              </p>
              {!isOrganizer && (
                <p className="text-xs text-gray-500">
                  The event organizer can generate a summary.
                </p>
              )}
            </div>
          ) : null}

          {/* Info Note */}
          {eventStatus !== 'finalized' && insight && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> This summary was generated when the event was finalized.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
