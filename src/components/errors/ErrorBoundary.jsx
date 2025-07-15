import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In a real app, you would log this to a service like Sentry or DataDog
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white p-8 rounded-lg shadow-xl max-w-lg w-full"
          >
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">Oops, something went wrong.</h1>
            <p className="text-slate-600 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <details className="mb-6 text-left bg-slate-50 p-3 rounded-md">
              <summary className="cursor-pointer text-sm text-slate-500">Error Details</summary>
              <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-40">
                {this.state.error?.toString()}
              </pre>
            </details>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}