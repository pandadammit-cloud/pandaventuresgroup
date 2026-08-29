import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ComingSoonPage from './pages/ComingSoonPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/platformcore/AdminPage';
import AuthGuard from './components/AuthGuard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<ComingSoonPage />} />
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/platformcore/admin" element={<AuthGuard><AdminPage /></AuthGuard>} />
        {/* future public product pages — stubs for now */}
        <Route path="/platformcore"       element={<ComingSoonPage />} />
        <Route path="/dockbound"          element={<ComingSoonPage />} />
        <Route path="/forumjourney"       element={<ComingSoonPage />} />
      </Routes>
    </BrowserRouter>
  );
}
