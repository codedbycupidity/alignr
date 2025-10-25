import { Link } from "react-router-dom";
import {
  MessageSquare,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import favicon from "../assets/favicon.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#EAEAF5] flex flex-col">
      
      {/* Navbar */}
      <nav className="bg-[#0F0F16]/80 backdrop-blur-lg border-b border-[#1E1E29]/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={favicon} alt="Alignr" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">Alignr</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-[#B8B7C9] hover:text-white font-medium text-sm transition-colors duration-300"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-[#7B61FF] text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-[#684FE0] transition-all duration-500 shadow-lg hover:shadow-[#7B61FF]/40"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="py-32 relative overflow-hidden">
        {/* Subtle purple haze */}
        <div className="absolute inset-0 bg-gradient-radial from-[#7B61FF]/10 via-transparent to-transparent opacity-40"></div>
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight">
            A canvas for{' '}
            <span className="text-[#7B61FF]">real-world plans</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-[#B8B7C9] max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Drop times, places, and notes — or share an event.{' '}
            <span className="text-[#EAEAF5]">
              Alignr keeps it structured and smart, so planning feels creative, not chaotic.
            </span>
          </p>

          {/* CTA */}
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-[#7B61FF] to-[#5A3FFF] text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-[#7B61FF]/50 hover:scale-[1.02] transition-all duration-700"
          >
            Start a Canvas
          </Link>
        </div>
      </section>

      {/* Canvas preview */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="bg-[#E8E8ED] border border-[#D0D0D8] rounded-2xl p-8 shadow-2xl inline-block">
            <p className="text-[#1E1E1E] font-semibold mb-2 text-lg">
              Friday 7 PM — Café Java
            </p>
            <p className="text-[#5A5A68] text-sm">
              6 of 9 tasks done · 8 friends joined
            </p>
          </div>
          <p className="text-[#88889B] text-sm mt-6 font-medium">
            Your live planning canvas updates as your friends interact.
          </p>
        </div>
      </section>

      {/* Features section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-16 tracking-tight">
            Simple blocks. Smart plans.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6 text-white" strokeWidth={2} />}
              title="Collaborative Canvas"
              desc="Everyone can add times, places, and notes. Watch the plan build itself."
              color="from-[#7B61FF] to-[#5A3FFF]"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-white" strokeWidth={2} />}
              title="Smart Updates"
              desc="Gemini summarizes progress automatically — so you always know what's next."
              color="from-[#9B84FF] to-[#7B61FF]"
            />
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6 text-white" strokeWidth={2} />}
              title="Interactive Blocks"
              desc="RSVPs, polls, and tasks — everything stays neat and fun in one place."
              color="from-[#7C5CDB] to-[#5A3FFF]"
            />
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 relative overflow-hidden">
        {/* Purple glow background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#7B61FF]/20 via-[#7B61FF]/10 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
            Bring ideas to life. Together.
          </h2>
          <p className="text-xl text-[#B8B7C9] mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Create your first canvas in under a minute — no sign-ups needed for guests.
          </p>
          <Link
            to="/login"
            className="inline-block bg-white text-[#7B61FF] px-10 py-4 rounded-xl font-bold text-lg shadow-2xl hover:bg-[#F5F3FF] hover:scale-[1.02] transition-all duration-700"
          >
            Start a Canvas
          </Link>

          {/* Bottom line */}
          <p className="mt-10 text-[#88889B] text-sm font-medium">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-[#7B61FF] hover:text-[#9B84FF] font-semibold transition-colors duration-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E1E29]/60 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center sm:text-left grid sm:grid-cols-3 gap-10">
          <div>
            <div className="flex justify-center sm:justify-start items-center space-x-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={favicon} alt="Alignr" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-semibold text-white">Alignr</span>
            </div>
            <p className="text-[#88889B] text-sm font-medium">
              Thoughtful planning, beautifully done.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white text-sm">Product</h4>
            <ul className="space-y-2.5 text-[#88889B] text-sm">
              <li>
                <Link to="/signup" className="hover:text-white transition-colors duration-300">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors duration-300">
                  Log In
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors duration-300">
                  Features
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white text-sm">Company</h4>
            <ul className="space-y-2.5 text-[#88889B] text-sm">
              <li>
                <a href="#about" className="hover:text-white transition-colors duration-300">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors duration-300">
                  Contact
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors duration-300">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#1E1E29]/60 mt-10 pt-8 text-center">
          <p className="text-[#88889B] text-sm font-medium">
            © 2025 Alignr — Better together.
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
  color: string;
}

function FeatureCard({ icon, title, desc, color }: FeatureCardProps) {
  return (
    <div className="bg-[#16161E] border border-[#1E1E29] rounded-2xl p-8 hover:border-[#7B61FF]/40 transition-all duration-500 group">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-[#7B61FF]/50 transition-all duration-500`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-[#B8B7C9] leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
