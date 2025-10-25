import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Plus, Users, Clock, MapPin, CheckCircle, Settings, LogOut } from 'lucide-react';

//Mock data (replace with Firebase data later)
const mockEvents = [
  {
    id: '1',
    name: 'Birthday Party',
    date: '2025-11-15',
    participants: 8,
    status: 'planning',
    location: 'TBD',
    lastUpdated: '2 hours ago',
  },
  {
    id: '2',
    name: 'Team Offsite Meeting',
    date: '2025-11-20',
    participants: 12,
    status: 'finalized',
    location: 'Cafe Java',
    lastUpdated: '1 day ago',
  },
  {
    id: '3',
    name: 'Weekend Hiking Trip',
    date: '2025-11-25',
    participants: 6,
    status: 'planning',
    location: 'Blue Ridge Mountains',
    lastUpdated: '3 hours ago',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [events] = useState(mockEvents);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    // TODO: Add Firebase logout
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9FB]">
      
      {/*Navbar with frosted glass*/}
      <nav className="bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-[#5A3FFF] rounded-lg flex items-center justify-center shadow-sm">
                <Calendar className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-semibold text-[#5A3FFF] tracking-tight">Alignr</span>
            </Link>

            {/*User menu*/}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2.5 hover:bg-gray-50/80 rounded-lg px-3 py-1.5 transition-all duration-200 ease-out"
              >
                <div className="w-7 h-7 bg-[#5A3FFF] rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-medium text-xs">JD</span>
                </div>
                <span className="text-sm font-medium text-gray-600 hidden sm:block">John Doe</span>
              </button>

              {/*Dropdown with soft glide animation*/}
              {showUserMenu && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-[#E5E5EB] py-1.5 z-10 transition-all duration-200 ease-out origin-top-right scale-100 opacity-100">
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-[#F9F9FB] transition-colors duration-150 mx-1 rounded-lg"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#5A3FFF]" strokeWidth={2} />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 mx-1 rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/*Main content*/}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        
        {/*Header*/}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#5A3FFF] leading-tight">
              My Plans
            </h1>
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
              Manage all your group events in one place
            </p>
          </div>
          <Link
            to="/create"
            className="mt-4 sm:mt-0 bg-gradient-to-r from-[#5A3FFF] to-[#6E53FF] text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 ease-out font-medium text-sm hover:scale-[1.015]"
          >
            Create New Plan
          </Link>
        </div>

        {/*Stats cards*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          
          {/*Total plans*/}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:-translate-y-[2px] hover:shadow-lg transition-all duration-300 ease-out">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-2">
                  Total Plans
                </p>
                <p className="text-4xl font-semibold text-[#5A3FFF] tracking-tight">
                  {events.length}
                </p>
              </div>
              <div className="w-11 h-11 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#5A3FFF]" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/*Active plans*/}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:-translate-y-[2px] hover:shadow-lg transition-all duration-300 ease-out">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-2">
                  Active Plans
                </p>
                <p className="text-4xl font-semibold text-orange-500 tracking-tight">
                  {events.filter(e => e.status === 'planning').length}
                </p>
              </div>
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-500" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/*Finalized plans*/}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:-translate-y-[2px] hover:shadow-lg transition-all duration-300 ease-out">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-2">
                  Finalized Plans
                </p>
                <p className="text-4xl font-semibold text-green-600 tracking-tight">
                  {events.filter(e => e.status === 'finalized').length}
                </p>
              </div>
              <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/*Events list*/}
        <div className="bg-white border border-[#E5E5EB] shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#1E1E1E] tracking-tight">
              Recent Plans
            </h2>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[#F9F9FB] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">No plans yet</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Create your first event to get started
              </p>
              <Link
                to="/create"
                className="inline-flex items-center bg-gradient-to-r from-[#5A3FFF] to-[#6E53FF] text-white px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-out font-medium text-sm"
              >
                Create Your First Plan
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="px-6 py-5 hover:bg-[#F9F9FB] transition-all duration-300 ease-out cursor-pointer group hover:-translate-y-[1px]"
                  onClick={() => navigate(`/host/${event.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2.5">
                        <h3 className="text-base font-semibold text-[#1E1E1E] leading-tight group-hover:text-[#5A3FFF] transition-colors duration-200">
                          {event.name}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.status === 'planning'
                              ? 'bg-[#FFF5ED] text-orange-600'
                              : 'bg-[#F0FDF4] text-green-700'
                          }`}
                        >
                          {event.status === 'planning' ? 'Planning' : 'Finalized'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                          <span className="font-normal">{new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5" strokeWidth={2} />
                          <span className="font-normal">{event.participants} participants</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                          <span className="font-normal">{event.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                        Updated {event.lastUpdated}
                      </p>
                      <Link
                        to={`/host/${event.id}`}
                        className="text-[#5A3FFF] hover:text-[#3E2EB2] font-medium text-sm inline-flex items-center space-x-1 transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Manage</span>
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/*Quick actions*/}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/*Guide card with soft gradient*/}
          <div className="bg-gradient-to-br from-[#6B3EFF]/10 via-[#6B3EFF]/5 to-white border border-[#E5E5EB] rounded-2xl shadow-sm p-8 hover:shadow-md transition-all duration-300 ease-out">
            <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2 leading-tight">
              Need help getting started?
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Check out our guide on creating the perfect event plan
            </p>
            <button className="bg-white text-[#5A3FFF] border border-gray-200 px-5 py-2 rounded-lg hover:bg-[#EDE9FE] hover:border-[#5A3FFF]/20 transition-all duration-300 ease-out font-medium text-sm">
              View Guide
            </button>
          </div>

          {/* Share card */}
          <div className="bg-white border border-[#E5E5EB] rounded-2xl shadow-sm p-8 hover:shadow-md transition-all duration-300 ease-out">
            <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2 leading-tight">
              Share Your Plans
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Invite friends with a simple link. No login required for them!
            </p>
            <Link
              to="/create"
              className="inline-block bg-gradient-to-r from-[#5A3FFF] to-[#6E53FF] text-white px-5 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-out font-medium text-sm"
            >
              Create & Share
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
