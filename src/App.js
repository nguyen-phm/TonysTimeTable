import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPage';  
import SuccessTest from './pages/successTest';  

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/success" element={<SuccessTest />} />
      </Routes>
    </Router>
  );
}

export default App;