import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Intentionally left blank: can be hooked to logging/reporting service
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
          <div className="text-center">
            <div className="mb-2 text-red-600">⚠️ 出现错误</div>
            <p className="mb-4 text-gray-600 text-sm">{this.state.error?.message || "未知错误"}</p>
            <button
              className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
              onClick={() => this.setState({ hasError: false, error: undefined })}
              type="button"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
