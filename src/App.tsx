import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ComingSoonPage from './pages/ComingSoonPage';

const LoginPage   = lazy(() => import('./pages/LoginPage'));
const AdminPage   = lazy(() => import('./pages/platformcore/AdminPage'));
const BacklogPage = lazy(() => import('./pages/BacklogPage'));
const AuthGuard   = lazy(() => import('./components/AuthGuard'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="auth-loading">Loading…</div>}>
        <Routes>
          <Route path="/"                   element={<ComingSoonPage />} />
          <Route path="/login"              element={<LoginPage />} />
          <Route path="/platformcore/admin" element={<AuthGuard><AdminPage /></AuthGuard>} />
          <Route path="/backlog"            element={<AuthGuard><BacklogPage /></AuthGuard>} />
          {/* future public product pages — stubs for now */}
          <Route path="/platformcore"       element={<ComingSoonPage />} />
          <Route path="/dockbound"          element={<ComingSoonPage />} />
          <Route path="/forumjourney"       element={<ComingSoonPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
