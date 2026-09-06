import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../lib/firebase';

export default function LoginPage() {
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  async function handleSignIn() {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, provider);
      navigate('/backlog');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/logo-panda-ventures.png" alt="PandA Ventures" className="login-card__logo" />
        <p className="login-card__subtitle">Operator access only</p>
        <button className="login-card__btn" onClick={handleSignIn} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
        {error && <p className="login-card__error">{error}</p>}
      </div>
    </div>
  );
}
