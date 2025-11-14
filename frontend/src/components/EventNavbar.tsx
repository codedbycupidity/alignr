import { Link } from 'react-router-dom';
import { Users, Share2, CheckCircle2, LogOut, LogIn } from 'lucide-react';
import faviconImg from '../assets/favicon.png';

interface EventNavbarProps {
  eventId: string;
  isOrganizer: boolean;
  isLoggedIn: boolean;
  copied: boolean;
  onCopyLink: () => void;
  onLogout: () => void;
}

export default function EventNavbar({
  eventId,
  isOrganizer,
  isLoggedIn,
  copied,
  onCopyLink,
  onLogout
}: EventNavbarProps) {
  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-white/20 px-3 sm:px-6 py-2 sm:py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2.5 group">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={faviconImg} alt="Alignr" className="w-full h-full object-cover" />
            </div>
            <span className="text-base sm:text-lg font-bold text-[#1E1E2F] tracking-tight">Alignr</span>
          </Link>
          {isOrganizer && (
            <Link
              to="/dashboard"
              className="text-xs sm:text-sm text-gray-600 hover:text-[#75619D] transition-colors hidden sm:block"
            >
              ← Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            to={`/join/${eventId}`}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-[#75619D] text-white hover:bg-[#75619D]/90 rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
            title="Join Event"
          >
            <Users className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline">Join Event</span>
          </Link>
          <button
            onClick={onCopyLink}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/60 backdrop-blur-sm border border-[#75619D]/30 text-[#75619D] hover:bg-white/80 hover:border-[#75619D]/50 rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium shadow-sm"
            title={copied ? "Copied!" : "Share Link"}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Share Link</span>
              </>
            )}
          </button>
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/60 backdrop-blur-sm border border-gray-300 text-gray-700 hover:bg-white/80 hover:border-gray-400 rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium shadow-sm"
              title="Logout"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/60 backdrop-blur-sm border border-[#75619D]/30 text-[#75619D] hover:bg-white/80 hover:border-[#75619D]/50 rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium shadow-sm"
              title="Login"
            >
              <LogIn className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
