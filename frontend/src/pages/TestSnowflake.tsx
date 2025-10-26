import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TestSnowflake = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testEventId, setTestEventId] = useState('test-event-' + Date.now());
  const [autoSyncResult, setAutoSyncResult] = useState<any>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const functions = getFunctions();
  const db = getFirestore();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to test Snowflake sync functions.</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Test generateEventInsight (Original)
  const testGenerateInsight = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const generateEventInsight = httpsCallable(functions, 'generateEventInsight');
      const result = await generateEventInsight({
        eventId: testEventId
      });
      setResult(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test Manual Sync
  const testManualSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const manualInsightSync = httpsCallable(functions, 'manualInsightSync');
      const result = await manualInsightSync({
        eventId: testEventId
      });
      setResult(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test Auto-Sync (by finalizing an event)
  const testAutoSync = async () => {
    setLoading(true);
    setError(null);
    setAutoSyncResult(null);
    try {
      // Create a test event
      const eventRef = doc(db, 'events', testEventId);

      // First create the event with 'active' status
      await setDoc(eventRef, {
        name: 'Auto-Sync Test Event',
        status: 'active',
        organizerId: user?.id || 'test-user',
        isPublic: true, // Make it public so rules allow it
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setAutoSyncResult({ step: 'created', message: 'Event created with active status' });

      // Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Now finalize it - this should trigger onEventFinalized
      await setDoc(eventRef, {
        status: 'finalized',
        updatedAt: new Date()
      }, { merge: true });

      setAutoSyncResult({ step: 'finalized', message: 'Event finalized - auto-sync triggered!' });

      // Wait 5 seconds for the Cloud Function to process
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check if insight was generated
      const analyticsRef = doc(db, 'events', testEventId, 'analytics', 'summary');
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        const data = analyticsDoc.data();
        setAutoSyncResult({
          step: 'completed',
          message: 'Auto-sync successful!',
          insight: data.snowflakeInsight,
          generatedAt: data.generatedAt?.toDate().toISOString(),
          syncMethod: data.syncMethod
        });
      } else {
        setAutoSyncResult({
          step: 'waiting',
          message: 'Waiting for auto-sync... (check again in a few seconds)'
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check insight status
  const checkInsightStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const analyticsRef = doc(db, 'events', testEventId, 'analytics', 'summary');
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        const data = analyticsDoc.data();
        setResult({
          success: true,
          data: data.snowflakeInsight,
          metadata: {
            generatedAt: data.generatedAt?.toDate().toISOString(),
            syncMethod: data.syncMethod
          }
        });
      } else {
        setResult({
          success: false,
          error: 'No insight found yet. Try manual sync or wait for auto-sync.'
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Snowflake Auto-Sync Test Suite</h1>
        <p className="text-gray-600 mb-8">Test automatic insight generation with Snowflake Cortex AI</p>

        {/* Test Event ID */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Event ID:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testEventId}
              onChange={(e) => setTestEventId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Enter event ID"
            />
            <button
              onClick={() => setTestEventId('test-event-' + Date.now())}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
            >
              New ID
            </button>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={testAutoSync}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <div className="text-left">
              <div className="font-semibold">1. Test Auto-Sync</div>
              <div className="text-sm opacity-90">Create & finalize event (triggers onEventFinalized)</div>
            </div>
          </button>

          <button
            onClick={testManualSync}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <div className="text-left">
              <div className="font-semibold">2. Test Manual Sync</div>
              <div className="text-sm opacity-90">Call manualInsightSync function</div>
            </div>
          </button>

          <button
            onClick={testGenerateInsight}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <div className="text-left">
              <div className="font-semibold">3. Test Direct Call</div>
              <div className="text-sm opacity-90">Call generateEventInsight (original)</div>
            </div>
          </button>

          <button
            onClick={checkInsightStatus}
            disabled={loading}
            className="bg-gray-600 text-white px-6 py-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <div className="text-left">
              <div className="font-semibold">4. Check Status</div>
              <div className="text-sm opacity-90">Read insight from Firestore</div>
            </div>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
            <p>Processing request...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Auto-Sync Progress */}
        {autoSyncResult && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Auto-Sync Progress:</h2>
            <div className="space-y-3">
              <div className={`p-3 rounded ${
                autoSyncResult.step === 'completed' ? 'bg-green-50 border border-green-200' :
                autoSyncResult.step === 'waiting' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className="font-medium text-gray-900">
                  Step: {autoSyncResult.step}
                </p>
                <p className="text-sm text-gray-700 mt-1">{autoSyncResult.message}</p>
              </div>

              {autoSyncResult.insight && (
                <div className="bg-purple-50 p-4 rounded border-l-4 border-purple-600">
                  <p className="text-gray-900 italic text-lg">{autoSyncResult.insight}</p>
                  <div className="mt-2 text-xs text-gray-600">
                    <p>Generated: {autoSyncResult.generatedAt}</p>
                    <p>Method: {autoSyncResult.syncMethod}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Result:</h2>

            {result.success ? (
              <div>
                <div className="bg-green-50 p-4 rounded border-l-4 border-green-600 mb-4">
                  <p className="text-gray-900 italic text-lg">{result.data}</p>
                </div>
                {result.metadata && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Generated At:</strong> {result.metadata.generatedAt}</p>
                    <p><strong>Sync Method:</strong> {result.metadata.syncMethod}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded border-l-4 border-red-600">
                <p className="text-red-700">{result.error}</p>
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                View Full Response
              </summary>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm mt-2">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Documentation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How It Works:</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">1. Auto-Sync (onEventFinalized)</h4>
              <p>Creates a test event, then changes status to 'finalized'. This triggers the Cloud Function which automatically generates and saves the insight.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">2. Manual Sync (manualInsightSync)</h4>
              <p>Calls the manualInsightSync Cloud Function for the test event. Event must exist and be finalized.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">3. Direct Call (generateEventInsight)</h4>
              <p>Calls the original generateEventInsight function. Returns the insight but doesn't save it to Firestore.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">4. Check Status</h4>
              <p>Reads the analytics/summary document from Firestore to see if an insight was generated.</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> For auto-sync to work, make sure the Cloud Functions are deployed and Snowflake credentials are configured.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSnowflake;
