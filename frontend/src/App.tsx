import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PlanCreator from './pages/PlanCreator';
import PlanView from './pages/PlanView';
import HostPlan from './pages/HostPlan';
import Analytics from './pages/Analytics';
import CreateEvent from './pages/CreateEvent';

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
          <Route path="/create" element={<PlanCreator />} />
          <Route path="/create/:id" element={<PlanCreator />} />
          <Route path="/plan/:id" element={<PlanView />} />
          <Route path="/host/:id" element={<HostPlan />} />
          <Route path="/event/create" element={<CreateEvent />} />
          <Route path="/event/:id" element={<PlanView />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
