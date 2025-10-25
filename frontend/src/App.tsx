import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import * as SignupModule from './pages/Signup';
import * as DashboardModule from './pages/Dashboard';
import * as PlanCreatorModule from './pages/PlanCreator';
import * as PlanViewModule from './pages/PlanView';
import * as HostPlanModule from './pages/HostPlan';

const Signup = (SignupModule as any).default;
const Dashboard = (DashboardModule as any).default;
const PlanCreator = (PlanCreatorModule as any).default;
const PlanView = (PlanViewModule as any).default;
const HostPlan = (HostPlanModule as any).default;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Plan View - Public (no auth required for guests) */}
        <Route path="/plan/:id" element={<PlanView />} />
        
        {/* Protected Routes - Require Authentication */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<PlanCreator />} />
        <Route path="/host/:id" element={<HostPlan />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
