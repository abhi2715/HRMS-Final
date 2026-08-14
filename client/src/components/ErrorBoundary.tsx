import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary.
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs the error, and renders a fallback UI instead of crashing the entire app.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconContainer}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-error, #DC2626)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              An unexpected error occurred. Please try again or contact support if the problem persists.
            </p>
            {this.state.error && (
              <pre style={styles.errorDetail}>
                {this.state.error.message}
              </pre>
            )}
            <button style={styles.button} onClick={this.handleReset}>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: 'var(--color-bg, #F8F9FB)',
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
    padding: '3rem 2rem',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    borderRadius: 'var(--radius-xl, 16px)',
    boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.06))',
    border: '1px solid var(--color-border-subtle, #EDEEF1)',
  },
  iconContainer: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    fontSize: 'var(--text-xl, 1.25rem)',
    fontWeight: 600,
    color: 'var(--color-text-primary, #111318)',
    marginBottom: '0.75rem',
  },
  message: {
    fontSize: 'var(--text-base, 0.875rem)',
    color: 'var(--color-text-secondary, #555B67)',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
  },
  errorDetail: {
    fontSize: 'var(--text-sm, 0.8125rem)',
    color: 'var(--color-error-text, #991B1B)',
    backgroundColor: 'var(--color-error-subtle, #FEF2F2)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md, 8px)',
    marginBottom: '1.5rem',
    textAlign: 'left' as const,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    maxHeight: '120px',
    overflow: 'auto',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.625rem 1.5rem',
    fontSize: 'var(--text-base, 0.875rem)',
    fontWeight: 500,
    color: '#FFFFFF',
    backgroundColor: 'var(--color-accent, #4F46E5)',
    border: 'none',
    borderRadius: 'var(--radius-md, 8px)',
    cursor: 'pointer',
    transition: 'background-color 200ms',
  },
};

export default ErrorBoundary;
