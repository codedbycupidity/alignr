import { Link } from 'react-router-dom';
import { Calendar, Users, Sparkles, CheckCircle, MessageSquare, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-bright-gray">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-jakarta rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-jakarta">Alignr</span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-dark-blue-gray hover:text-jakarta font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-jakarta text-white px-6 py-2 rounded-lg hover:bg-dark-blue-gray transition-colors font-medium shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-wisteria/30 text-jakarta px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Group Planning</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-jakarta leading-tight mb-6">
            Group plans die in the chat.
            <br />
            <span className="text-dark-blue-gray">Alignr revives them.</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Stop asking "what time again?" and "who's bringing what?" 
            Turn messy group chats into one shareable, interactive planning page—powered by AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className="bg-jakarta text-white px-8 py-4 rounded-xl hover:bg-dark-blue-gray transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
            >
              Create Your First Plan
            </Link>
            <Link
              to="/login"
              className="bg-white text-jakarta px-8 py-4 rounded-xl border-2 border-jakarta hover:bg-jakarta hover:text-white transition-colors font-semibold text-lg shadow-md w-full sm:w-auto"
            >
              See How It Works
            </Link>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-gray-500 mt-8">
            ✨ No login required for guests · 🚀 Real-time updates · 🤖 AI-powered suggestions
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-jakarta mb-4">
              The Problem: Planning in Group Chats is Chaos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Important details get buried. People forget. Plans fall apart.
            </p>
          </div>

          {/* Problem Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-bright-gray p-8 rounded-2xl border-2 border-red-200">
              <MessageSquare className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-black-coffee mb-3">
                Lost in the Thread
              </h3>
              <p className="text-gray-600">
                "Wait, what time was it again?" Messages get buried in 100+ unread chats.
              </p>
            </div>

            <div className="bg-bright-gray p-8 rounded-2xl border-2 border-orange-200">
              <Users className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold text-black-coffee mb-3">
                No One Commits
              </h3>
              <p className="text-gray-600">
                "Maybe!" doesn't help. You need real RSVPs and clear decisions.
              </p>
            </div>

            <div className="bg-bright-gray p-8 rounded-2xl border-2 border-yellow-200">
              <Calendar className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-black-coffee mb-3">
                Plans Don't Finalize
              </h3>
              <p className="text-gray-600">
                Without structure, group plans never move from "we should do this" to actually happening.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-bright-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-jakarta mb-4">
              How Alignr Fixes This
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One shareable link. Everyone stays in sync. Plans actually happen.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-jakarta rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-jakarta mb-3">
                AI-Powered Suggestions
              </h3>
              <p className="text-gray-600">
                Just type "Birthday Party" and get smart block suggestions: RSVP, bring-list, time voting, location.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-dark-blue-gray rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-jakarta mb-3">
                No Login for Guests
              </h3>
              <p className="text-gray-600">
                Friends click the link, enter their name, and start voting. Zero friction.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-wisteria rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-jakarta" />
              </div>
              <h3 className="text-xl font-bold text-jakarta mb-3">
                Real-Time Updates
              </h3>
              <p className="text-gray-600">
                When someone votes or claims a task, everyone sees it instantly. No refresh needed.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-jakarta rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-jakarta mb-3">
                Interactive Blocks
              </h3>
              <p className="text-gray-600">
                Time voting, location polls, task checklists, RSVP tracking—all in one place.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-dark-blue-gray rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-jakarta mb-3">
                Calendar Integration
              </h3>
              <p className="text-gray-600">
                Finalize the plan and send it straight to everyone's calendar with one click.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-wisteria rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-jakarta" />
              </div>
              <h3 className="text-xl font-bold text-jakarta mb-3">
                Smart Summaries
              </h3>
              <p className="text-gray-600">
                AI generates fun insights: "Most voted time: Friday 7 PM. Leo was MVP with 4 suggestions!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-jakarta mb-4">
              How It Works in 4 Steps
            </h2>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-jakarta text-white rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-jakarta mb-2">Create Your Plan</h3>
                <p className="text-lg text-gray-600">
                  Type your event name. AI suggests the blocks you need (RSVP, voting, tasks). Click create.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-dark-blue-gray text-white rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-jakarta mb-2">Share the Link</h3>
                <p className="text-lg text-gray-600">
                  Copy the public link and send it to your group chat. That's it.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-wisteria text-jakarta rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-jakarta mb-2">Friends Vote & Plan</h3>
                <p className="text-lg text-gray-600">
                  Everyone clicks the link, enters their name, and starts voting on times, locations, and tasks.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-jakarta text-white rounded-full flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-jakarta mb-2">Finalize & Celebrate</h3>
                <p className="text-lg text-gray-600">
                  Hit "Finalize." Get AI-powered insights. Export to calendar. Your plan is locked in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-jakarta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Stop Planning in Chaos.
            <br />
            Start Using Alignr.
          </h2>
          <p className="text-xl text-wisteria mb-10">
            Create your first plan in under 60 seconds. No credit card required.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-jakarta px-10 py-4 rounded-xl hover:bg-bright-gray transition-colors font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black-coffee text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-jakarta rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Alignr</span>
              </div>
              <p className="text-gray-400">
                Group planning made simple.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Log In</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; Alignr - Better group planning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
