import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import OfficialDashboard from '../components/OfficialDashboard';

function OfficialPanel() {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== 'Official') {
    return <Navigate to="/login" />;
  }

  return <OfficialDashboard />;
}

export default OfficialPanel;