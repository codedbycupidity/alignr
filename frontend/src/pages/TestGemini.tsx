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

const TestGemini = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const functions = getFunctions(app);

  // Test suggestBlocks
  const testSuggestBlocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const suggestBlocks = httpsCallable(functions, 'suggestBlocks');
      const result = await suggestBlocks({
        eventName: 'Birthday Party',
        eventType: 'birthday_party',
        description: 'Celebrating Sarah\'s 25th birthday with friends'
      });
      setResults(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test detectEventType
  const testDetectEventType = async () => {
    setLoading(true);
    setError(null);
    try {
      const detectEventType = httpsCallable(functions, 'detectEventType');
      const result = await detectEventType({
        eventName: 'Team Building Escape Room'
      });
      setResults(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test suggestBlockContent
  const testSuggestBlockContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const suggestBlockContent = httpsCallable(functions, 'suggestBlockContent');
      const result = await suggestBlockContent({
        blockType: 'task',
        eventName: 'Camping Trip',
        participantCount: 8
      });
      setResults(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bright-gray p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-dark-plum mb-8">Gemini Functions Test</h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={testSuggestBlocks}
            disabled={loading}
            className="w-full bg-wisteria text-white px-6 py-3 rounded-lg hover:bg-wisteria/90 disabled:opacity-50"
          >
            Test suggestBlocks (Birthday Party)
          </button>

          <button
            onClick={testDetectEventType}
            disabled={loading}
            className="w-full bg-wisteria text-white px-6 py-3 rounded-lg hover:bg-wisteria/90 disabled:opacity-50"
          >
            Test detectEventType (Team Building Escape Room)
          </button>

          <button
            onClick={testSuggestBlockContent}
            disabled={loading}
            className="w-full bg-wisteria text-white px-6 py-3 rounded-lg hover:bg-wisteria/90 disabled:opacity-50"
          >
            Test suggestBlockContent (Camping Trip Tasks)
          </button>
        </div>

        {loading && (
          <div className="text-center text-dark-plum">
            <p>Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {results && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-dark-plum mb-4">Results:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestGemini;
