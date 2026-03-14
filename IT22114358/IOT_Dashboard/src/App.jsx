import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GasDashboard from './pages/GasDashboard';

function NoiseRedirect() {
  window.location.href = "http://localhost:8080"; // noise dashboard port
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gas-monitoring" element={<GasDashboard />} />
        <Route path="/noise-monitoring" element={<NoiseRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
