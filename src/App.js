import { BrowserRouter, Routes, Route } from 'react-router-dom';

import GptPage from './components/gptAssist';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GptPage />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;