import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import './styles/timetablePage.css';
import ForgotPasswordPage from './pages/forgotPasswordPage'
import ProtectedRoute from './components/protectedRoute';
import RecoveryPage from './pages/recoveryPage';
import MFAComponent from './components/mfaComponent';
import AdminPage from './pages/adminPage';


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
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/resetpassword" element={<RecoveryPage />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;