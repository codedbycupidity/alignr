import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import favicon from '../assets/favicon.png';

export default function Auth() {
  const navigate = useNavigate();
  const { sendCode, confirmCode, user } = useAuth();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'name'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Format phone number to E.164 format (e.g., +1234567890)
      // Remove all non-digit characters
      const digitsOnly = phoneNumber.replace(/\D/g, '');

      // Add +1 country code if not present
      const formattedPhone = digitsOnly.startsWith('1') && digitsOnly.length === 11
        ? `+${digitsOnly}`
        : `+1${digitsOnly}`;

      await sendCode(formattedPhone);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await confirmCode(verificationCode);

      // Check if this is a new user (no name stored yet)
      if (result.isNewUser) {
        setStep('name');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Save the name to Firestore - user is already authenticated
      if (user?.id) {
        const { createUser } = await import('../services/firestore');
        await createUser(user.id, user.email || '', name);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo and brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
            <div className="w-10 h-10 rounded-md overflow-hidden">
              <img src={favicon} alt="Alignr" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-semibold text-[#75619D]">Alignr</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'phone' ? 'Sign in with phone' : step === 'code' ? 'Enter verification code' : 'What\'s your name?'}
          </h1>
          <p className="text-sm text-gray-500">
            {step === 'phone'
              ? 'Enter your phone number to get started'
              : step === 'code'
              ? `We sent a code to ${phoneNumber}`
              : 'Let us know what to call you'}
          </p>
        </div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                {/* Phone Number input */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                      transition-colors"
                    placeholder="3212308763"
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter 10-digit US phone number
                  </p>
                </div>

                {/* reCAPTCHA container */}
                <div id="recaptcha-container"></div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !phoneNumber.trim()}
                  className="w-full bg-[#75619D] text-white py-2 px-4 rounded-md text-sm font-medium
                    hover:bg-[#75619D]/90
                    transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      Send verification code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            ) : step === 'code' ? (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                {/* Verification Code input */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                      transition-colors
                      text-center text-lg tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full bg-[#75619D] text-white py-2 px-4 rounded-md text-sm font-medium
                    hover:bg-[#75619D]/90
                    transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setVerificationCode('');
                    setError('');
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Use a different number
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitName} className="space-y-4">
                {/* Name input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#75619D] focus:border-transparent
                      transition-colors"
                    placeholder="John Doe"
                    required
                    autoFocus
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="w-full bg-[#75619D] text-white py-2 px-4 rounded-md text-sm font-medium
                    hover:bg-[#75619D]/90
                    transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>

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
