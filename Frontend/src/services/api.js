import axios from 'axios';

const API_URL = 'https://localhost:7252/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token being sent:', token);
      try {
        const decoded = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        console.log('Decoded token:', decoded);
        const role =
          decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          decoded.role ||
          'No roles found';
        console.log('Roles in token:', role);
        console.log('Email in token:', decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 'No email');
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    } else {
      console.warn('No token found in localStorage');
    }
    console.log('Request Method:', config.method.toUpperCase());
    console.log('Request URL:', `${API_URL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status, response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      console.error('403 Forbidden: Check role or token');
      console.error('Request URL:', error.config.url);
      console.error('Response data:', error.response.data || 'No additional data');
      console.error('Headers:', error.response.headers);
    } else if (error.response?.status === 401) {
      console.warn('401 Unauthorized: Clearing token and redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      console.error('API error:', error.response?.status, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Existing API functions...
export const login = (data) => api.post('/Auth/login', data).then((res) => res.data);
export const register = (data) => api.post('/Auth/register', data).then((res) => res.data);
export const registerVoter = (data) => api.post('/Voter/register', data).then((res) => res.data);
export const getAuditLogs = () => api.get('/Audit').then((res) => res.data);
export const getCandidates = () =>
  api.get('/Candidate/voter').then((res) => {
    console.log('getCandidates response:', res.data);
    return res.data;
  });
export const addCandidate = (data) => api.post('/Candidate', data).then((res) => res.data);
export const registerCandidate = (data) => api.post('/Candidate/register', data).then((res) => res.data);
export const getElections = () => api.get('/Election').then((res) => res.data);
export const createElection = (data) => api.post('/Election', data).then((res) => res.data);
export const updateElectionStatus = (id, status) =>
  api.put(`/Election/${id}/status`, `"${status}"`).then((res) => res.data);
export const deleteElection = (id) => api.delete(`/Election/${id}`).then((res) => res.data);
export const castVote = (data) => api.post('/Vote', data).then((res) => res.data);
export const getVoters = () => api.get('/Voter').then((res) => res.data);
export const addVoter = (data) => api.post('/Voter', data).then((res) => res.data);
export const approveVoter = (id) => api.put(`/Voter/${id}/approve`).then((res) => res.data);
export const rejectVoter = (id) => api.put(`/Voter/${id}/reject`).then((res) => res.data);
export const updateVoter = (id, data) => api.put(`/Voter/${id}`, data).then((res) => res.data);
export const getOfficials = () => api.get('/Official').then((res) => res.data);
export const approveOfficial = (id) => api.put(`/Official/${id}/approve`).then((res) => res.data);
export const rejectOfficial = (id) => api.put(`/Official/${id}/reject`).then((res) => res.data);
export const registerOfficial = (data) => api.post('/Candidate/registerOfficial', data).then((res) => res.data);
export const getParties = () => api.get('/PoliticalParty').then((res) => res.data);
export const addParty = (data) => api.post('/PoliticalParty', data).then((res) => res.data);
export const updateParty = (id, data) => api.put(`/PoliticalParty/${id}`, data).then((res) => res.data);
export const deleteParty = (id) => api.delete(`/PoliticalParty/${id}`).then((res) => res.data);
export const getElectionResults = (id) => api.get(`/Election/${id}/results`).then((res) => res.data);
export const getVoterProfile = () => api.get('/Voter/me').then((res) => res.data);
export const getVoterElections = () =>
  api.get('/Election/voter').then((res) => {
    console.log('getVoterElections response:', res.data);
    return res.data;
  });
  export const updateVoterPassword = async (voterID, passwordData) => {
    const response = await api.put(`/Voter/${voterID}/password`, passwordData);
    return response.data;
  };

// Added function for voting history
export const getVoterVotingHistory = () =>
  api.get('/Vote/history').then((res) => {
    console.log('getVoterVotingHistory response:', res.data);
    return res.data;
  });

  export const getVoterStatistics = () =>
    api.get('/Voter/statistics').then((res) => {
      console.log('getVoterStatistics response:', res.data);
      return res.data;
    });