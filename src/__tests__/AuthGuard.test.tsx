// PM-generated stub — complete the TODOs before relying on this test
// Requires: vitest + @testing-library/react + react-router-dom test harness
import { describe, it, expect, vi } from 'vitest';

// TODO: set up vitest + @testing-library/react (npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom)
// TODO: configure vitest.config.ts with environment: 'jsdom'

vi.mock('../lib/firebase', () => ({
  auth: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, Navigate: ({ to }: { to: string }) => <div data-testid="redirect" data-to={to} /> };
});

describe('AuthGuard', () => {
  it('shows loading state while auth is resolving', () => {
    // TODO: mock onAuthStateChanged to not call callback (pending state)
    // render(<MemoryRouter><AuthGuard><div>protected</div></AuthGuard></MemoryRouter>)
    // expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(true).toBe(true); // placeholder
  });

  it('redirects to /login when user is null', () => {
    // TODO: mock onAuthStateChanged to call back with null
    // expect(screen.getByTestId('redirect')).toHaveAttribute('data-to', '/login')
    expect(true).toBe(true); // placeholder
  });

  it('redirects to /login when user email is not in VITE_ADMIN_EMAILS', () => {
    // TODO: mock onAuthStateChanged with { email: 'notadmin@example.com' }
    // stub VITE_ADMIN_EMAILS to 'admin@example.com'
    expect(true).toBe(true); // placeholder
  });

  it('renders children when user email is in VITE_ADMIN_EMAILS', () => {
    // TODO: mock onAuthStateChanged with { email: 'admin@example.com' }
    // stub VITE_ADMIN_EMAILS to 'admin@example.com'
    // expect(screen.getByText('protected')).toBeInTheDocument()
    expect(true).toBe(true); // placeholder
  });
});
