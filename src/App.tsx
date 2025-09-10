import React, { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

// Lazy load components
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));
const AppNavbar = lazy(() => import('./components/Navbar'));

// Lazy load settings components
const ProductManagement = lazy(() => import('./components/settings/ProductManagement'));
const UsersSettings = lazy(() => import('./components/settings/UsersSettings'));
const TeamsSettings = lazy(() => import('./components/settings/TeamsSettings'));
const LanguageSettings = lazy(() => import('./components/settings/LanguageSettings'));
const ThemeSettings = lazy(() => import('./components/settings/ThemeSettings'));

// Lazy load team invitation component
const TeamInvitation = lazy(() => import('./components/TeamInvitation'));

// Debug component
const UserDebug = lazy(() => import('./components/debug/UserDebug'));

const PrivateRoute = React.memo(({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
});

const AuthenticatedLayout = React.memo(({ children }: { children: React.ReactNode }) => (
  <>
    <Suspense fallback={<LoadingSpinner text="Loading navigation..." centered />}>
      <AppNavbar />
    </Suspense>
    {children}
  </>
));

const PageLoader = React.memo(() => (
  <LoadingSpinner text="Loading page..." centered />
));

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                
                {/* Team invitation route - no authentication required */}
                <Route 
                  path="/team-invitation" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <TeamInvitation />
                    </Suspense>
                  } 
                />
                
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <AuthenticatedLayout>
                        <Suspense fallback={<PageLoader />}>
                          <Dashboard />
                        </Suspense>
                      </AuthenticatedLayout>
                    </PrivateRoute>
                  }
                />
                <Route 
                  path="/settings" 
                  element={
                    <PrivateRoute>
                      <AuthenticatedLayout>
                        <Suspense fallback={<PageLoader />}>
                          <Settings />
                        </Suspense>
                      </AuthenticatedLayout>
                    </PrivateRoute>
                  }
                >
                  <Route path="users" element={
                    <Suspense fallback={<PageLoader />}>
                      <UsersSettings />
                    </Suspense>
                  } />
                  <Route path="teams" element={
                    <Suspense fallback={<PageLoader />}>
                      <TeamsSettings />
                    </Suspense>
                  } />
                  <Route path="language" element={
                    <Suspense fallback={<PageLoader />}>
                      <LanguageSettings />
                    </Suspense>
                  } />
                  <Route path="theme" element={
                    <Suspense fallback={<PageLoader />}>
                      <ThemeSettings />
                    </Suspense>
                  } />
                  <Route path="products" element={
                    <Suspense fallback={<PageLoader />}>
                      <ProductManagement />
                    </Suspense>
                  } />
                  <Route path="debug" element={
                    <Suspense fallback={<PageLoader />}>
                      <UserDebug />
                    </Suspense>
                  } />
                </Route>
                <Route 
                  path="/" 
                  element={
                    <PrivateRoute>
                      <AuthenticatedLayout>
                        <Suspense fallback={<PageLoader />}>
                          <Dashboard />
                        </Suspense>
                      </AuthenticatedLayout>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Suspense>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
