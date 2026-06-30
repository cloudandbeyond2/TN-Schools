import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signOut: jest.fn(),
}));

// Mock framer-motion to bypass animations in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('HomePage', () => {
  it('renders the homepage with the main title', () => {
    render(<HomePage />);
    expect(screen.getByText(/Tamil Nadu Smart/i)).toBeInTheDocument();
  });
});
