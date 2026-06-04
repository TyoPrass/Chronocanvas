import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import GeneratorPage from './pages/GeneratorPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import DashboardLayout from './components/layouts/DashboardLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Index / Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* App */}
        <Route path="/generate" element={<DashboardLayout><GeneratorPage /></DashboardLayout>} />
        <Route path="/history" element={<DashboardLayout><HistoryPage /></DashboardLayout>} />
        <Route path="/profile" element={<DashboardLayout><ProfilePage /></DashboardLayout>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
