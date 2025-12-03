import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './pages/Dashboard';
import RecruiterPanel from './pages/RecruiterPanel';
import CandidateProfile from './pages/CandidateProfile';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recruiter" element={<RecruiterPanel />} />
          <Route path="/candidate/:id" element={<CandidateProfile />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
