import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Roles from './pages/roles/Roles';
import Permissions from './pages/permissions/Permissions';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px 24px', // Increased padding
            borderRadius: '12px',
            fontSize: '15px', // Increased font size
            maxWidth: '500px', // Increased max width
            minWidth: '300px', // Minimum width
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
          success: {
            duration: 4000,
            style: {
              background: '#22c55e',
              color: '#fff',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '15px',
              maxWidth: '500px',
              minWidth: '300px',
              boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#22c55e',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
              color: '#fff',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '15px',
              maxWidth: '500px',
              minWidth: '300px',
              boxShadow: '0 10px 40px rgba(239, 68, 68, 0.3)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;