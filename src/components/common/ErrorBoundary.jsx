// src/components/common/ErrorBoundary.jsx — Section 23 spec
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F1F8E9]">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2 text-center">
            कुछ गड़बड़ हो गई
          </h1>
          <p className="text-base text-[#4A4A4A] mb-6 text-center" style={{ lineHeight: 1.75 }}>
            ऐप को दोबारा खोलने की कोशिश करें
          </p>
          <button
            onClick={this.handleRetry}
            className="farmer-button px-8 py-4 text-lg"
            id="error-retry-btn"
          >
            दोबारा कोशिश करें
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
