import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Plus, Users, Clock, MapPin, CheckCircle, Settings, LogOut } from 'lucide-react';

// Mock data - replace with Firebase data later
const mockEvents = [
  {
    id: '1',
    name: 'Birthday Party 🎂',
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
    name: 'Weekend Hiking Trip 🏔️',
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
    <div className="min-h-screen bg-bright-gray">
      {/* Header / Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-jakarta rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-jakarta">Alignr</span>
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="w-8 h-8 bg-jakarta rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">JD</span>
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-jakarta">My Plans</h1>
            <p className="text-gray-600 mt-1">Manage all your group events in one place</p>
          </div>
          <Link
            to="/create"
            className="bg-jakarta text-white px-6 py-3 rounded-lg hover:bg-dark-blue-gray transition-colors font-semibold shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Plan</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Plans</p>
                <p className="text-3xl font-bold text-jakarta">{events.length}</p>
              </div>
              <div className="w-12 h-12 bg-jakarta/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-jakarta" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Plans</p>
                <p className="text-3xl font-bold text-orange-500">
                  {events.filter(e => e.status === 'planning').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Finalized Plans</p>
                <p className="text-3xl font-bold text-green-500">
                  {events.filter(e => e.status === 'finalized').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-jakarta">Recent Plans</h2>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No plans yet</h3>
              <p className="text-gray-500 mb-6">Create your first event to get started</p>
              <Link
                to="/create"
                className="inline-flex items-center space-x-2 bg-jakarta text-white px-6 py-3 rounded-lg hover:bg-dark-blue-gray transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Plan</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/host/${event.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.status === 'planning'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {event.status === 'planning' ? 'Planning' : 'Finalized'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{event.participants} participants</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Updated {event.lastUpdated}</p>
                      <Link
                        to={`/host/${event.id}`}
                        className="text-jakarta hover:text-dark-blue-gray font-medium text-sm mt-2 inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Manage →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-jakarta to-dark-blue-gray rounded-xl shadow-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Need help getting started?</h3>
            <p className="text-wisteria mb-6">
              Check out our guide on creating the perfect event plan
            </p>
            <button className="bg-white text-jakarta px-6 py-2 rounded-lg hover:bg-bright-gray transition-colors font-semibold">
              View Guide
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-jakarta mb-2">Share Your Plans</h3>
            <p className="text-gray-600 mb-6">
              Invite friends with a simple link. No login required for them!
            </p>
            <Link
              to="/create"
              className="inline-block bg-jakarta text-white px-6 py-2 rounded-lg hover:bg-dark-blue-gray transition-colors font-semibold"
            >
              Create & Share
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
