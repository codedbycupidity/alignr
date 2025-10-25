import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    //Basic validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      //Mock signup for now (replace with Firebase auth later)
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F3FF] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        
        {/*Signup card*/}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          
          {/*Logo and heading*/}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center space-x-2 mb-3">
              <div className="w-9 h-9 bg-[#6B3EFF] rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#4A2ECC]">Alignr</span>
            </Link>
            <h1 className="text-3xl font-bold text-[#4A2ECC] mb-1">Create your account</h1>
            <p className="text-sm text-gray-600">Start your first event canvas in seconds</p>
          </div>

          {/*Error message*/}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/*Name input*/}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg 
                    hover:bg-white hover:border-gray-300 
                    focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6B3EFF] focus:border-transparent 
                    transition-all duration-300
                    text-sm text-gray-700 placeholder-gray-400"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/*Email input*/}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg 
                    hover:bg-white hover:border-gray-300 
                    focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6B3EFF] focus:border-transparent 
                    transition-all duration-300
                    text-sm text-gray-700 placeholder-gray-400"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            {/*Password input*/}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg 
                    hover:bg-white hover:border-gray-300 
                    focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6B3EFF] focus:border-transparent 
                    transition-all duration-300
                    text-sm text-gray-700 placeholder-gray-400"
                  placeholder="At least 8 characters"
                  required
                />
              </div>
            </div>
            {/*Submit button*/}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B3EFF] text-white py-3 rounded-lg 
                font-semibold text-base shadow-sm
                hover:bg-[#4A2ECC] hover:shadow-md 
                transition-all duration-500 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:scale-[1.02] mt-6"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          {/*Login link*/}
          <p className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-semibold text-[#4A2ECC] hover:underline transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
