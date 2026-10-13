import { Component } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button.jsx';

/**
 * Keeps one broken screen from taking down the whole app.
 * Production users see a friendly recovery card — never a stack trace.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Hook a monitoring service (Sentry etc.) here in production.
    if (import.meta.env.DEV) console.error('UI error boundary:', error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertOctagon className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-lg font-semibold">Something went wrong on this screen</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your data is safe. Try reloading the page — if the problem continues, contact platform support.
          </p>
          {import.meta.env.DEV ? (
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
              {String(error?.message || error)}
            </pre>
          ) : null}
          <div className="mt-5 flex justify-center gap-2">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" /> Reload page
            </Button>
            <Button variant="outline" onClick={() => this.setState({ error: null })}>Try again</Button>
          </div>
        </div>
      </div>
    );
  }
}
