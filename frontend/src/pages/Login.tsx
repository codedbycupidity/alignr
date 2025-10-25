import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jakarta via-bright-gray to-wisteria flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black-coffee mb-2">Alignr</h1>
          <p className="text-dark-blue-gray">Bring your group plans out of the chat</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-black-coffee mb-6">Log In</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-black-coffee mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2 border border-wisteria rounded-lg focus:outline-none focus:ring-2 focus:ring-jakarta text-black-coffee"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-black-coffee mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-wisteria rounded-lg focus:outline-none focus:ring-2 focus:ring-jakarta text-black-coffee"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-jakarta hover:bg-dark-blue-gray text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Signup Link */}
          <p className="mt-6 text-center text-dark-blue-gray">
            Don't have an account?{' '}
            <Link to="/signup" className="text-jakarta font-bold hover:underline">
              Sign Up
            </Link>
          </p>

          {/* Demo Note */}
          <div className="mt-6 p-4 bg-bright-gray rounded-lg border border-wisteria">
            <p className="text-xs text-dark-blue-gray">
              💡 Demo tip: Use any email/password to test. Firebase setup pending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}