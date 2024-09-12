import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import ForgotPasswordPage from './pages/forgotPasswordPage'

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;