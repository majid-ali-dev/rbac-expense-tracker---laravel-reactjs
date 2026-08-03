import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Roles from './pages/roles/Roles';
import Permissions from './pages/permissions/Permissions';
import RolePermissions from './pages/role-permissions/RolePermissions';
import Users from './pages/users/Users';
import UserProfile from './pages/users/UserProfile';
import Categories from './pages/categories/Categories';
import Expenses from './pages/expenses/Expenses';
import ViewExpenses from './components/expenses/ViewExpenses';
import Payments from './pages/payments/Payments';
import AddPayment from './pages/payments/AddPayment';
import ProtectedRoute from './components/layout/ProtectedRoute';
import NotificationManagement from './components/dashboard/notification/NotificationManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/role-permissions" element={<RolePermissions />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expenses/view" element={<ViewExpenses />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/:id/add" element={<AddPayment />} />
          <Route path="/notifications" element={<NotificationManagement />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;