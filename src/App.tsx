import React from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/settings/ProductManagement';
import Settings from './components/Settings';
import UsersSettings from './components/settings/UsersSettings';
import TeamsSettings from './components/settings/TeamsSettings';
import LanguageSettings from './components/settings/LanguageSettings';
import ThemeSettings from './components/settings/ThemeSettings';
import AppNavbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <AppNavbar />
    {children}
  </>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <Routes>
                      <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              </PrivateRoute>
            }
          />
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Settings />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            >
              <Route path="users" element={<UsersSettings />} />
              <Route path="teams" element={<TeamsSettings />} />
              <Route path="language" element={<LanguageSettings />} />
              <Route path="theme" element={<ThemeSettings />} />
              <Route path="products" element={<ProductManagement />} />
              {/* Add more nested settings routes here */}
            </Route>
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
          </Routes>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
