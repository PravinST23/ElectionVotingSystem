import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import OfficialPanel from './pages/OfficialPanel';
import VoterPanel from './pages/VoterPanel';
import Login from './components/Login';
import Register from './components/Register';
import VoterRegistration from './components/VoterRegistration';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import AddParty from './components/AddParty';
import CandidateRegistration from './components/CandidateRegistration';
import ElectionManagement from './components/ElectionManagement';
import ElectionAnalytics from './components/ElectionAnalytics';
import PartyManagement from './components/PartyManagement';
import OfficialRegistration from './components/OfficialRegistration';
import VoterProfile from './components/VoterProfile';
import VoterHistory from './components/VoterHistory';
import ForgotPassword from './components/ForgetPassword';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="/voter-register" element={<VoterRegistration />} />
        <Route path="/official-register" element={<OfficialRegistration />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/official" element={<OfficialPanel />} />
        <Route path="/voter" element={<VoterPanel />} />
        <Route path="/official/add-party" element={<AddParty />} />
        <Route path="/official/candidate-registration" element={<CandidateRegistration />} />
        <Route path="/official/election-management" element={<ElectionManagement />} />
        <Route path="/analytics" element={<ElectionAnalytics />} />
        <Route path="/official/party-management" element={<PartyManagement />} />
        <Route path="/voter/profile" element={<VoterProfile />} />
        <Route path="/voter/history" element={<VoterHistory />} />
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;