import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import VoterDashboard from '../components/VoterDashboard';

function VoterPanel() {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== 'Voter') {
    return <Navigate to="/login" />;
  }

  return <VoterDashboard />;
}

export default VoterPanel;