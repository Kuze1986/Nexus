import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Logout from '@/pages/Logout';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
