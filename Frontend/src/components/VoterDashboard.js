// import React, { useEffect, useState, useContext, useRef } from 'react';
// import {
//   Container, Typography, Grid, Button, Paper, Box, TextField, Card, CardContent, CardMedia, CardActions,
//   IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Tooltip,
//   Chip, InputAdornment, Tabs, Tab, LinearProgress, Avatar, Badge
// } from '@mui/material';
// import {
//   HowToVote, Search, Refresh, FilterList, Visibility, CheckCircle, Cancel, 
//   History, AccountCircle, Ballot, CalendarToday, InfoOutlined, NotificationsActive
// } from '@mui/icons-material';
// import { AuthContext } from '../context/AuthContext';
// import { getVoterElections, getCandidates, castVote, getVoterProfile } from '../services/api';
// import signalRService from '../services/signalr';
// import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// function VoterDashboard() {
//   const { user, token } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [elections, setElections] = useState([]);
//   const [candidates, setCandidates] = useState([]);
//   const [voterId, setVoterId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [tabValue, setTabValue] = useState(0);
//   const [openVoteDialog, setOpenVoteDialog] = useState(false);
//   const [selectedElection, setSelectedElection] = useState(null);
//   const [voteLoading, setVoteLoading] = useState(false);
//   const [voterProfile, setVoterProfile] = useState(null);
//   const [viewConfirmation, setViewConfirmation] = useState(false);
//   const [selectedCandidate, setSelectedCandidate] = useState(null);
//   const [electionSessions, setElectionSessions] = useState({});
//   const [hasVoted, setHasVoted] = useState({});
//   const confirmButtonRef = useRef(null);

//   useEffect(() => {
//     fetchVoterData();
//     setupSignalR();
//     return () => cleanupSignalR();
//   }, [token]);

//   const fetchVoterData = async () => {
//     if (!token) {
//       toast.error('Please log in to view this page', { position: 'top-center' });
//       setElections([]);
//       return;
//     }
  
//     setLoading(true);
//     try {
//       const voterProfile = await getVoterProfile();
//       console.log('Voter Profile:', voterProfile);
//       if (!voterProfile?.voterID) throw new Error('Voter profile not found');
//       setVoterId(voterProfile.voterID);
//       setVoterProfile(voterProfile);
  
//       const electionData = await getVoterElections();
//       console.log('Raw election data:', electionData);
//       const electionArray = Array.isArray(electionData) ? electionData : [];
//       setElections(electionArray.map(e => ({
//         ...e,
//         name: e.name || 'Unnamed Election'
//       })));

//       // Fetch election sessions
//       const sessionPromises = electionArray.map(election =>
//         axios.get(`https://localhost:7252/api/Election/${election.electionID}/session`, {
//           headers: { Authorization: `Bearer ${token}` }
//         }).then(response => {
//           console.log(`Session for Election ${election.electionID}:`, response.data);
//           return response;
//         }).catch(error => {
//           console.error(`Failed to fetch session for Election ${election.electionID}:`, error.response?.data || error.message);
//           return { data: null };
//         })
//       );
//       const sessionResponses = await Promise.all(sessionPromises);
//       const sessions = sessionResponses.reduce((acc, response, index) => {
//         if (response.data) {
//           acc[electionArray[index].electionID] = response.data;
//         } else {
//           console.warn(`No session data for Election ${electionArray[index].electionID}`);
//         }
//         return acc;
//       }, {});
//       setElectionSessions(sessions);
//       console.log('Election Sessions:', sessions);

//       // Fetch voting history for the voter
//       const voteHistoryPromises = electionArray.map(election =>
//         axios.get(`https://localhost:7252/api/Vote/voter/${voterProfile.voterID}/election/${election.electionID}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         }).then(response => {
//           console.log(`Vote check for Election ${election.electionID}:`, response.data);
//           return { electionId: election.electionID, hasVoted: response.data.hasVoted || false };
//         }).catch(error => {
//           console.error(`Failed to fetch vote for Election ${election.electionID}:`, error.response?.data || error.message);
//           return { electionId: election.electionID, hasVoted: false };
//         })
//       );
//       const voteHistoryResponses = await Promise.all(voteHistoryPromises);
//       const voteStatus = voteHistoryResponses.reduce((acc, { electionId, hasVoted }) => {
//         acc[electionId] = hasVoted;
//         return acc;
//       }, {});
//       setHasVoted(voteStatus);
//       console.log('Has Voted Status:', voteStatus);

