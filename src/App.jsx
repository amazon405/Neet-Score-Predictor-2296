import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

// Lazy load components to improve performance
const RankPredictor = lazy(() => import('./components/RankPredictor'));
const CollegePredictor = lazy(() => import('./components/CollegePredictor'));
const CutoffAnalysis = lazy(() => import('./components/CutoffAnalysis'));
const AdminApp = lazy(() => import('./components/AdminApp'));
const AdminSetup = lazy(() => import('./components/AdminSetup'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminApp />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/setup" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminSetup />
              </Suspense>
            } 
          />
          
          {/* Main Application Routes */}
          <Route 
            path="/*" 
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Header />
                <motion.main
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="container mx-auto px-4 py-8"
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<RankPredictor />} />
                      <Route path="/college-predictor" element={<CollegePredictor />} />
                      <Route path="/cutoff-analysis" element={<CutoffAnalysis />} />
                    </Routes>
                  </Suspense>
                </motion.main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;