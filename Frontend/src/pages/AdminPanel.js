import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';

function AdminPanel() {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" />;
  }

  return <AdminDashboard />;
}

export default AdminPanel;