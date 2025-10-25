import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      //Mock login for now - replace with Firebase auth later
      if (email && password) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/dashboard');
      } else {
        setError('Please enter both email and password');
      }
    } catch (err) {
      setError('Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F3FF] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full">
        
        {/* Logo and brand */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
            <div className="w-12 h-12 bg-[#6B3EFF] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-extrabold text-[#4A2ECC]">Alignr</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#1E1E1E] mb-2">Welcome back</h1>
          <p className="text-gray-600">Log in to manage your plans</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                    hover:bg-white hover:border-gray-300 
                    focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6B3EFF] focus:border-transparent 
                    transition-all duration-300 ease-in-out
                    text-gray-900 placeholder-gray-400"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                    hover:bg-white hover:border-gray-300 
                    focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6B3EFF] focus:border-transparent 
                    transition-all duration-300 ease-in-out
                    text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B3EFF] text-white py-3 px-4 rounded-xl 
                font-semibold text-lg shadow-md 
                hover:bg-[#4A2ECC] hover:shadow-lg 
                transition-all duration-500 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:scale-[1.02]"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            className="font-semibold text-[#4A2ECC] hover:text-[#6B3EFF] hover:underline transition-colors duration-300"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}