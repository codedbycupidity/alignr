import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Sparkles,
  Clock,
  MapPin,
  CheckSquare,
} from "lucide-react";
import favicon from "../assets/favicon.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FC] via-white to-[#F3F1F9] text-gray-900 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-[#E6E4F0] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={favicon} alt="Alignr" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-[#3F2A52] tracking-tight">alignr</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/auth"
              className="bg-[#75619D] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#624F8A] transition-all shadow-md hover:shadow-lg"
            >
              Create Event
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        {/* Subtle purple circles */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#BEAEDB]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#75619D]/10 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#75619D]/10 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-[#75619D]" />
            <span className="text-sm font-semibold text-[#75619D]">One link, zero chaos</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1E1E2F] mb-6 leading-tight">
            Group plans that{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#75619D] to-[#BEAEDB]">
              actually happen
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Replace endless group chat messages with one interactive canvas.
            Plan events together with polls, availability tracking, tasks, and more.
          </p>

          {/* CTA */}
          <div className="flex justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-[#75619D] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-[#624F8A] hover:scale-[1.02] transition-all"
            >
              <Calendar className="w-5 h-5" />
              Create Event
            </Link>
          </div>
        </div>
      </section>

      {/* Demo preview */}
      <section className="py-12 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border-2 border-[#E6E4F0] rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#75619D] rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1E1E2F]">Birthday Party</h3>
                <p className="text-sm text-gray-500">8 participants</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-[#F8F7FC] border border-[#E6E4F0] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#75619D]" />
                  <span className="text-xs font-semibold text-[#75619D]">Time Set</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Friday, 7:00 PM</p>
              </div>

              <div className="bg-[#F8F7FC] border border-[#E6E4F0] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#75619D]" />
                  <span className="text-xs font-semibold text-[#75619D]">Location</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Café Java</p>
              </div>

              <div className="bg-[#F8F7FC] border border-[#E6E4F0] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="w-4 h-4 text-[#75619D]" />
                  <span className="text-xs font-semibold text-[#75619D]">Tasks</span>
                </div>
                <p className="text-sm font-medium text-gray-700">6 of 9 done</p>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Real-time updates as everyone contributes
            </p>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1E1E2F] mb-4 tracking-tight">
              Everything you need to plan together
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Interactive blocks that make group coordination effortless
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-white" strokeWidth={2} />}
              title="Availability Heatmap"
              desc="See when everyone's free with a visual heatmap. Click to set the event time instantly."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-white" strokeWidth={2} />}
              title="Real-Time Collaboration"
              desc="Everyone can vote, add tasks, and share photos. Changes sync instantly across all devices."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-white" strokeWidth={2} />}
              title="AI-Powered Suggestions"
              desc="Gemini AI suggests relevant blocks and content based on your event type."
            />
            <FeatureCard
              icon={<MapPin className="w-6 h-6 text-white" strokeWidth={2} />}
              title="Location Voting"
              desc="Propose venues and let participants vote on their favorites with visual cards."
            />
            <FeatureCard
              icon={<CheckSquare className="w-6 h-6 text-white" strokeWidth={2} />}
              title="Task Lists"
              desc="Create collaborative checklists where participants can claim tasks. No more confusion."
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-white" strokeWidth={2} />}
              title="Calendar Export"
              desc="Export finalized plans to Google Calendar, Apple Calendar, Outlook, and more."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-br from-[#75619D]/5 to-[#BEAEDB]/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1E1E2F] mb-4 tracking-tight">
              Simple, powerful, collaborative
            </h2>
            <p className="text-xl text-gray-600">
              From idea to done in minutes
            </p>
          </div>

          <div className="space-y-8">
            <Step
              number="1"
              title="Create your event"
              description="Give it a name and let AI suggest relevant planning blocks"
            />
            <Step
              number="2"
              title="Share the link"
              description="Send one link to all participants. No accounts needed for guests."
            />
            <Step
              number="3"
              title="Plan together"
              description="Everyone votes, marks availability, claims tasks, and adds photos in real-time"
            />
            <Step
              number="4"
              title="Finalize & export"
              description="Click a time slot to set it, then export to your calendar app"
            />
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#75619D]/10 via-[#BEAEDB]/10 to-transparent"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1E1E2F] mb-6 tracking-tight">
            Stop planning in chaos.<br />Start with alignr.
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands who've replaced messy group chats with organized, collaborative event planning.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-[#75619D] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-[#624F8A] hover:scale-[1.02] transition-all"
          >
            <Calendar className="w-5 h-5" />
            Create Your First Event
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E6E4F0] bg-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center sm:text-left grid sm:grid-cols-3 gap-10">
          <div>
            <div className="flex justify-center sm:justify-start items-center space-x-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={favicon} alt="Alignr" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold text-[#3F2A52]">alignr</span>
            </div>
            <p className="text-gray-600 text-sm">
              One link, zero chaos — from idea to done.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#3F2A52] text-sm">Product</h4>
            <ul className="space-y-2.5 text-gray-600 text-sm">
              <li>
                <Link to="/auth" className="hover:text-[#75619D] transition-colors">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#75619D] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#3F2A52] text-sm">Company</h4>
            <ul className="space-y-2.5 text-gray-600 text-sm">
              <li>
                <a href="#about" className="hover:text-[#75619D] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#75619D] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E6E4F0] mt-10 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 alignr — Built with ❤️ for cleaner group coordination
          </p>
        </div>
      </footer>
    </div>
  );
}

// Feature card component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-white border-2 border-[#E6E4F0] rounded-xl p-6 hover:border-[#75619D] hover:shadow-lg transition-all group">
      <div className="w-12 h-12 bg-gradient-to-br from-[#75619D] to-[#BEAEDB] rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-all">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#1E1E2F] mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// Step component for "How it works"
interface StepProps {
  number: string;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#75619D] to-[#BEAEDB] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#1E1E2F] mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