//       // Fetch candidates with enhanced error handling
//       const candidatesData = await getCandidates();
//       console.log('Raw candidates data:', JSON.stringify(candidatesData, null, 2));
//       let candidatesArray = [];
//       if (Array.isArray(candidatesData)) {
//         candidatesArray = candidatesData;
//       } else if (candidatesData?.candidates && Array.isArray(candidatesData.candidates)) {
//         candidatesArray = candidatesData.candidates;
//       } else {
//         console.warn('Candidates data is not in expected format:', candidatesData);
//         toast.error('Failed to load candidates data correctly', { position: 'top-center' });
//       }
//       setCandidates(candidatesArray.map(c => ({
//         ...c,
//         candidateID: c.candidateID || c.CandidateID, // Handle case sensitivity
//         firstName: c.firstName || c.FirstName || 'Unknown',
//         lastName: c.lastName || c.LastName || '',
//         electionID: c.electionID || c.ElectionID,
//         party: c.party || c.Party || { partyName: 'Independent' },
//         description: c.description || c.Description || '',
//         imageUrl: c.imageUrl || c.ImageUrl || null,
//         voteCount: c.voteCount || c.VoteCount || 0
//       })));
//       console.log('Processed candidates:', candidatesArray);
//     } catch (error) {
//       console.error('Fetch error:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to load voter data';
//       toast.error(errorMessage, { position: 'top-center' });
//       setElections([]);
//       setCandidates([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const decodeToken = (token) => {
//     try {
//       const base64Url = token.split('.')[1];
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       const jsonPayload = decodeURIComponent(
//         atob(base64)
//           .split('')
//           .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//           .join('')
//       );
//       const decoded = JSON.parse(jsonPayload);
//       const email =
//         decoded.email ||
//         decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
//         decoded['Email'] ||
//         null;
//       const role =
//         decoded.role ||
//         decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
//         null;
//       return { email, role };
//     } catch (error) {
//       console.error('Token decoding failed:', error);
//       return { email: null, role: null };
//     }
//   };

//   const setupSignalR = () => {
//     signalRService.onElectionStatusUpdate((electionId, status) => {
//       setElections((prev) =>
//         prev.map((e) => (e.electionID === electionId ? { ...e, status } : e))
//       );
//       toast.info(`Election ${electionId} status updated: ${status}`, { position: 'top-center' });
//     });

//     signalRService.onVoteUpdate((electionId, candidateId, voteCount) => {
//       setCandidates((prev) =>
//         prev.map((c) => (c.candidateID === candidateId && c.electionID === electionId ? { ...c, voteCount } : c))
//       );
//       toast.success(`Vote count updated for Candidate ${candidateId} in Election ${electionId}: ${voteCount}`, { position: 'top-center' });
//     });
//   };

//   const cleanupSignalR = () => {
//     signalRService.connection.off('ReceiveElectionStatusUpdate');
//     signalRService.connection.off('ReceiveVoteUpdate');
//   };

//   if (user?.role !== 'Voter') {
//     return (
//       <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
//         <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(to right, #f5f5f5, #e0e0e0)', border: '1px solid #d0d0d0' }}>
//           <Cancel color="error" sx={{ fontSize: 60 }} />
//           <Typography variant="h4" sx={{ mt: 2, color: '#d32f2f' }}>
//             Access Restricted
//           </Typography>
//           <Typography variant="body1" sx={{ mt: 2 }}>
//             You must be a registered voter to access this dashboard.
//           </Typography>
//           <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 3 }}>
//             Return to Login
//           </Button>
//         </Paper>
//       </Container>
//     );
//   }

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handleSearch = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   const handleOpenVoteDialog = (election) => {
//     console.log('Opening vote dialog for election:', election);
//     const session = electionSessions[election.electionID];
//     if (!session || session.sessionStatus !== 'Active' || new Date(session.startTime) > new Date() || new Date(session.endTime) < new Date()) {
//       toast.error('No active voting session available for this election.', { position: 'top-center' });
//       return;
//     }
//     if (hasVoted[election.electionID]) {
//       toast.error('You have already voted in this election.', { position: 'top-center' });
//       return;
//     }
//     setSelectedElection(election);
//     setOpenVoteDialog(true);
//     setSelectedCandidate(null);
//   };

//   const handleCloseVoteDialog = () => {
//     setOpenVoteDialog(false);
//     setSelectedElection(null);
//     setSelectedCandidate(null);
//     setViewConfirmation(false);
//     setTimeout(() => document.querySelector('body')?.focus(), 0);
//   };

//   const handleSelectCandidate = (candidate) => {
//     console.log('Selected candidate:', candidate);
//     setSelectedCandidate(candidate);
//   };

//   const handleConfirmVote = () => {
//     if (!selectedCandidate) {
//       toast.error('Please select a candidate first', { position: 'top-center' });
//       return;
//     }
//     console.log('Confirming vote for:', selectedCandidate);
//     setViewConfirmation(true);
//     setTimeout(() => confirmButtonRef.current?.focus(), 0);
//   };

//   const handleCastVote = async () => {
//     if (!voterId || !selectedElection || !selectedCandidate) {
//       toast.error('Unable to cast vote: Missing required data', { position: 'top-center' });
//       console.error('Missing vote data:', { voterId, selectedElection, selectedCandidate });
//       return;
//     }

//     const session = electionSessions[selectedElection.electionID];
//     if (!session || session.sessionStatus !== 'Active' || new Date(session.startTime) > new Date() || new Date(session.endTime) < new Date()) {
//       toast.error('Voting session is not active.', { position: 'top-center' });
//       setViewConfirmation(false);
//       handleCloseVoteDialog();
//       return;
//     }

//     if (hasVoted[selectedElection.electionID]) {
//       toast.error('You have already voted in this election.', { position: 'top-center' });
//       setViewConfirmation(false);
//       handleCloseVoteDialog();
//       return;
//     }

//     setVoteLoading(true);
//     try {
//       const voteData = { 
//         voterID: voterId, 
//         candidateID: selectedCandidate.candidateID, 
//         electionID: selectedElection.electionID 
//       };
//       console.log('Casting vote with data:', voteData);
//       const response = await castVote(voteData);
//       console.log('Vote response:', response);
//       toast.success('Vote cast successfully! Your vote has been recorded securely.', { position: 'top-center' });
//       setHasVoted(prev => ({ ...prev, [selectedElection.electionID]: true }));
//       setViewConfirmation(false);
//       handleCloseVoteDialog();
//       fetchVoterData(); // Refresh data to sync with backend
//     } catch (error) {
//       console.error('Vote error:', error);
//       const errorMessage = error.response?.data?.message || error.response?.data?.Message || 'Failed to cast vote';
//       toast.error(errorMessage, { position: 'top-center' });
//     } finally {
//       setVoteLoading(false);
//     }
//   };

//   const filteredElections = elections.filter((election) =>
//     (election.name || '').toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Active': return 'success';
//       case 'Inactive': return 'error';
//       case 'Pending': return 'warning';
//       case 'Completed': return 'info';
//       default: return 'default';
//     }
//   };

//   const getRemainingTime = (endDate) => {
//     const end = new Date(endDate);
//     const now = new Date();
//     const diffMs = end - now;
    
//     if (diffMs <= 0) return "Ended";
    
//     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//     const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
//     if (diffDays > 0) {
//       return `${diffDays}d ${diffHrs}h remaining`;
//     } else {
//       return `${diffHrs}h remaining`;
//     }
//   };

//   const isVotingSessionActive = (electionId) => {
//     const session = electionSessions[electionId];
//     if (!session) {
//       console.log(`No session found for Election ${electionId}`);
//       return false;
//     }

//     const isActive = session.sessionStatus === 'Active';
//     const now = new Date();
//     const start = new Date(session.startTime);
//     const end = new Date(session.endTime);
//     const withinTime = start <= now && end >= now;

//     console.log(`Session check for Election ${electionId}: Status=${session.sessionStatus}, Start=${start}, End=${end}, Now=${now}, Active=${isActive && withinTime}`);

//     return isActive && withinTime;
//   };

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #3f51b5 0%, #1a237e 100%)' }} elevation={4}>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56, mr: 2 }}>
//               {voterProfile?.firstName?.charAt(0) || 'V'}
//             </Avatar>
//             <Box>
//               <Typography variant="h5" component="h1" sx={{ color: 'white', fontWeight: 'bold' }}>
//                 नमस्ते, {voterProfile?.firstName || 'Voter'}!
//               </Typography>
//               <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9 }}>
//                 Welcome to the Indian Election System
//               </Typography>
//             </Box>
//           </Box>
//           <Box sx={{ display: 'flex', gap: 2 }}>
//             <Button 
//               variant="contained" 
//               color="secondary" 
//               startIcon={<History />}
//               onClick={() => navigate('/voter/history')}
//               sx={{ bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
//             >
//               Voting History
//             </Button>
//             <Button 
//               variant="contained" 
//               startIcon={<AccountCircle />}
//               onClick={() => navigate('/voter/profile')}
//               sx={{ bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
//             >
//               My Profile
//             </Button>
//           </Box>
//         </Box>
//       </Paper>

//       <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={3}>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//           <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', color: '#333' }}>
//             <Ballot sx={{ mr: 1, color: '#3f51b5' }} /> 
//             Available Elections
//           </Typography>
//           <Badge badgeContent={elections.filter(e => e.status === 'Active' && isVotingSessionActive(e.electionID)).length} color="error">
//             <Chip 
//               icon={<NotificationsActive />} 
//               label="Active Elections" 
//               color="primary" 
//               variant="outlined" 
//               sx={{ fontWeight: 'bold' }} 
//             />
//           </Badge>
//         </Box>

//         <Box sx={{ mb: 3 }}>
//           <Tabs 
//             value={tabValue} 
//             onChange={handleTabChange} 
//             variant="fullWidth"
//             sx={{ 
//               '& .MuiTab-root': { fontWeight: 'bold' },
//               '& .Mui-selected': { color: '#3f51b5' },
//               '& .MuiTabs-indicator': { backgroundColor: '#3f51b5', height: 3 }
//             }}
//           >
//             <Tab label="All Elections" icon={<Ballot />} iconPosition="start" />
//             <Tab 
//               label="Active" 
//               icon={<CheckCircle color="success" />} 
//               iconPosition="start"
//               sx={{ color: tabValue === 1 ? 'success.main' : 'inherit' }} 
//             />
//             <Tab 
//               label="Upcoming" 
//               icon={<CalendarToday color="warning" />} 
//               iconPosition="start"
//               sx={{ color: tabValue === 2 ? 'warning.main' : 'inherit' }} 
//             />
//             <Tab 
//               label="Completed" 
//               icon={<InfoOutlined color="info" />} 
//               iconPosition="start"
//               sx={{ color: tabValue === 3 ? 'info.main' : 'inherit' }} 
//             />
//           </Tabs>
//         </Box>

//         <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
//           <TextField
//             variant="outlined"
//             placeholder="Search elections by name, type, or location..."
//             fullWidth
//             value={searchQuery}
//             onChange={handleSearch}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <Search color="primary" />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{ mr: 2, maxWidth: '500px' }}
//           />
//           <Button 
//             startIcon={<Refresh />} 
//             onClick={fetchVoterData} 
//             variant="outlined"
//             sx={{ borderRadius: 2 }}
//           >
//             Refresh
//           </Button>
//           <Button 
//             startIcon={<FilterList />} 
//             variant="outlined" 
//             sx={{ ml: 2, borderRadius: 2 }}
//           >
//             Filters
//           </Button>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 8 }}>
//             <CircularProgress size={60} thickness={4} />
//             <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
//               Loading elections...
//             </Typography>
//           </Box>
//         ) : filteredElections.length === 0 ? (
//           <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: 2 }}>
//             <Typography variant="h5" color="textSecondary" sx={{ mb: 2 }}>
//               No elections found
//             </Typography>
//             <Typography variant="body1" color="textSecondary">
//               {searchQuery ? 
//                 'Try adjusting your search query or filters' : 
//                 'There are no elections available for you at this time'
//               }
//             </Typography>
//             <Button 
//               variant="contained" 
//               color="primary" 
//               sx={{ mt: 3 }}
//               onClick={fetchVoterData}
//             >
//               Refresh Elections
//             </Button>
//           </Paper>
//         ) : (
//           <Grid container spacing={3}>
//             {filteredElections
//               .filter((election) => {
//                 if (tabValue === 0) return true;
//                 if (tabValue === 1) return election.status === 'Active' && isVotingSessionActive(election.electionID);
//                 if (tabValue === 2) return election.status === 'Pending';
//                 if (tabValue === 3) return election.status === 'Completed';
//                 return true;
//               })
//               .map((election) => (
//                 <Grid item xs={12} sm={6} md={4} key={election.electionID}>
//                   <Card 
//                     elevation={4} 
//                     sx={{ 
//                       borderRadius: 2, 
//                       transition: 'transform 0.2s, box-shadow 0.2s',
//                       '&:hover': { 
//                         transform: 'translateY(-4px)', 
//                         boxShadow: '0 8px 16px rgba(0,0,0,0.1)' 
//                       },
//                       height: '100%',
//                       display: 'flex',
//                       flexDirection: 'column'
//                     }}
//                   >
//                     <Box sx={{ position: 'relative' }}>
//                       <CardMedia
//                         component="img"
//                         height="160"
//                         image={election.imageUrl || 'https://media.istockphoto.com/id/1097228434/photo/close-up-of-human-hand-casting-and-inserting-a-vote-and-choosing-and-making-a-decision-what.jpg?s=612x612&w=0&k=20&c=gpO2ZzhWoj4wn6MzxlwclyAjBQh0LuMr5gAMCIzK9qM='}
//                         alt={election.name}
//                         sx={{ 
//                           height: 160, 
//                           width: '100%', 
//                           objectFit: 'contain', // Changed from 'cover' to 'contain'
//                           bgcolor: '#f0f0f0',
//                         }}
//                       />
//                       <Chip
//                         label={election.status}
//                         color={getStatusColor(election.status)}
//                         size="small"
//                         sx={{ 
//                           position: 'absolute', 
//                           top: 12, 
//                           right: 12, 
//                           fontWeight: 'bold',
//                           boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
//                         }}
//                       />
//                       {election.status === 'Active' && isVotingSessionActive(election.electionID) && (
//                         <Chip
//                           label={getRemainingTime(electionSessions[election.electionID]?.endTime || election.votingEndTime)}
//                           color="error"
//                           size="small"
//                           variant="outlined"
//                           sx={{ 
//                             position: 'absolute', 
//                             bottom: 12, 
//                             right: 12, 
//                             bgcolor: 'rgba(255,255,255,0.9)',
//                             fontWeight: 'bold',
//                             boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
//                           }}
//                         />
//                       )}
//                     </Box>
//                     <CardContent sx={{ flexGrow: 1 }}>
//                       <Typography 
//                         variant="h6" 
//                         component="div" 
//                         gutterBottom
//                         sx={{ 
//                           fontWeight: 'bold', 
//                           color: '#333',
//                           display: '-webkit-box',
//                           overflow: 'hidden',
//                           WebkitBoxOrient: 'vertical',
//                           WebkitLineClamp: 2
//                         }}
//                       >
//                         {election.name}
//                       </Typography>
//                       <Divider sx={{ my: 1.5 }} />
//                       <Typography 
//                         variant="body2" 
//                         color="text.secondary" 
//                         sx={{ 
//                           mb: 1.5,
//                           display: '-webkit-box',
//                           overflow: 'hidden',
//                           WebkitBoxOrient: 'vertical',
//                           WebkitLineClamp: 3,
//                           minHeight: '3em'
//                         }}
//                       >
//                         {election.description?.length > 100
//                           ? `${election.description.substring(0, 100)}...`
//                           : election.description || 'No description available'}
//                       </Typography>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
//                         <Box>
//                           <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: '#555' }}>
//                             <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: '#3f51b5' }} />
//                             <strong>Start:</strong> {new Date(election.votingStartTime).toLocaleDateString('en-IN')}
//                           </Typography>
//                           <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: '#555' }}>
//                             <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: '#f44336' }} />
//                             <strong>End:</strong> {new Date(election.votingEndTime).toLocaleDateString('en-IN')}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     </CardContent>
//                     <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
//                       <Button
//                         size="small"
//                         startIcon={<Visibility />}
//                         onClick={() => navigate(`/election/${election.electionID}`)}
//                         sx={{ color: '#3f51b5' }}
//                       >
//                         Details
//                       </Button>
//                       {election.status === 'Active' && isVotingSessionActive(election.electionID) ? (
//                         hasVoted[election.electionID] ? (
//                           <Button
//                             variant="outlined"
//                             color="secondary"
//                             size="small"
//                             sx={{ borderRadius: 4, px: 2 }}
//                           >
//                             Already Voted
//                           </Button>
//                         ) : (
//                           <Button
//                             variant="contained"
//                             color="primary"
//                             startIcon={<HowToVote />}
//                             onClick={() => handleOpenVoteDialog(election)}
//                             sx={{ 
//                               borderRadius: 4,
//                               px: 2,
//                               boxShadow: '0 4px 6px rgba(63, 81, 181, 0.2)',
//                               background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)'
//                             }}
//                           >
//                             Vote Now
//                           </Button>
//                         )
//                       ) : election.status === 'Active' && !electionSessions[election.electionID] ? (
//                         <Button
//                           variant="outlined"
//                           color="error"
//                           size="small"
//                           sx={{ borderRadius: 4, px: 2 }}
//                         >
//                           No Session
//                         </Button>
//                       ) : election.status === 'Active' ? (
//                         <Button
//                           variant="outlined"
//                           color="error"
//                           size="small"
//                           sx={{ borderRadius: 4, px: 2 }}
//                         >
//                           Session Inactive
//                         </Button>
//                       ) : election.status === 'Pending' ? (
//                         <Button
//                           variant="outlined"
//                           color="warning"
//                           size="small"
//                           sx={{ borderRadius: 4, px: 2 }}
//                         >
//                           Coming Soon
//                         </Button>
//                       ) : election.status === 'Completed' ? (
//                         <Button
//                           variant="outlined"
//                           color="info"
//                           size="small"
//                           onClick={() => navigate(`/results/${election.electionID}`)}
//                           sx={{ borderRadius: 4, px: 2 }}
//                         >
//                           View Results
//                         </Button>
//                       ) : null}
//                     </CardActions>
//                   </Card>
//                 </Grid>
//               ))}
//           </Grid>
//         )}
//       </Paper>

//       <Dialog 
//         open={openVoteDialog && !viewConfirmation} 
//         onClose={handleCloseVoteDialog} 
//         fullWidth 
//         maxWidth="md"
//         PaperProps={{ sx: { borderRadius: 2 } }}
//       >
//         <DialogTitle sx={{ 
//           background: 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)',
//           color: 'white',
//           py: 2,
//           display: 'flex',
//           alignItems: 'center'
//         }}>
//           <HowToVote sx={{ mr: 1.5, fontSize: 28 }} />
//           Cast Your Vote - {selectedElection?.name}
//         </DialogTitle>
//         <DialogContent dividers>
//           <Typography variant="body1" sx={{ mb: 3 }}>
//             Please select a candidate from the list below and click "Vote" to cast your ballot.
//             Your vote is secure and anonymous.
//           </Typography>
          
//           {selectedElection && candidates.length === 0 ? (
//             <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
//               No candidates data loaded. Please try refreshing the page.
//             </Typography>
//           ) : selectedElection && candidates.filter((c) => c.electionID === selectedElection.electionID).length === 0 ? (
//             <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
//               No candidates available for this election.
//             </Typography>
//           ) : (
//             <Grid container spacing={2}>
//               {selectedElection && candidates
//                 .filter((c) => c.electionID === selectedElection.electionID)
//                 .map((candidate) => (
//                   <Grid item xs={12} sm={6} key={candidate.candidateID}>
//                     <Card 
//                       sx={{ 
//                         p: 2, 
//                         cursor: 'pointer',
//                         borderRadius: 2,
//                         border: selectedCandidate?.candidateID === candidate.candidateID ? 
//                           '2px solid #3f51b5' : '1px solid #e0e0e0',
//                         boxShadow: selectedCandidate?.candidateID === candidate.candidateID ?
//                           '0 0 0 4px rgba(63, 81, 181, 0.2)' : 'none',
//                         transition: 'all 0.2s ease',
//                         bgcolor: selectedCandidate?.candidateID === candidate.candidateID ?
//                           'rgba(63, 81, 181, 0.05)' : 'white',
//                         '&:hover': {
//                           boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
//                         }
//                       }}
//                       onClick={() => handleSelectCandidate(candidate)}
//                     >
//                       <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
//                         <Avatar
//                           sx={{ 
//                             width: 60, 
//                             height: 60, 
//                             bgcolor: 'primary.main',
//                             mr: 2
//                           }}
//                           src={candidate.imageUrl}
//                         >
//                           {candidate.firstName?.charAt(0)}
//                         </Avatar>
//                         <Box>
//                           <Typography variant="h6">
//                             {`${candidate.firstName} ${candidate.lastName}`}
//                           </Typography>
//                           <Chip 
//                             label={candidate.party?.partyName || 'Independent'}
//                             size="small" 
//                             sx={{ 
//                               fontWeight: 'bold',
//                               bgcolor: candidate.party?.partyName ? 'rgba(63, 81, 181, 0.1)' : 'rgba(0, 0, 0, 0.08)'
//                             }} 
//                           />
//                         </Box>
//                       </Box>
                      
//                       <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
//                         {candidate.description || 'No candidate description available.'}
//                       </Typography>
                      
//                       {selectedElection.status === 'Completed' && candidate.voteCount !== undefined && (
//                         <Box sx={{ mt: 1 }}>
//                           <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                             <span>Current Votes:</span>
//                             <strong>{candidate.voteCount}</strong>
//                           </Typography>
//                           <LinearProgress
//                             variant="determinate"
//                             value={(candidate.voteCount / 100) * 100} // Adjust denominator based on total votes if available
//                             sx={{ mt: 1, height: 8, borderRadius: 4 }}
//                           />
//                         </Box>
//                       )}
//                     </Card>
//                   </Grid>
//                 ))}
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
//           <Button 
//             onClick={handleCloseVoteDialog} 
//             disabled={voteLoading}
//             variant="outlined"
//             color="inherit"
//             sx={{ borderRadius: 2 }}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<HowToVote />}
//             onClick={handleConfirmVote}
//             disabled={!selectedCandidate || voteLoading}
//             sx={{ 
//               borderRadius: 2,
//               px: 3,
//               background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)'
//             }}
//           >
//             Continue to Vote
//           </Button>
//           {voteLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
//         </DialogActions>
//       </Dialog>

//       <Dialog 
//         open={viewConfirmation} 
//         onClose={() => setViewConfirmation(false)}
//         PaperProps={{ sx: { borderRadius: 2 } }}
//         disableRestoreFocus
//       >
//         <DialogTitle sx={{ bgcolor: '#f5f5f5', color: '#333' }}>
//           Confirm Your Vote
//         </DialogTitle>
//         <DialogContent>
//           {selectedCandidate && (
//             <Box sx={{ py: 2 }}>
//               <Typography variant="body1" paragraph>
//                 You are about to cast your vote for:
//               </Typography>
              
//               <Box sx={{ 
//                 p: 3, 
//                 border: '1px solid #e0e0e0', 
//                 borderRadius: 2, 
//                 display: 'flex',
//                 alignItems: 'center',
//                 bgcolor: 'rgba(63, 81, 181, 0.05)'
//               }}>
//                 <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
//                   {selectedCandidate.firstName?.charAt(0)}
//                 </Avatar>
//                 <Box>
//                   <Typography variant="h6">
//                     {`${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     Party: {selectedCandidate.party?.partyName || 'Independent'}
//                   </Typography>
//                 </Box>
//               </Box>
              
//               <Typography variant="body1" sx={{ mt: 3, fontWeight: 'bold', color: '#d32f2f' }}>
//                 Important:
//               </Typography>
//               <Typography variant="body2" paragraph>
//                 • This action cannot be undone.
//               </Typography>
//               <Typography variant="body2" paragraph>
//                 • Your vote is secure and anonymous.
//               </Typography>
//               <Typography variant="body2" paragraph>
//                 • You can only vote once in this election.
//               </Typography>
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
//           <Button 
//             onClick={() => setViewConfirmation(false)} 
//             color="inherit"
//             variant="outlined"
//             sx={{ borderRadius: 2 }}
//           >
//             Go Back
//           </Button>
//           <Button 
//             onClick={handleCastVote} 
//             color="primary"
//             variant="contained"
//             disabled={voteLoading}
//             startIcon={voteLoading ? <CircularProgress size={20} /> : <HowToVote />}
//             sx={{ 
//               borderRadius: 2,
//               background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)'
//             }}
//             ref={confirmButtonRef}
//           >
//             Confirm Vote
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   );
// }

// export default VoterDashboard;

import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Container, Typography, Grid, Button, Paper, Box, TextField, Card, CardContent, CardMedia, CardActions,
  IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Tooltip,
  Chip, InputAdornment, Tabs, Tab, LinearProgress, Avatar, Badge
} from '@mui/material';
import {
  HowToVote, Search, Refresh, FilterList, Visibility, CheckCircle, Cancel,
  History, AccountCircle, Ballot, CalendarToday, InfoOutlined, NotificationsActive, Language
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { getVoterElections, getCandidates, castVote, getVoterProfile } from '../services/api';
import signalRService from '../services/signalr';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Dynamic translation function with language support
const dynamicTranslate = (text, language) => {
  const translations = {
    hi: new Map([
      ['Welcome to the Indian Election System', 'भारतीय चुनाव प्रणाली में आपका स्वागत है'],
      ['Available Elections', 'उपलब्ध चुनाव'],
      ['Active Elections', 'सक्रिय चुनाव'],
      ['All Elections', 'सभी चुनाव'],
      ['Active', 'सक्रिय'],
      ['Upcoming', 'आगामी'],
      ['Completed', 'पूर्ण'],
      ['Search elections by name, type, or location...', 'नाम, प्रकार या स्थान के आधार पर चुनाव खोजें...'],
      ['Refresh', 'ताज़ा करें'],
      ['Filters', 'फ़िल्टर'],
      ['Loading elections...', 'चुनाव लोड हो रहे हैं...'],
      ['No elections found', 'कोई चुनाव नहीं मिला'],
      ['Try adjusting your search query or filters', 'अपने खोज प्रश्न या फ़िल्टर को समायोजित करने का प्रयास करें'],
      ['There are no elections available for you at this time', 'इस समय आपके लिए कोई चुनाव उपलब्ध नहीं है'],
      ['Refresh Elections', 'चुनाव ताज़ा करें'],
      ['Details', 'विवरण'],
      ['Already Voted', 'पहले ही वोट दे चुके हैं'],
      ['Vote Now', 'अभी वोट करें'],
      ['No Session', 'कोई सत्र नहीं'],
      ['Session Inactive', 'सत्र निष्क्रिय'],
      ['Coming Soon', 'जल्द आ रहा है'],
      ['View Results', 'परिणाम देखें'],
      ['Cast Your Vote -', 'अपना वोट डालें -'],
      ['Please select a candidate from the list below and click "Vote" to cast your ballot. Your vote is secure and anonymous.', 'कृपया नीचे दिए गए सूची से एक उम्मीदवार का चयन करें और "वोट" पर क्लिक करें। आपका वोट सुरक्षित और गुमनाम है।'],
      ['No candidates data loaded. Please try refreshing the page.', 'कोई उम्मीदवार डेटा लोड नहीं हुआ। कृपया पेज को ताज़ा करने का प्रयास करें।'],
      ['No candidates available for this election.', 'इस चुनाव के लिए कोई उम्मीदवार उपलब्ध नहीं है।'],
      ['Cancel', 'रद्द करें'],
      ['Continue to Vote', 'वोट करने के लिए जारी रखें'],
      ['Confirm Your Vote', 'अपने वोट की पुष्टि करें'],
      ['You are about to cast your vote for:', 'आप निम्नलिखित के लिए वोट डालने जा रहे हैं:'],
      ['Important:', 'महत्वपूर्ण:'],
      ['• This action cannot be undone.', '• यह क्रिया पूर्ववत नहीं की जा सकती।'],
      ['• Your vote is secure and anonymous.', '• आपका वोट सुरक्षित और गुमनाम है।'],
      ['• You can only vote once in this election.', '• आप इस चुनाव में केवल एक बार वोट कर सकते हैं।'],
      ['Go Back', 'वापस जाएं'],
      ['Confirm Vote', 'वोट की पुष्टि करें'],
      ['Voting History', 'वोटिंग इतिहास'],
      ['My Profile', 'मेरा प्रोफ़ाइल'],
      ['Access Restricted', 'पहुंच प्रतिबंधित'],
      ['You must be a registered voter to access this dashboard.', 'इस डैशबोर्ड तक पहुँचने के लिए आपको पंजीकृत मतदाता होना चाहिए।'],
      ['Return to Login', 'लॉगिन पर वापस जाएं'],
      ['Start:', 'शुरुआत:'],
      ['End:', 'अंत:'],
      ['Current Votes:', 'वर्तमान वोट:'],
      ['Independent', 'स्वतंत्र'],
      ['No candidate description available.', 'कोई उम्मीदवार विवरण उपलब्ध नहीं है।'],
      ['No description available', 'कोई विवरण उपलब्ध नहीं'],
      ['Please log in to view this page', 'कृपया लॉगिन करें इस पृष्ठ को देखने के लिए'],
      ['Failed to load candidates data correctly', 'उम्मीदवार डेटा लोड करने में विफल'],
      ['Failed to load voter data', 'मतदाता डेटा लोड करने में विफल'],
      ['Unable to cast vote: Missing required data', 'वोट डालने में असमर्थ: आवश्यक डेटा गायब है'],
      ['No active voting session available for this election.', 'इस चुनाव के लिए कोई सक्रिय वोटिंग सत्र उपलब्ध नहीं है।'],
      ['You have already voted in this election.', 'आपने इस चुनाव में पहले ही वोट कर दिया है।'],
      ['Voting session is not active.', 'वोटिंग सत्र सक्रिय नहीं है।'],
      ['Vote cast successfully! Your vote has been recorded securely.', 'वोट सफलतापूर्वक डाला गया! आपका वोट सुरक्षित रूप से दर्ज कर लिया गया है।'],
      ['Failed to cast vote', 'वोट डालने में विफल'],
      ['Ended', 'समाप्त'],
      ['remaining', 'शेष'],
      ['Unnamed Election', 'नामहीन चुनाव'],
      ['Unknown', 'अज्ञात']
    ]),
    en: new Map() // English defaults to original text
  };

  return (translations[language] || translations['en']).get(text) || text;
};

function VoterDashboard() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voterId, setVoterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openVoteDialog, setOpenVoteDialog] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [voterProfile, setVoterProfile] = useState(null);
  const [viewConfirmation, setViewConfirmation] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [electionSessions, setElectionSessions] = useState({});
  const [hasVoted, setHasVoted] = useState({});
  const confirmButtonRef = useRef(null);
  const [language, setLanguage] = useState('en'); // Default language is English

  useEffect(() => {
    fetchVoterData();
    setupSignalR();
    return () => cleanupSignalR();
  }, [token]);

  const fetchVoterData = async () => {
    if (!token) {
      toast.error(dynamicTranslate('Please log in to view this page', language), { position: 'top-center' });
      setElections([]);
      return;
    }
  
    setLoading(true);
    try {
      const voterProfile = await getVoterProfile();
      console.log('Voter Profile:', voterProfile);
      if (!voterProfile?.voterID) throw new Error(dynamicTranslate('Voter profile not found', language));
      setVoterId(voterProfile.voterID);
      setVoterProfile(voterProfile);
  
      const electionData = await getVoterElections();
      console.log('Raw election data:', electionData);
      const electionArray = Array.isArray(electionData) ? electionData : [];
      setElections(electionArray.map(e => ({
        ...e,
        name: e.name || dynamicTranslate('Unnamed Election', language)
      })));

      // Fetch election sessions
      const sessionPromises = electionArray.map(election =>
        axios.get(`https://localhost:7252/api/Election/${election.electionID}/session`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
          console.log(`Session for Election ${election.electionID}:`, response.data);
          return response;
        }).catch(error => {
          console.error(`Failed to fetch session for Election ${election.electionID}:`, error.response?.data || error.message);
          return { data: null };
        })
      );
      const sessionResponses = await Promise.all(sessionPromises);
      const sessions = sessionResponses.reduce((acc, response, index) => {
        if (response.data) {
          acc[electionArray[index].electionID] = response.data;
        } else {
          console.warn(`No session data for Election ${electionArray[index].electionID}`);
        }
        return acc;
      }, {});
      setElectionSessions(sessions);
      console.log('Election Sessions:', sessions);

      // Fetch voting history for the voter
      const voteHistoryPromises = electionArray.map(election =>
        axios.get(`https://localhost:7252/api/Vote/voter/${voterProfile.voterID}/election/${election.electionID}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
          console.log(`Vote check for Election ${election.electionID}:`, response.data);
          return { electionId: election.electionID, hasVoted: response.data.hasVoted || false };
        }).catch(error => {
          console.error(`Failed to fetch vote for Election ${election.electionID}:`, error.response?.data || error.message);
          return { electionId: election.electionID, hasVoted: false };
        })
      );
      const voteHistoryResponses = await Promise.all(voteHistoryPromises);
      const voteStatus = voteHistoryResponses.reduce((acc, { electionId, hasVoted }) => {
        acc[electionId] = hasVoted;
        return acc;
      }, {});
      setHasVoted(voteStatus);
      console.log('Has Voted Status:', voteStatus);

      // Fetch candidates with enhanced error handling
      const candidatesData = await getCandidates();
      console.log('Raw candidates data:', JSON.stringify(candidatesData, null, 2));
      let candidatesArray = [];
      if (Array.isArray(candidatesData)) {
        candidatesArray = candidatesData;
      } else if (candidatesData?.candidates && Array.isArray(candidatesData.candidates)) {
        candidatesArray = candidatesData.candidates;
      } else {
        console.warn('Candidates data is not in expected format:', candidatesData);
        toast.error(dynamicTranslate('Failed to load candidates data correctly', language), { position: 'top-center' });
      }
      setCandidates(candidatesArray.map(c => ({
        ...c,
        candidateID: c.candidateID || c.CandidateID, // Handle case sensitivity
        firstName: c.firstName || c.FirstName || dynamicTranslate('Unknown', language),
        lastName: c.lastName || c.LastName || '',
        electionID: c.electionID || c.ElectionID,
        party: c.party || c.Party || { partyName: dynamicTranslate('Independent', language) },
        description: c.description || c.Description || '',
        imageUrl: c.imageUrl || c.ImageUrl || c.PhotoUrl || null, // Added PhotoUrl mapping
        voteCount: c.voteCount || c.VoteCount || 0
      })));
      console.log('Processed candidates:', candidatesArray);
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = error.response?.data?.message || error.message || dynamicTranslate('Failed to load voter data', language);
      toast.error(errorMessage, { position: 'top-center' });
      setElections([]);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      const email =
        decoded.email ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        decoded['Email'] ||
        null;
      const role =
        decoded.role ||
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        null;
      return { email, role };
    } catch (error) {
      console.error('Token decoding failed:', error);
      return { email: null, role: null };
    }
  };

  const setupSignalR = () => {
    signalRService.onElectionStatusUpdate((electionId, status) => {
      setElections((prev) =>
        prev.map((e) => (e.electionID === electionId ? { ...e, status } : e))
      );
      toast.info(`Election ${electionId} status updated: ${status}`, { position: 'top-center' });
    });

    signalRService.onVoteUpdate((electionId, candidateId, voteCount) => {
      setCandidates((prev) =>
        prev.map((c) => (c.candidateID === candidateId && c.electionID === electionId ? { ...c, voteCount } : c))
      );
      toast.success(`Vote count updated for Candidate ${candidateId} in Election ${electionId}: ${voteCount}`, { position: 'top-center' });
    });
  };

  const cleanupSignalR = () => {
    signalRService.connection.off('ReceiveElectionStatusUpdate');
    signalRService.connection.off('ReceiveVoteUpdate');
  };

  if (user?.role !== 'Voter') {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(to right, #f5f5f5, #e0e0e0)', border: '1px solid #d0d0d0' }}>
          <Cancel color="error" sx={{ fontSize: 60 }} />
          <Typography variant="h4" sx={{ mt: 2, color: '#d32f2f' }}>
            {dynamicTranslate('Access Restricted', language)}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {dynamicTranslate('You must be a registered voter to access this dashboard.', language)}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 3 }}>
            {dynamicTranslate('Return to Login', language)}
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenVoteDialog = (election) => {
    console.log('Opening vote dialog for election:', election);
    const session = electionSessions[election.electionID];
    if (!session || session.sessionStatus !== 'Active' || new Date(session.startTime) > new Date() || new Date(session.endTime) < new Date()) {
      toast.error(dynamicTranslate('No active voting session available for this election.', language), { position: 'top-center' });
      return;
    }
    if (hasVoted[election.electionID]) {
      toast.error(dynamicTranslate('You have already voted in this election.', language), { position: 'top-center' });
      return;
    }
    setSelectedElection(election);
    setOpenVoteDialog(true);
    setSelectedCandidate(null);
  };

  const handleCloseVoteDialog = () => {
    setOpenVoteDialog(false);
    setSelectedElection(null);
    setSelectedCandidate(null);
    setViewConfirmation(false);
    setTimeout(() => document.querySelector('body')?.focus(), 0);
  };

  const handleSelectCandidate = (candidate) => {
    console.log('Selected candidate:', candidate);
    setSelectedCandidate(candidate);
  };

  const handleConfirmVote = () => {
    if (!selectedCandidate) {
      toast.error(dynamicTranslate('Please select a candidate first', language), { position: 'top-center' });
      return;
    }
    console.log('Confirming vote for:', selectedCandidate);
    setViewConfirmation(true);
    setTimeout(() => confirmButtonRef.current?.focus(), 0);
  };

  const handleCastVote = async () => {
    if (!voterId || !selectedElection || !selectedCandidate) {
      toast.error(dynamicTranslate('Unable to cast vote: Missing required data', language), { position: 'top-center' });
      console.error('Missing vote data:', { voterId, selectedElection, selectedCandidate });
      return;
    }

    const session = electionSessions[selectedElection.electionID];
    if (!session || session.sessionStatus !== 'Active' || new Date(session.startTime) > new Date() || new Date(session.endTime) < new Date()) {
      toast.error(dynamicTranslate('Voting session is not active.', language), { position: 'top-center' });
      setViewConfirmation(false);
      handleCloseVoteDialog();
      return;
    }

    if (hasVoted[selectedElection.electionID]) {
      toast.error(dynamicTranslate('You have already voted in this election.', language), { position: 'top-center' });
      setViewConfirmation(false);
      handleCloseVoteDialog();
      return;
    }

    setVoteLoading(true);
    try {
      const voteData = { 
        voterID: voterId, 
        candidateID: selectedCandidate.candidateID, 
        electionID: selectedElection.electionID 
      };
      console.log('Casting vote with data:', voteData);
      const response = await castVote(voteData);
      console.log('Vote response:', response);
      toast.success(dynamicTranslate('Vote cast successfully! Your vote has been recorded securely.', language), { position: 'top-center' });
      setHasVoted(prev => ({ ...prev, [selectedElection.electionID]: true }));
      setViewConfirmation(false);
      handleCloseVoteDialog();
      fetchVoterData(); // Refresh data to sync with backend
    } catch (error) {
      console.error('Vote error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.Message || dynamicTranslate('Failed to cast vote', language);
      toast.error(errorMessage, { position: 'top-center' });
    } finally {
      setVoteLoading(false);
    }
  };

  const filteredElections = elections.filter((election) =>
    (election.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'error';
      case 'Pending': return 'warning';
      case 'Completed': return 'info';
      default: return 'default';
    }
  };

  const getRemainingTime = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end - now;
    
    if (diffMs <= 0) return dynamicTranslate("Ended", language);
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHrs}h ${dynamicTranslate('remaining', language)}`;
    } else {
      return `${diffHrs}h ${dynamicTranslate('remaining', language)}`;
    }
  };

  const isVotingSessionActive = (electionId) => {
    const session = electionSessions[electionId];
    if (!session) {
      console.log(`No session found for Election ${electionId}`);
      return false;
    }

    const isActive = session.sessionStatus === 'Active';
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const withinTime = start <= now && end >= now;

    console.log(`Session check for Election ${electionId}: Status=${session.sessionStatus}, Start=${start}, End=${end}, Now=${now}, Active=${isActive && withinTime}`);

    return isActive && withinTime;
  };

  const toggleLanguage = () => {
    setLanguage((prevLanguage) => (prevLanguage === 'en' ? 'hi' : 'en'));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #3f51b5 0%, #1a237e 100%)' }} elevation={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56, mr: 2 }}>
              {voterProfile?.firstName?.charAt(0) || 'V'}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1" sx={{ color: 'white', fontWeight: 'bold' }}>
                नमस्ते, {voterProfile?.firstName || 'Voter'}!
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9 }}>
                {dynamicTranslate('Welcome to the Indian Election System', language)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<History />}
              onClick={() => navigate('/voter/history')}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
            >
              {dynamicTranslate('Voting History', language)}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AccountCircle />}
              onClick={() => navigate('/voter/profile')}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
            >
              {dynamicTranslate('My Profile', language)}
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Language />}
              onClick={toggleLanguage}
              sx={{ borderRadius: 2, color: language === 'en' ? 'white' : 'white', borderColor: language === 'en' ? '#3f51b5' : '#3f51b5' }}
            >
              {language === 'en' ? 'हिंदी' : 'English'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', color: '#333' }}>
            <Ballot sx={{ mr: 1, color: '#3f51b5' }} /> 
            {dynamicTranslate('Available Elections', language)}
          </Typography>
          <Badge badgeContent={elections.filter(e => e.status === 'Active' && isVotingSessionActive(e.electionID)).length} color="error">
            <Chip 
              icon={<NotificationsActive />} 
              label={dynamicTranslate('Active Elections', language)} 
              color="primary" 
              variant="outlined" 
              sx={{ fontWeight: 'bold' }} 
            />
          </Badge>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              '& .MuiTab-root': { fontWeight: 'bold' },
              '& .Mui-selected': { color: '#3f51b5' },
              '& .MuiTabs-indicator': { backgroundColor: '#3f51b5', height: 3 }
            }}
          >
            <Tab label={dynamicTranslate('All Elections', language)} icon={<Ballot />} iconPosition="start" />
            <Tab 
              label={dynamicTranslate('Active', language)} 
              icon={<CheckCircle color="success" />} 
              iconPosition="start"
              sx={{ color: tabValue === 1 ? 'success.main' : 'inherit' }} 
            />
            <Tab 
              label={dynamicTranslate('Upcoming', language)} 
              icon={<CalendarToday color="warning" />} 
              iconPosition="start"
              sx={{ color: tabValue === 2 ? 'warning.main' : 'inherit' }} 
            />
            <Tab 
              label={dynamicTranslate('Completed', language)} 
              icon={<InfoOutlined color="info" />} 
              iconPosition="start"
              sx={{ color: tabValue === 3 ? 'info.main' : 'inherit' }} 
            />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder={dynamicTranslate('Search elections by name, type, or location...', language)}
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2, maxWidth: '500px' }}
          />
          <Button 
            startIcon={<Refresh />} 
            onClick={fetchVoterData} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            {dynamicTranslate('Refresh', language)}
          </Button>
          <Button 
            startIcon={<FilterList />} 
            variant="outlined" 
            sx={{ ml: 2, borderRadius: 2 }}
          >
            {dynamicTranslate('Filters', language)}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
              {dynamicTranslate('Loading elections...', language)}
            </Typography>
          </Box>
        ) : filteredElections.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: 2 }}>
            <Typography variant="h5" color="textSecondary" sx={{ mb: 2 }}>
              {dynamicTranslate('No elections found', language)}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {searchQuery ? 
                dynamicTranslate('Try adjusting your search query or filters', language) : 
                dynamicTranslate('There are no elections available for you at this time', language)
              }
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 3 }}
              onClick={fetchVoterData}
            >
              {dynamicTranslate('Refresh Elections', language)}
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredElections
              .filter((election) => {
                if (tabValue === 0) return true;
                if (tabValue === 1) return election.status === 'Active' && isVotingSessionActive(election.electionID);
                if (tabValue === 2) return election.status === 'Pending';
                if (tabValue === 3) return election.status === 'Completed';
                return true;
              })
              .map((election) => (
                <Grid item xs={12} sm={6} md={4} key={election.electionID}>
                  <Card 
                    elevation={4} 
                    sx={{ 
                      borderRadius: 2, 
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)' 
                      },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={election.imageUrl || 'https://media.istockphoto.com/id/1097228434/photo/close-up-of-human-hand-casting-and-inserting-a-vote-and-choosing-and-making-a-decision-what.jpg?s=612x612&w=0&k=20&c=gpO2ZzhWoj4wn6MzxlwclyAjBQh0LuMr5gAMCIzK9qM='}
                        alt={election.name}
                        sx={{ 
                          height: 160, 
                          width: '100%', 
                          objectFit: 'contain', // Changed from 'cover' to 'contain'
                          bgcolor: '#f0f0f0',
                        }}
                      />
                      <Chip
                        label={election.status}
                        color={getStatusColor(election.status)}
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 12, 
                          right: 12, 
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      />
                      {election.status === 'Active' && isVotingSessionActive(election.electionID) && (
                        <Chip
                          label={getRemainingTime(electionSessions[election.electionID]?.endTime || election.votingEndTime)}
                          color="error"
                          size="small"
                          variant="outlined"
                          sx={{ 
                            position: 'absolute', 
                            bottom: 12, 
                            right: 12, 
                            bgcolor: 'rgba(255,255,255,0.9)',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 'bold', 
                          color: '#333',
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2
                        }}
                      >
                        {election.name}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1.5,
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3,
                          minHeight: '3em'
                        }}
                      >
                        {election.description?.length > 100
                          ? `${election.description.substring(0, 100)}...`
                          : election.description || dynamicTranslate('No description available', language)}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Box>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: '#555' }}>
                            <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: '#3f51b5' }} />
                            <strong>{dynamicTranslate('Start:', language)}</strong> {new Date(election.votingStartTime).toLocaleDateString('en-IN')}
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: '#555' }}>
                            <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: '#f44336' }} />
                            <strong>{dynamicTranslate('End:', language)}</strong> {new Date(election.votingEndTime).toLocaleDateString('en-IN')}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/election/${election.electionID}`)}
                        sx={{ color: '#3f51b5' }}
                      >
                        {dynamicTranslate('Details', language)}
                      </Button>
                      {election.status === 'Active' && isVotingSessionActive(election.electionID) ? (
                        hasVoted[election.electionID] ? (
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            sx={{ borderRadius: 4, px: 2 }}
                          >
                            {dynamicTranslate('Already Voted', language)}
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<HowToVote />}
                            onClick={() => handleOpenVoteDialog(election)}
                            sx={{ 
                              borderRadius: 4,
                              px: 2,
                              boxShadow: '0 4px 6px rgba(63, 81, 181, 0.2)',
                              background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)'
                            }}
                          >
                            {dynamicTranslate('Vote Now', language)}
                          </Button>
                        )
                      ) : election.status === 'Active' && !electionSessions[election.electionID] ? (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          sx={{ borderRadius: 4, px: 2 }}
                        >
                          {dynamicTranslate('No Session', language)}
                        </Button>
                      ) : election.status === 'Active' ? (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          sx={{ borderRadius: 4, px: 2 }}
                        >
                          {dynamicTranslate('Session Inactive', language)}
                        </Button>
                      ) : election.status === 'Pending' ? (
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          sx={{ borderRadius: 4, px: 2 }}
                        >
                          {dynamicTranslate('Coming Soon', language)}
                        </Button>
                      ) : election.status === 'Completed' ? (
                        <Button
                          variant="outlined"
                          color="info"
                          size="small"
                          onClick={() => navigate(`/results/${election.electionID}`)}
                          sx={{ borderRadius: 4, px: 2 }}
                        >
                          {dynamicTranslate('View Results', language)}
                        </Button>
                      ) : null}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </Paper>

      <Dialog 
        open={openVoteDialog && !viewConfirmation} 
        onClose={handleCloseVoteDialog} 
        fullWidth 
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)',
          color: 'white',
          py: 2,
          display: 'flex',
          alignItems: 'center'
        }}>
          <HowToVote sx={{ mr: 1.5, fontSize: 28 }} />
          {dynamicTranslate('Cast Your Vote -', language)} {selectedElection?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {dynamicTranslate('Please select a candidate from the list below and click "Vote" to cast your ballot. Your vote is secure and anonymous.', language)}
          </Typography>
          
          {selectedElection && candidates.length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              {dynamicTranslate('No candidates data loaded. Please try refreshing the page.', language)}
            </Typography>
          ) : selectedElection && candidates.filter((c) => c.electionID === selectedElection.electionID).length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              {dynamicTranslate('No candidates available for this election.', language)}
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {selectedElection && candidates
                .filter((c) => c.electionID === selectedElection.electionID)
                .map((candidate) => (
                  <Grid item xs={12} sm={6} key={candidate.candidateID}>
                    <Card 
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: selectedCandidate?.candidateID === candidate.candidateID ? 
                          '2px solid #3f51b5' : '1px solid #e0e0e0',
                        boxShadow: selectedCandidate?.candidateID === candidate.candidateID ?
                          '0 0 0 4px rgba(63, 81, 181, 0.2)' : 'none',
                        transition: 'all 0.2s ease',
                        bgcolor: selectedCandidate?.candidateID === candidate.candidateID ?
                          'rgba(63, 81, 181, 0.05)' : 'white',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }
                      }}
                      onClick={() => handleSelectCandidate(candidate)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            bgcolor: 'primary.main',
                            mr: 2
                          }}
                          src={candidate.imageUrl || undefined} // Updated to use imageUrl with fallback
                        >
                          {candidate.firstName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {`${candidate.firstName} ${candidate.lastName}`}
                          </Typography>
                          <Chip 
                            label={candidate.party?.partyName || dynamicTranslate('Independent', language)}
                            size="small" 
                            sx={{ 
                              fontWeight: 'bold',
                              bgcolor: candidate.party?.partyName ? 'rgba(63, 81, 181, 0.1)' : 'rgba(0, 0, 0, 0.08)'
                            }} 
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {candidate.description || dynamicTranslate('No candidate description available.', language)}
                      </Typography>
                      
                      {selectedElection.status === 'Completed' && candidate.voteCount !== undefined && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{dynamicTranslate('Current Votes:', language)}</span>
                            <strong>{candidate.voteCount}</strong>
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(candidate.voteCount / 100) * 100} // Adjust denominator based on total votes if available
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      )}
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleCloseVoteDialog} 
            disabled={voteLoading}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            {dynamicTranslate('Cancel', language)}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<HowToVote />}
            onClick={handleConfirmVote}
            disabled={!selectedCandidate || voteLoading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)'
            }}
          >
            {dynamicTranslate('Continue to Vote', language)}
          </Button>
          {voteLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </DialogActions>
      </Dialog>

      <Dialog 
        open={viewConfirmation} 
        onClose={() => setViewConfirmation(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
        disableRestoreFocus
      >
        <DialogTitle sx={{ bgcolor: '#f5f5f5', color: '#333' }}>
          {dynamicTranslate('Confirm Your Vote', language)}
        </DialogTitle>
        <DialogContent>
          {selectedCandidate && (
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" paragraph>
                {dynamicTranslate('You are about to cast your vote for:', language)}
              </Typography>
              
              <Box sx={{ 
                p: 3, 
                border: '1px solid #e0e0e0', 
                borderRadius: 2, 
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'rgba(63, 81, 181, 0.05)'
              }}>
                <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
                  {selectedCandidate.firstName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {`${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Party: {selectedCandidate.party?.partyName || dynamicTranslate('Independent', language)}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{ mt: 3, fontWeight: 'bold', color: '#d32f2f' }}>
                {dynamicTranslate('Important:', language)}
              </Typography>
              <Typography variant="body2" paragraph>
                {dynamicTranslate('• This action cannot be undone.', language)}
              </Typography>
              <Typography variant="body2" paragraph>
                {dynamicTranslate('• Your vote is secure and anonymous.', language)}
              </Typography>
              <Typography variant="body2" paragraph>
                {dynamicTranslate('• You can only vote once in this election.', language)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setViewConfirmation(false)} 
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            {dynamicTranslate('Go Back', language)}
          </Button>
          <Button 
            onClick={handleCastVote} 
            color="primary"
            variant="contained"
            disabled={voteLoading}
            startIcon={voteLoading ? <CircularProgress size={20} /> : <HowToVote />}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)'
            }}
            ref={confirmButtonRef}
          >
            {dynamicTranslate('Confirm Vote', language)}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default VoterDashboard;