import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Error from '@/app/error';

describe('Error Component', () => {
  const mockError: Error & { digest?: string } = new Error('Test error message');
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders error message', () => {
    render(<Error error={mockError} reset={mockReset} />);

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/i)).toBeInTheDocument();
  });

  it('displays error digest when provided', () => {
    const errorWithDigest = Object.assign(mockError, { digest: 'abc123' });
    render(<Error error={errorWithDigest} reset={mockReset} />);

    expect(screen.getByText(/Error ID: abc123/i)).toBeInTheDocument();
  });

  it('does not display error digest when not provided', () => {
    render(<Error error={mockError} reset={mockReset} />);

    expect(screen.queryByText(/Error ID:/i)).not.toBeInTheDocument();
  });

  it('calls reset function when Try Again button is clicked', async () => {
    const user = userEvent.setup();
    render(<Error error={mockError} reset={mockReset} />);

    await user.click(screen.getByText('Try Again'));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('renders link to homepage', () => {
    render(<Error error={mockError} reset={mockReset} />);

    const homeLink = screen.getByText('Go to Homepage');
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders link to contact support', () => {
    render(<Error error={mockError} reset={mockReset} />);

    const contactLink = screen.getByText('contact support');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('logs error to console on mount', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    render(<Error error={mockError} reset={mockReset} />);

    expect(consoleSpy).toHaveBeenCalledWith('Application error:', mockError);
  });
});
