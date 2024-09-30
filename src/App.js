import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import TimetablePage from './pages/timetablePage';
import ForgotPasswordPage from './pages/forgotPasswordPage'
import ProtectedRoute from './components/protectedRoute';
import MFAComponent from './components/mfaComponent';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          //MFA
          <Route path="/mfa" element={<MFAComponent />} />

          <Route 
            path="/timetable" 
            element={
              <ProtectedRoute>
                <TimetablePage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
  );
};

export default App;