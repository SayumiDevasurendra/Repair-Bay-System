import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GasDashboard from './pages/GasDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gas-monitoring" element={<GasDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
