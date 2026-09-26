import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminRouteGuard from './components/AdminRouteGuard';
import ProtectedRoute from './components/ProtectedRoute';

// High-performance code-splitting: Lazy load pages to drastically reduce initial JS load & lag
const JSTULandingPage = lazy(() => import('./pages/JSTULandingPage'));
const CommitteesPage = lazy(() => import('./pages/CommitteesPage'));
const MemberDetailPage = lazy(() => import('./pages/MemberDetailPage'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));
const AdminCMSPanel = lazy(() => import('./pages/AdminCMSPanel'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Legacy / Auxiliary Pages (split separately so they never bloat main bundle)
const Homepage = lazy(() => import('./pages/Homepage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SavedPostsPage = lazy(() => import('./pages/SavedPostsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const PastEventDetailPage = lazy(() => import('./pages/PastEventDetailPage'));
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage'));
const CommentsPage = lazy(() => import('./pages/CommentsPage'));
const DebugPage = lazy(() => import('./pages/DebugPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const SocialPage = lazy(() => import('./pages/SocialPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));

// Sleek loading animation during route transitions
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] flex flex-col items-center justify-center p-4">
    <div className="relative">
      <div className="w-14 h-14 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
      </div>
    </div>
    <span className="mt-4 text-xs font-mono font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
      Loading Module...
    </span>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* JSTU Robotics Club Core Routes */}
        <Route path="/" element={<JSTULandingPage />} />
        <Route path="/committees" element={<CommitteesPage />} />
        <Route path="/committees/:id" element={<CommitteesPage />} />
        <Route path="/members/:id" element={<MemberDetailPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRouteGuard><AdminCMSPanel /></AdminRouteGuard>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/join" element={<Navigate to="/" state={{ scrollTo: 'join' }} replace />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Legacy / Auxiliary Routes */}
        <Route path="/legacy-home" element={<Homepage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/saved-posts" element={<SavedPostsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/news/:id" element={<ArticlePage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/past-events/:id" element={<PastEventDetailPage />} />
        <Route path="/resource/:id" element={<ResourceDetailPage />} />
        <Route path="/comments/:type/:id" element={<CommentsPage />} />
        <Route path="/debug" element={<DebugPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/resources" element={<ResourcesPage />} />

        {/* Dynamic 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;