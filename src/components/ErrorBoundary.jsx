import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/button.jsx';
import { Card, CardContent } from './ui/card.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-8">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground mb-6">
                  We encountered an unexpected error. This has been logged and our team will investigate.
                </p>
                
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-muted p-4 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold mb-2">Error Details (Development Only):</h3>
                    <pre className="text-sm overflow-auto max-h-48">
                      {this.state.error && this.state.error.toString()}
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
                
                <div className="flex gap-3 justify-center">
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <ArrowPathIcon className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/'}
                  >
                    Go to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;