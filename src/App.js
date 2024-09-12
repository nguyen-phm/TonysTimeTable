import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import SuccessTest from './pages/successTest'; 
import TimetablePage from './pages/timetablePage';
import ForgotPasswordPage from './pages/forgotPasswordPage'

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/success" element={<SuccessTest />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/timetable" element={<TimetablePage />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;