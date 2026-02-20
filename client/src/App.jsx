import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingFallback from './components/ui/LoadingFallback';

const Home = lazy(() => import('./pages/Home'));
const Interview = lazy(() => import('./pages/Interview'));
const Report = lazy(() => import('./pages/Report'));
const AIDemo = lazy(() => import('./pages/AIDemo'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/demo" element={<AIDemo />} />
              <Route path="/interview/:sessionId" element={<Interview />} />
              <Route path="/report/:reportId" element={<Report />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
