/// <reference types="vite/client" />
import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';

// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

interface AnalyticsResult {
  insights: string;
  dataCount: number;
  rawData?: unknown[];
}

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<'time_patterns' | 'location_patterns' | 'engagement_trends' | 'event_summary'>('event_summary');
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const functions = getFunctions(app);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const getAnalytics = httpsCallable(functions, 'getSnowflakeAnalytics');
      const response = await getAnalytics({
        analysisType,
      });
      setResult(response.data as AnalyticsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bright-gray p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-plum mb-2">📊 Event Analytics</h1>
          <p className="text-dark-blue-gray">
            Powered by Snowflake Data Cloud + Cortex AI
          </p>
        </div>

        {/* Analysis Type Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-dark-plum mb-4">Select Analysis Type</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setAnalysisType('event_summary')}
              className={`p-4 rounded-lg border-2 text-left transition ${
                analysisType === 'event_summary'
                  ? 'border-jakarta bg-jakarta/10'
                  : 'border-gray-200 hover:border-jakarta/50'
              }`}
            >
              <div className="font-semibold text-dark-plum">📈 Event Summary</div>
              <div className="text-sm text-gray-600">Overview of all event types and engagement</div>
            </button>

            <button
              onClick={() => setAnalysisType('time_patterns')}
              className={`p-4 rounded-lg border-2 text-left transition ${
                analysisType === 'time_patterns'
                  ? 'border-jakarta bg-jakarta/10'
                  : 'border-gray-200 hover:border-jakarta/50'
              }`}
            >
              <div className="font-semibold text-dark-plum">⏰ Time Patterns</div>
              <div className="text-sm text-gray-600">Most popular time slots across events</div>
            </button>

            <button
              onClick={() => setAnalysisType('location_patterns')}
              className={`p-4 rounded-lg border-2 text-left transition ${
                analysisType === 'location_patterns'
                  ? 'border-jakarta bg-jakarta/10'
                  : 'border-gray-200 hover:border-jakarta/50'
              }`}
            >
              <div className="font-semibold text-dark-plum">📍 Location Preferences</div>
              <div className="text-sm text-gray-600">Venue choices by event type</div>
            </button>

            <button
              onClick={() => setAnalysisType('engagement_trends')}
              className={`p-4 rounded-lg border-2 text-left transition ${
                analysisType === 'engagement_trends'
                  ? 'border-jakarta bg-jakarta/10'
                  : 'border-gray-200 hover:border-jakarta/50'
              }`}
            >
              <div className="font-semibold text-dark-plum">📊 Engagement Trends</div>
              <div className="text-sm text-gray-600">Participation metrics over time</div>
            </button>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="w-full bg-jakarta text-white px-6 py-3 rounded-lg hover:bg-jakarta/90 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Analyzing Data...' : 'Generate Insights with Snowflake Cortex'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jakarta mb-4"></div>
            <p className="text-dark-plum font-semibold">Querying Snowflake Data Cloud...</p>
            <p className="text-sm text-gray-600 mt-2">Running Cortex AI analysis</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {result && result.success && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-jakarta/10 p-2 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-jakarta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-dark-plum">AI-Generated Insights</h2>
              </div>

              <div className="bg-blue-50 border-l-4 border-jakarta p-4 rounded">
                <p className="text-dark-plum whitespace-pre-wrap">{result.insights}</p>
              </div>

              {result.dataCount > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  <strong>Data Points Analyzed:</strong> {result.dataCount}
                </div>
              )}
            </div>

            {/* Raw Data Table */}
            {result.rawData && result.rawData.length > 0 && (
              <details className="bg-white rounded-lg shadow-md p-6">
                <summary className="cursor-pointer font-semibold text-dark-plum hover:text-jakarta">
                  📋 View Raw Data from Snowflake
                </summary>
                <div className="mt-4 overflow-x-auto">
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(result.rawData, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-wisteria/10 border border-wisteria/30 rounded-lg p-6">
          <h3 className="font-semibold text-dark-plum mb-2">💡 About this Analytics Dashboard</h3>
          <ul className="text-sm text-dark-blue-gray space-y-2">
            <li>✅ Event data is synced from Firebase to <strong>Snowflake Data Cloud</strong></li>
            <li>✅ Queries run against <strong>Snowflake tables</strong> with views for pattern analysis</li>
            <li>✅ <strong>Snowflake Cortex AI</strong> (Mistral-7B) generates natural language insights</li>
            <li>✅ Real-time analytics showing cross-event patterns and trends</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
