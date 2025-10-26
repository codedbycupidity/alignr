import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PlanView from './pages/PlanView';
import CreateEvent from './pages/CreateEvent';
import JoinEvent from './pages/JoinEvent';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/event/create" element={<CreateEvent />} />
          <Route path="/event/:id" element={<PlanView />} />
          <Route path="/join/:eventId" element={<JoinEvent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
