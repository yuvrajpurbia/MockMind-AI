import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingFallback from './components/ui/LoadingFallback';

const Home = lazy(() => import('./pages/Home'));
const Interview = lazy(() => import('./pages/Interview'));
const Report = lazy(() => import('./pages/Report'));
const AIDemo = lazy(() => import('./pages/AIDemo'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />} key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/demo" element={<AIDemo />} />
          <Route path="/interview/:sessionId" element={<Interview />} />
          <Route path="/report/:reportId" element={<Report />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
