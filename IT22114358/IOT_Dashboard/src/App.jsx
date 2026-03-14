import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GasDashboard from './pages/GasDashboard';
import TemperatureDashboard from './pages/TemperatureDashboard';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gas-monitoring" element={<GasDashboard />} />
        <Route path="/temperature-monitoring" element={<TemperatureDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
