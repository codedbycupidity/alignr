import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const TestSnowflake = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const functions = getFunctions();

  // Test generateEventInsight
  const testGenerateInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const generateEventInsight = httpsCallable(functions, 'generateEventInsight');
      const result = await generateEventInsight({
        eventId: 'test-event-123',
        eventName: 'Summer BBQ Party',
        totalParticipants: 24,
        totalVotes: 156,
        winningTime: 'Saturday, June 15th at 3:00 PM',
        winningLocation: 'Central Park Pavilion',
        topContributor: {
          name: 'Alex Johnson',
          suggestionsCount: 12
        }
      });
      setResult(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bright-gray p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-dark-plum mb-8">Snowflake Cortex Test</h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={testGenerateInsight}
            disabled={loading}
            className="w-full bg-jakarta text-white px-6 py-3 rounded-lg hover:bg-jakarta/90 disabled:opacity-50"
          >
            Test generateEventInsight (Summer BBQ)
          </button>
        </div>

        {loading && (
          <div className="text-center text-dark-plum">
            <p>Generating insight with Snowflake Cortex AI...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-dark-plum mb-4">Event Insight:</h2>

            {result.success ? (
              <div className="bg-blue-50 p-4 rounded border-l-4 border-jakarta">
                <p className="text-dark-plum italic text-lg">{result.data}</p>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded">
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

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-dark-plum mb-3">Test Data:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong>Event:</strong> Summer BBQ Party</li>
            <li><strong>Participants:</strong> 24 people</li>
            <li><strong>Total Votes:</strong> 156</li>
            <li><strong>Winning Time:</strong> Saturday, June 15th at 3:00 PM</li>
            <li><strong>Winning Location:</strong> Central Park Pavilion</li>
            <li><strong>MVP Planner:</strong> Alex Johnson (12 suggestions)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestSnowflake;
