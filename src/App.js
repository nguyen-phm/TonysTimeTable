import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import TimetablePage from './pages/timetablePage';
import ForgotPasswordPage from './pages/forgotPasswordPage'
import ProtectedRoute from './components/protectedRoute';
import RecoveryPage from './pages/recoveryPage';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route 
            path="/timetable" 
            element={
              <ProtectedRoute>
                <TimetablePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resetpassword" 
            element={
              <ProtectedRoute>
                <RecoveryPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
  );
};

export default App;