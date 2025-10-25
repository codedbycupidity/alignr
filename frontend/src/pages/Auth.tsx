import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'login' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Failed to log in. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (signupPassword.length < 8) {
      setSignupError('Password must be at least 8 characters');
      return;
    }

    setSignupLoading(true);

    try {
      await signup(signupEmail, signupPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setSignupError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo and brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
            <div className="w-10 h-10 bg-[#75619D] rounded-md flex items-center justify-center transition-colors">
              <Calendar className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <span className="text-2xl font-semibold text-[#75619D]">Alignr</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-gray-500">
            {activeTab === 'login' ? 'Log in to manage your plans' : 'Start planning events in seconds'}
          </p>
        </div>

        {/* Auth card with tabs */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

          {/* Tabs */}
          <div className="border-b border-gray-200 relative">
            <div className="flex">
              <button
                onClick={() => setActiveTab('login')}
                className={`
                  relative flex-1 py-3 px-4 text-sm font-medium transition-colors
                  ${activeTab === 'login'
                    ? 'text-[#75619D]'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`
                  relative flex-1 py-3 px-4 text-sm font-medium transition-colors
                  ${activeTab === 'signup'
                    ? 'text-[#75619D]'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                Sign up
              </button>
            </div>

            {/* Animated underline */}
            <motion.div
              className="absolute bottom-0 h-0.5 bg-[#75619D]"
              layoutId="underline"
              initial={false}
              animate={{
                left: activeTab === 'login' ? '0%' : '50%',
                width: '50%'
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
            />
          </div>

          {/* Tab content */}
          <div className="p-6 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {/* Login tab */}
              {activeTab === 'login' && (
                <motion.div
                  key="login"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                {loginError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{loginError}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">

                  {/* Email input */}
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm
                        placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                        transition-colors"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  {/* Password input */}
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm
                        placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                        transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-[#75619D] text-white py-2 px-4 rounded-md text-sm font-medium
                      hover:bg-[#75619D]/90
                      transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loginLoading ? 'Logging in...' : 'Log In'}
                  </button>
                </form>
                </motion.div>
              )}

              {/* Signup tab */}
              {activeTab === 'signup' && (
                <motion.div
                  key="signup"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                {signupError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{signupError}</p>
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">

                  {/* Email input */}
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm
                        placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                        transition-colors"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  {/* Password input */}
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm
                        placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                        transition-colors"
                      placeholder="At least 8 characters"
                      required
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full bg-[#75619D] text-white py-2 px-4 rounded-md text-sm font-medium
                      hover:bg-[#75619D]/90
                      transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signupLoading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="#" className="text-[#75619D] hover:underline font-medium">
            Terms
          </a>
          {' '}and{' '}
          <a href="#" className="text-[#75619D] hover:underline font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
