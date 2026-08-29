import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

const ALLOWED_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim());

interface Props { children: React.ReactNode }

export default function AuthGuard({ children }: Props) {
  const [user, setUser]       = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) return <div className="auth-loading">Loading…</div>;
  if (!user || !ALLOWED_EMAILS.includes(user.email || '')) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
