import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PlanCreator from './pages/PlanCreator';
import PlanView from './pages/PlanView';
import HostPlan from './pages/HostPlan';
import TestGemini from './pages/TestGemini';
import TestSnowflake from './pages/TestSnowflake';
import Analytics from './pages/Analytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<PlanCreator />} />
          <Route path="/plan/:id" element={<PlanView />} />
          <Route path="/host/:id" element={<HostPlan />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
