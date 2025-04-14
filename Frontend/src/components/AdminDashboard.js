// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Container, Typography, Grid, Button, Paper, Box, Tabs, Tab, Divider,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
//   Card, CardContent, CardActions, Avatar, IconButton, CircularProgress,
//   Dialog, DialogTitle, DialogContent, DialogActions
// } from '@mui/material';
// import {
//   VerifiedUser, HowToVote, Person, Assessment, SupervisorAccount,
//   Visibility, CheckCircle, Warning, GppGood, Timeline, EventAvailable,
//   Refresh, Cancel, InfoOutlined
// } from '@mui/icons-material';
// import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import {
//   getAuditLogs, getCandidates, getElections, getVoters, getOfficials,
//   approveVoter, rejectVoter, approveOfficial, rejectOfficial, getElectionResults
// } from '../services/api';
// import signalRService from '../services/signalr';

// function TabPanel(props) {
//   const { children, value, index, ...other } = props;
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`admin-tabpanel-${index}`}
//       aria-labelledby={`admin-tab-${index}`}
//       {...other}
//       style={{ padding: '24px' }}
//     >
//       {value === index && <Box>{children}</Box>}
//     </div>
//   );
// }

// function AdminDashboard() {
//   const navigate = useNavigate();
//   const [tabValue, setTabValue] = useState(0);
//   const [auditLogs, setAuditLogs] = useState([]);
//   const [candidates, setCandidates] = useState([]);
//   const [elections, setElections] = useState([]);
//   const [voters, setVoters] = useState([]);
//   const [officials, setOfficials] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [dialogAction, setDialogAction] = useState('');
//   const [dialogUser, setDialogUser] = useState(null);
//   const hasInitialized = useRef(false);

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [logs, candidatesData, electionsData, votersData, officialsData] = await Promise.all([
//         getAuditLogs(),
//         getCandidates(),
//         getElections(),
//         getVoters(),
//         getOfficials()
//       ]);
//       setAuditLogs(Array.isArray(logs) ? logs : []);
//       setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
//       setElections(Array.isArray(electionsData) ? electionsData : []);
//       setVoters(Array.isArray(votersData) ? votersData : []);
//       setOfficials(Array.isArray(officialsData) ? officialsData : []);
//       toast.success('Data refreshed successfully', { position: 'top-center', icon: '✅' });
//     } catch (error) {
//       console.error('Fetch data error:', error);
//       toast.error('Failed to load data', { position: 'top-center', icon: '❌' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setupSignalR = () => {
//     signalRService.joinAdminGroup();
//     signalRService.onAuditLogUpdate((log) => {
//       setAuditLogs((prev) => [log, ...prev.slice(0, 49)]);
//       toast(`New Activity: ${log.action}`, { position: 'top-center', icon: 'ℹ️' });
//     });
//     signalRService.onVoteUpdate((electionId, candidateId, voteCount) => {
//       toast(`Vote updated for Candidate ID ${candidateId} in Election ID ${electionId}`, {
//         position: 'top-center',
//         icon: '🗳️'
//       });
//     });
//     signalRService.onElectionStatusUpdate((electionId, status) => {
//       setElections((prev) =>
//         prev.map((e) => (e.electionID === electionId ? { ...e, status } : e))
//       );
//       toast(`Election ID ${electionId} status updated to ${status}`, {
//         position: 'top-center',
//         icon: '🔔'
//       });
//     });
//     signalRService.onApprovalUpdate((id, status, isOfficial) => {
//       if (isOfficial) {
//         setOfficials((prev) =>
//           prev.map((o) => (o.officialID === id ? { ...o, officialStatus: status } : o))
//         );
//         toast(`Official ID ${id} status updated to ${status}`, {
//           position: 'top-center',
//           icon: '🔔'
//         });
//       } else {
//         setVoters((prev) =>
//           prev.map((v) => (v.voterID === id ? { ...v, voterStatus: status } : v))
//         );
//         toast(`Voter ID ${id} status updated to ${status}`, {
//           position: 'top-center',
//           icon: '🔔'
//         });
//       }
//     });
//     signalRService.onCandidateUpdate((candidate) => {
//       setCandidates((prev) =>
//         prev.some((c) => c.candidateID === candidate.candidateID)
//           ? prev.map((c) => (c.candidateID === candidate.candidateID ? candidate : c))
//           : [...prev, candidate]
//       );
//       toast(`Candidate ${candidate.firstName} ${candidate.lastName} updated`, {
//         position: 'top-center',
//         icon: '📝'
//       });
//     });
//   };

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       toast.error('Please log in to access the dashboard', {
//         position: 'top-center',
//         icon: '⚠️'
//       });
//       navigate('/login');
//       return;
//     }

//     if (!hasInitialized.current) {
//       fetchData();
//       setupSignalR();
//       hasInitialized.current = true;
//     }

//     return () => {
//       signalRService.leaveAdminGroup();
//     };
//   }, [navigate]);

//   const handleAction = (user, action, isOfficial) => {
//     setDialogUser(user);
//     setDialogAction(action);
//     setDialogOpen(true);
//   };

//   const confirmAction = async () => {
//     try {
//       const { voterID, officialID } = dialogUser;
//       const isOfficial = dialogAction.includes('Official');
//       const id = isOfficial ? officialID : voterID;

//       if (dialogAction === 'approveVoter') {
//         await approveVoter(id);
//         setVoters((prev) =>
//           prev.map((v) => (v.voterID === id ? { ...v, voterStatus: 'Approved' } : v))
//         );
//         toast.success(`Voter ${dialogUser.firstName} approved`, {
//           position: 'top-center',
//           icon: '✅'
//         });
//       } else if (dialogAction === 'rejectVoter') {
//         await rejectVoter(id);
//         setVoters((prev) =>
//           prev.map((v) => (v.voterID === id ? { ...v, voterStatus: 'Rejected' } : v))
//         );
//         toast.error(`Voter ${dialogUser.firstName} rejected`, {
//           position: 'top-center',
//           icon: '❌'
//         });
//       } else if (dialogAction === 'approveOfficial') {
//         await approveOfficial(id);
//         setOfficials((prev) =>
//           prev.map((o) => (o.officialID === id ? { ...o, officialStatus: 'Approved' } : o))
//         );
//         toast.success(`Official ${dialogUser.firstName} approved`, {
//           position: 'top-center',
//           icon: '✅'
//         });
//       } else if (dialogAction === 'rejectOfficial') {
//         await rejectOfficial(id);
//         setOfficials((prev) =>
//           prev.map((o) => (o.officialID === id ? { ...o, officialStatus: 'Rejected' } : o))
//         );
//         toast.error(`Official ${dialogUser.firstName} rejected`, {
//           position: 'top-center',
//           icon: '❌'
//         });
//       }
//     } catch (error) {
//       toast.error('Action failed', { position: 'top-center', icon: '❌' });
//     } finally {
//       setDialogOpen(false);
//       setDialogUser(null);
//       setDialogAction('');
//     }
//   };

//   const getStatusChip = (status) => {
//     const chipStyle = { fontSize: '0.75rem', height: '24px' };
//     switch (status) {
//       case 'Approved':
//         return <Chip icon={<CheckCircle style={{ fontSize: '16px' }} />} label="Approved" color="success" style={chipStyle} />;
//       case 'Pending':
//         return <Chip icon={<Warning style={{ fontSize: '16px' }} />} label="Pending" color="warning" style={chipStyle} />;
//       case 'Rejected':
//         return <Chip icon={<Cancel style={{ fontSize: '16px' }} />} label="Rejected" color="error" style={chipStyle} />;
//       default:
//         return <Chip label={status} style={chipStyle} />;
//     }
//   };

//   if (loading) {
//     return (
//       <Box style={{ 
//         display: 'flex', 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         height: '80vh', 
//         backgroundColor: '#f5f5f7'
//       }}>
//         <CircularProgress style={{ color: '#FF9933' }} />
//         <Typography variant="h6" style={{ marginLeft: '16px', color: '#000080', fontWeight: 500 }}>
//           Loading Election Management Dashboard...
//         </Typography>
//       </Box>
//     );
//   }

//   const pendingVoters = voters.filter((v) => v.voterStatus === 'Pending');
//   const pendingOfficials = officials.filter((o) => o.officialStatus === 'Pending');

//   return (
//     <Container maxWidth="xl" style={{ marginTop: '32px', marginBottom: '32px' }}>
//       <Paper
//         elevation={3}
//         style={{
//           padding: '24px',
//           marginBottom: '24px',
//           backgroundColor: '#ffffff',
//           borderLeft: '4px solid #000080',
//           display: 'flex',
//           alignItems: 'center',
//           boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
//         }}
//       >
//         <Avatar style={{ backgroundColor: '#000080', marginRight: '16px', width: '48px', height: '48px' }}>
//           <SupervisorAccount style={{ fontSize: '28px' }} />
//         </Avatar>
//         <div>
//           <Typography variant="h4" style={{ fontWeight: 700, color: '#000080', marginBottom: '4px' }}>
//             Election Commission of India
//           </Typography>
//           <Typography variant="h6" style={{ color: '#455a64' }}>
//             Administrative Control Panel
//           </Typography>
//         </div>
//       </Paper>

//       <Grid container spacing={3} style={{ marginBottom: '24px' }}>
//         <Grid item xs={12} sm={6} md={3}>
//           <Paper 
//             elevation={2} 
//             style={{ 
//               padding: '16px', 
//               textAlign: 'center', 
//               backgroundColor: '#e3f2fd', 
//               borderRadius: '8px',
//               borderTop: '4px solid #FF9933'
//             }}
//           >
//             <HowToVote style={{ fontSize: '40px', color: '#FF9933' }} />
//             <Typography variant="h5" style={{ fontWeight: 600, color: '#000080' }}>{elections.length}</Typography>
//             <Typography variant="body1" style={{ color: '#455a64' }}>Active Elections</Typography>
//           </Paper>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Paper 
//             elevation={2} 
//             style={{ 
//               padding: '16px', 
//               textAlign: 'center', 
//               backgroundColor: '#e8f5e9', 
//               borderRadius: '8px',
//               borderTop: '4px solid #138808'
//             }}
//           >
//             <Person style={{ fontSize: '40px', color: '#138808' }} />
//             <Typography variant="h5" style={{ fontWeight: 600, color: '#000080' }}>{candidates.length}</Typography>
//             <Typography variant="body1" style={{ color: '#455a64' }}>Registered Candidates</Typography>
//           </Paper>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Paper 
//             elevation={2} 
//             style={{ 
//               padding: '16px', 
//               textAlign: 'center', 
//               backgroundColor: '#fff8e1', 
//               borderRadius: '8px',
//               borderTop: '4px solid #FF9933'
//             }}
//           >
//             <VerifiedUser style={{ fontSize: '40px', color: '#FF9933' }} />
//             <Typography variant="h5" style={{ fontWeight: 600, color: '#000080' }}>{pendingVoters.length}</Typography>
//             <Typography variant="body1" style={{ color: '#455a64' }}>Pending Voters</Typography>
//           </Paper>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <Paper 
//             elevation={2} 
//             style={{ 
//               padding: '16px', 
//               textAlign: 'center', 
//               backgroundColor: '#ffebee', 
//               borderRadius: '8px',
//               borderTop: '4px solid #000080'
//             }}
//           >
//             <GppGood style={{ fontSize: '40px', color: '#000080' }} />
//             <Typography variant="h5" style={{ fontWeight: 600, color: '#000080' }}>{pendingOfficials.length}</Typography>
//             <Typography variant="body1" style={{ color: '#455a64' }}>Pending Officials</Typography>
//           </Paper>
//         </Grid>
//       </Grid>

//       <Paper elevation={3} style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}>
//         <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
//           <Tabs
//             value={tabValue}
//             onChange={handleTabChange}
//             variant="scrollable"
//             scrollButtons="auto"
//             style={{ borderBottom: '1px solid #e0e0e0' }}
//             TabIndicatorProps={{ style: { backgroundColor: '#FF9933' } }}
//           >
//             <Tab
//               icon={<Timeline style={{ fontSize: '20px' }} />}
//               label="Activity Logs"
//               style={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', color: tabValue === 0 ? '#000080' : 'inherit' }}
//             />
//             <Tab
//               icon={<EventAvailable style={{ fontSize: '20px' }} />}
//               label="Elections"
//               style={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', color: tabValue === 1 ? '#000080' : 'inherit' }}
//             />
//             <Tab
//               icon={<Person style={{ fontSize: '20px' }} />}
//               label="Candidates"
//               style={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', color: tabValue === 2 ? '#000080' : 'inherit' }}
//             />
//             <Tab
//               icon={<VerifiedUser style={{ fontSize: '20px' }} />}
//               label="Voter Verifications"
//               style={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', color: tabValue === 3 ? '#000080' : 'inherit' }}
//             />
//             <Tab
//               icon={<SupervisorAccount style={{ fontSize: '20px' }} />}
//               label="Official Approvals"
//               style={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', color: tabValue === 4 ? '#000080' : 'inherit' }}
//             />
//           </Tabs>
//           <IconButton onClick={fetchData} style={{ color: '#FF9933' }}>
//             <Refresh style={{ fontSize: '24px' }} />
//           </IconButton>
//         </Box>

//         <TabPanel value={tabValue} index={0}>
//           <Typography variant="h6" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#000080', fontWeight: 600 }}>
//             <Timeline style={{ marginRight: '8px', color: '#FF9933' }} /> System Activity Logs
//           </Typography>
//           {auditLogs.length > 0 ? (
//             <TableContainer component={Paper} elevation={1} style={{ borderRadius: '8px' }}>
//               <Table size="small">
//                 <TableHead>
//                   <TableRow style={{ backgroundColor: '#f5f5f5' }}>
//                     {/* <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Log ID</TableCell> */}
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Action</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Details</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Timestamp</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {auditLogs.map((log) => (
//                     <TableRow key={log.auditId} hover style={{ cursor: 'pointer' }}>
//                       {/* <TableCell>{log.auditId}</TableCell> */}
//                       <TableCell>{log.action}</TableCell>
//                       <TableCell>{log.details}</TableCell>
//                       <TableCell>{new Date(log.timestamp).toLocaleString('en-IN')}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           ) : (
//             <Paper elevation={1} style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
//               <Typography style={{ color: '#666' }}>No activity logs available</Typography>
//             </Paper>
//           )}
//         </TabPanel>

//         <TabPanel value={tabValue} index={1}>
//           <Typography variant="h6" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#000080', fontWeight: 600 }}>
//             <EventAvailable style={{ marginRight: '8px', color: '#FF9933' }} /> Election Management
//           </Typography>
//           <Grid container spacing={2}>
//             {elections.length > 0 ? (
//               elections.map((e) => (
//                 <Grid item xs={12} sm={6} md={4} key={e.electionID}>
//                   <Card elevation={2} style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', borderTop: '4px solid #FF9933' }}>
//                     <CardContent style={{ flexGrow: 1 }}>
//                       <Typography variant="h6" style={{ fontWeight: 600, color: '#000080', marginBottom: '8px' }}>
//                         {e.name}
//                       </Typography>
//                       <Divider style={{ margin: '8px 0' }} />
//                       <Typography variant="body2" style={{ color: '#455a64', margin: '8px 0' }}>
//                         <strong>Status:</strong> {getStatusChip(e.status)}
//                       </Typography>
//                       <Typography variant="body2" style={{ color: '#455a64', margin: '4px 0' }}>
//                         <strong>Start Date:</strong> {new Date(e.startDate).toLocaleDateString('en-IN')}
//                       </Typography>
//                       <Typography variant="body2" style={{ color: '#455a64', margin: '4px 0' }}>
//                         <strong>End Date:</strong> {new Date(e.endDate).toLocaleDateString('en-IN')}
//                       </Typography>
//                       <Typography variant="body2" style={{ marginTop: '8px', color: '#666' }}>{e.description}</Typography>
//                     </CardContent>
//                     <CardActions style={{ padding: '16px', backgroundColor: '#f9f9f9' }}>
//                       <Button
//                         size="small"
//                         startIcon={<Visibility />}
//                         style={{ 
//                           color: '#ffffff', 
//                           backgroundColor: '#FF9933', 
//                           textTransform: 'none',
//                           padding: '6px 12px',
//                           marginRight: '8px'
//                         }}
//                         onClick={() => navigate(`/election/${e.electionID}`)}
//                       >
//                         View Details
//                       </Button>
//                       <Button
//                         size="small"
//                         startIcon={<Assessment />}
//                         style={{ 
//                           color: '#ffffff', 
//                           backgroundColor: '#138808', 
//                           textTransform: 'none',
//                           padding: '6px 12px'
//                         }}
//                         onClick={() => navigate(`/election/${e.electionID}/results`)}
//                       >
//                         Results
//                       </Button>
//                     </CardActions>
//                   </Card>
//                 </Grid>
//               ))
//             ) : (
//               <Grid item xs={12}>
//                 <Paper elevation={1} style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
//                   <Typography style={{ color: '#666' }}>No elections available</Typography>
//                 </Paper>
//               </Grid>
//             )}
//           </Grid>
//         </TabPanel>

//         <TabPanel value={tabValue} index={2}>
//           <Typography variant="h6" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#000080', fontWeight: 600 }}>
//             <Person style={{ marginRight: '8px', color: '#FF9933' }} /> Registered Candidates
//           </Typography>
//           <Grid container spacing={2}>
//             {candidates.length > 0 ? (
//               candidates.map((c) => (
//                 <Grid item xs={12} sm={6} md={4} key={c.candidateID}>
//                   <Card elevation={2} style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', borderTop: '4px solid #138808' }}>
//                     <CardContent style={{ flexGrow: 1 }}>
//                       <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
//                         <Avatar style={{ backgroundColor: '#FF9933', marginRight: '12px', width: '40px', height: '40px' }}>
//                           {c.firstName.charAt(0) + c.lastName.charAt(0)}
//                         </Avatar>
//                         <Typography variant="h6" style={{ fontWeight: 600, color: '#000080' }}>
//                           {c.firstName} {c.lastName}
//                         </Typography>
//                       </Box>
//                       <Divider style={{ margin: '8px 0' }} />
//                       <Typography variant="body2" style={{ color: '#455a64', margin: '4px 0' }}>
//                         <strong>Party:</strong> {c.party.partyName}
//                       </Typography>
//                       <Typography variant="body2" style={{ color: '#455a64', margin: '4px 0' }}>
//                         <strong>Position:</strong> {c.position}
//                       </Typography>
//                       <Typography variant="body2" style={{ color: '#455a64', margin: '4px 0' }}>
//                         <strong>Election:</strong> {elections.find((e) => e.electionID === c.electionID)?.name || 'Unknown'}
//                       </Typography>
//                     </CardContent>
//                     <CardActions style={{ padding: '16px', backgroundColor: '#f9f9f9' }}>
//                       <Button
//                         size="small"
//                         startIcon={<Visibility />}
//                         style={{ 
//                           color: '#ffffff', 
//                           backgroundColor: '#000080', 
//                           textTransform: 'none',
//                           padding: '6px 12px' 
//                         }}
//                         onClick={() => navigate(`/candidate/${c.candidateID}`)}
//                       >
//                         View Profile
//                       </Button>
//                     </CardActions>
//                   </Card>
//                 </Grid>
//               ))
//             ) : (
//               <Grid item xs={12}>
//                 <Paper elevation={1} style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
//                   <Typography style={{ color: '#666' }}>No candidates available</Typography>
//                 </Paper>
//               </Grid>
//             )}
//           </Grid>
//         </TabPanel>

//         <TabPanel value={tabValue} index={3}>
//           <Typography variant="h6" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#000080', fontWeight: 600 }}>
//             <VerifiedUser style={{ marginRight: '8px', color: '#FF9933' }} /> Voter Verification Queue
//           </Typography>
//           {pendingVoters.length > 0 ? (
//             <TableContainer component={Paper} elevation={1} style={{ borderRadius: '8px' }}>
//               <Table>
//                 <TableHead>
//                   <TableRow style={{ backgroundColor: '#f5f5f5' }}>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Voter ID</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Name</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Email</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Aadhaar Number</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Status</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {pendingVoters.map((v) => (
//                     <TableRow key={v.voterID} hover style={{ cursor: 'pointer' }}>
//                       <TableCell>{v.voterID}</TableCell>
//                       <TableCell>{v.firstName} {v.lastName}</TableCell>
//                       <TableCell>{v.email}</TableCell>
//                       <TableCell>{v.nationalID}</TableCell>
//                       <TableCell>{getStatusChip(v.voterStatus)}</TableCell>
//                       <TableCell>
//                         <Button
//                           variant="contained"
//                           color="success"
//                           size="small"
//                           onClick={() => handleAction(v, 'approveVoter', false)}
//                           startIcon={<CheckCircle />}
//                           style={{ 
//                             marginRight: '8px', 
//                             textTransform: 'none',
//                             backgroundColor: '#138808'
//                           }}
//                         >
//                           Approve
//                         </Button>
//                         <Button
//                           variant="outlined"
//                           color="error"
//                           size="small"
//                           onClick={() => handleAction(v, 'rejectVoter', false)}
//                           startIcon={<Cancel />}
//                           style={{ textTransform: 'none' }}
//                         >
//                           Reject
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           ) : (
//             <Paper elevation={1} style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
//               <Typography style={{ color: '#666' }}>No pending voter verifications</Typography>
//             </Paper>
//           )}
//         </TabPanel>

//         <TabPanel value={tabValue} index={4}>
//           <Typography variant="h6" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#000080', fontWeight: 600 }}>
//             <SupervisorAccount style={{ marginRight: '8px', color: '#FF9933' }} /> Official Approval Queue
//           </Typography>
//           {pendingOfficials.length > 0 ? (
//             <TableContainer component={Paper} elevation={1} style={{ borderRadius: '8px' }}>
//               <Table>
//                 <TableHead>
//                   <TableRow style={{ backgroundColor: '#f5f5f5' }}>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Official ID</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Name</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Email</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Position</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Status</TableCell>
//                     <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {pendingOfficials.map((o) => (
//                     <TableRow key={o.officialID} hover style={{ cursor: 'pointer' }}>
//                       <TableCell>{o.officialID}</TableCell>
//                       <TableCell>{o.firstName} {o.lastName}</TableCell>
//                       <TableCell>{o.email}</TableCell>
//                       <TableCell>{o.position || 'Electoral Officer'}</TableCell>
//                       <TableCell>{getStatusChip(o.officialStatus)}</TableCell>
//                       <TableCell>
//                         <Button
//                           variant="contained"
//                           size="small"
//                           onClick={() => handleAction(o, 'approveOfficial', true)}
//                           startIcon={<CheckCircle />}
//                           style={{ 
//                             marginRight: '8px', 
//                             textTransform: 'none',
//                             backgroundColor: '#138808'
//                           }}
//                         >
//                           Approve
//                         </Button>
//                         <Button
//                           variant="outlined"
//                           size="small"
//                           color="error"
//                           onClick={() => handleAction(o, 'rejectOfficial', true)}
//                           startIcon={<Cancel />}
//                           style={{ textTransform: 'none' }}
//                         >
//                           Reject
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           ) : (
//             <Paper elevation={1} style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
//               <Typography style={{ color: '#666' }}>No pending official approvals</Typography>
//             </Paper>
//           )}
//         </TabPanel>
//       </Paper>

//       <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
//         <DialogTitle style={{ backgroundColor: '#f5f5f7', color: '#000080', fontWeight: 600 }}>
//           <Box display="flex" alignItems="center">
//             <InfoOutlined style={{ marginRight: '8px', color: '#FF9933' }} />
//             Confirm Action
//           </Box>
//         </DialogTitle>
//         <DialogContent style={{ paddingTop: '16px' }}>
//           <Typography>
//             {dialogAction.includes('approve') ? 'Approve' : 'Reject'}{' '}
//             {dialogAction.includes('Voter') ? 'voter' : 'official'}{' '}
//             {dialogUser && `${dialogUser.firstName} ${dialogUser.lastName}`}?
//           </Typography>
//           <Typography variant="body2" style={{ marginTop: '8px', color: '#666' }}>
//             This action cannot be undone.
//           </Typography>
//         </DialogContent>
//         <DialogActions style={{ padding: '16px' }}>
//           <Button onClick={() => setDialogOpen(false)} style={{ color: '#666', textTransform: 'none' }}>
//             Cancel
//           </Button>
//           <Button 
//             onClick={confirmAction} 
//             color={dialogAction.includes('approve') ? 'primary' : 'error'}
//             variant="contained"
//             style={{ 
//               backgroundColor: dialogAction.includes('approve') ? '#138808' : '#d32f2f',
//               color: '#ffffff',
//               textTransform: 'none'
//             }}
//           >
//             Confirm
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   );
// }

// export default AdminDashboard;

import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Grid, Button, Paper, Box, Tabs, Tab, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Card, CardContent, CardActions, Avatar, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TablePagination
} from '@mui/material';
import {
  VerifiedUser, HowToVote, Person, Assessment, SupervisorAccount,
  Visibility, CheckCircle, Warning, GppGood, Timeline, EventAvailable,
  Refresh, Cancel, InfoOutlined
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  getAuditLogs, getCandidates, getElections, getVoters, getOfficials,
  approveVoter, rejectVoter, approveOfficial, rejectOfficial, getElectionResults
} from '../services/api';
import signalRService from '../services/signalr';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
      style={{ padding: '24px' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [auditLogs, setAuditLogs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [voters, setVoters] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [dialogUser, setDialogUser] = useState(null);
  const hasInitialized = useRef(false);
  
  // Pagination state for audit logs
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logs, candidatesData, electionsData, votersData, officialsData] = await Promise.all([
        getAuditLogs(),
        getCandidates(),
        getElections(),
        getVoters(),
        getOfficials()
      ]);
      setAuditLogs(Array.isArray(logs) ? logs : []);
      setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
      setElections(Array.isArray(electionsData) ? electionsData : []);
      setVoters(Array.isArray(votersData) ? votersData : []);
      setOfficials(Array.isArray(officialsData) ? officialsData : []);
      toast.success('Data refreshed successfully', { position: 'top-center', icon: '✅' });
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data', { position: 'top-center', icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  const setupSignalR = () => {
    signalRService.joinAdminGroup();
    signalRService.onAuditLogUpdate((log) => {
      setAuditLogs((prev) => [log, ...prev.slice(0, 49)]);
      toast(`New Activity: ${log.action}`, { position: 'top-center', icon: 'ℹ️' });
    });
    signalRService.onVoteUpdate((electionId, candidateId, voteCount) => {
      toast(`Vote updated for Candidate ID ${candidateId} in Election ID ${electionId}`, {
        position: 'top-center',
        icon: '🗳️'
      });
    });
    signalRService.onElectionStatusUpdate((electionId, status) => {
      setElections((prev) =>
        prev.map((e) => (e.electionID === electionId ? { ...e, status } : e))
      );
      toast(`Election ID ${electionId} status updated to ${status}`, {
        position: 'top-center',
        icon: '🔔'
      });
    });
    signalRService.onApprovalUpdate((id, status, isOfficial) => {
      if (isOfficial) {
        setOfficials((prev) =>
          prev.map((o) => (o.officialID === id ? { ...o, officialStatus: status } : o))
        );
        toast(`Official ID ${id} status updated to ${status}`, {
          position: 'top-center',
          icon: '🔔'
        });
      } else {
        setVoters((prev) =>
          prev.map((v) => (v.voterID === id ? { ...v, voterStatus: status } : v))
        );
        toast(`Voter ID ${id} status updated to ${status}`, {
          position: 'top-center',
          icon: '🔔'
        });
      }
    });
    signalRService.onCandidateUpdate((candidate) => {
      setCandidates((prev) =>
        prev.some((c) => c.candidateID === candidate.candidateID)
          ? prev.map((c) => (c.candidateID === candidate.candidateID ? candidate : c))
          : [...prev, candidate]
      );
      toast(`Candidate ${candidate.firstName} ${candidate.lastName} updated`, {
        position: 'top-center',
        icon: '📝'
      });
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access the dashboard', {
        position: 'top-center',
        icon: '⚠️'
      });
      navigate('/login');
      return;
    }

    if (!hasInitialized.current) {
      fetchData();
      setupSignalR();
      hasInitialized.current = true;
    }

    return () => {
      signalRService.leaveAdminGroup();
    };
  }, [navigate]);

  const handleAction = (user, action, isOfficial) => {
    setDialogUser(user);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    try {
      const { voterID, officialID } = dialogUser;
      const isOfficial = dialogAction.includes('Official');
      const id = isOfficial ? officialID : voterID;

      if (dialogAction === 'approveVoter') {
        await approveVoter(id);
        setVoters((prev) =>
          prev.map((v) => (v.voterID === id ? { ...v, voterStatus: 'Approved' } : v))
        );
        toast.success(`Voter ${dialogUser.firstName} approved`, {
          position: 'top-center',
          icon: '✅'
        });
      } else if (dialogAction === 'rejectVoter') {
        await rejectVoter(id);
        setVoters((prev) =>
          prev.map((v) => (v.voterID === id ? { ...v, voterStatus: 'Rejected' } : v))
        );
        toast.error(`Voter ${dialogUser.firstName} rejected`, {
          position: 'top-center',
          icon: '❌'
        });
      } else if (dialogAction === 'approveOfficial') {
        await approveOfficial(id);
        setOfficials((prev) =>
          prev.map((o) => (o.officialID === id ? { ...o, officialStatus: 'Approved' } : o))
        );
        toast.success(`Official ${dialogUser.firstName} approved`, {
          position: 'top-center',
          icon: '✅'
        });
      } else if (dialogAction === 'rejectOfficial') {
        await rejectOfficial(id);
        setOfficials((prev) =>
          prev.map((o) => (o.officialID === id ? { ...o, officialStatus: 'Rejected' } : o))
        );
        toast.error(`Official ${dialogUser.firstName} rejected`, {
          position: 'top-center',
          icon: '❌'
        });
      }
    } catch (error) {
      toast.error('Action failed', { position: 'top-center', icon: '❌' });
    } finally {
      setDialogOpen(false);
      setDialogUser(null);
      setDialogAction('');
    }
  };

  const getStatusChip = (status) => {
    const chipStyle = { fontSize: '0.75rem', height: '24px' };
    switch (status) {
      case 'Approved':
        return <Chip icon={<CheckCircle style={{ fontSize: '16px' }} />} label="Approved" color="success" style={chipStyle} />;
      case 'Pending':
        return <Chip icon={<Warning style={{ fontSize: '16px' }} />} label="Pending" color="warning" style={chipStyle} />;
      case 'Rejected':
        return <Chip icon={<Cancel style={{ fontSize: '16px' }} />} label="Rejected" color="error" style={chipStyle} />;
      default:
        return <Chip label={status} style={chipStyle} />;
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh', 
        backgroundColor: '#f5f5f7'
      }}>
        <CircularProgress style={{ color: '#FF9933' }} />
        <Typography variant="h6" style={{ marginLeft: '16px', color: '#000080', fontWeight: 500 }}>
          Loading Election Management Dashboard...
        </Typography>
      </Box>
    );
  }

  const pendingVoters = voters.filter((v) => v.voterStatus === 'Pending');
  const pendingOfficials = officials.filter((o) => o.officialStatus === 'Pending');

  // Get current page of audit logs
  const paginatedLogs = rowsPerPage > 0
    ? auditLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : auditLogs;

  return (
    <Container maxWidth="xl" style={{ marginTop: '32px', marginBottom: '32px' }}>
      <Paper
        elevation={3}
        style={{
          padding: '24px',
          marginBottom: '24px',
          backgroundColor: '#ffffff',
          borderLeft: '4px solid #000080',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Avatar style={{ backgroundColor: '#000080', marginRight: '16px', width: '48px', height: '48px' }}>
          <SupervisorAccount style={{ fontSize: '28px' }} />
        </Avatar>
        <div>
          <Typography variant="h4" style={{ fontWeight: 700, color: '#000080', marginBottom: '4px' }}>
            Election Commission of India
          </Typography>
          <Typography variant="h6" style={{ color: '#455a64' }}>
            Administrative Control Panel
          </Typography>
        </div>
      </Paper>

      <Grid container spacing={3} style={{ marginBottom: '24px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            style={{ 
              padding: '16px', 
              textAlign: 'center', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '8px',
              borderTop: '4px solid #FF9933'
            }}
          >
            <HowToVote style={{ fontSize: '40px', color: '#FF9933' }} />
            <Typography variant="h5" style={{ fontWeight: 600, color: '#000080' }}>{elections.length}</Typography>
            <Typography variant="body1" style={{ color: '#455a64' }}>Active Elections</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            style={{ 
              padding: '16px', 
              textAlign: 'center', 
              backgroundColor: '#e8f5e9', 
              borderRadius: '8px',
              borderTop: '4px solid #138808'
            }}
          >
            <Person style={{ fontSize: '40px', color: '#138808' }} />
            <Typography variant="h5" style={{ fontWeight: 600, color: '#000080' }}>{candidates.length}</Typography>
            <Typography variant="body1" style={{ color: '#455a64' }}>Registered Candidates</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            style={{ 
              padding: '16px', 
              textAlign: 'center', 
              backgroundColor: '#fff8e1', 
              borderRadius: '8px',
              borderTop: '4px solid #FF9933'
            }}
          >
            <VerifiedUser style={{ fontSize: '40px', color: '#FF9933' }} />
            <Typography variant="h5" style={{ fontWeight: 600, color: '#000080' }}>{pendingVoters.length}</Typography>
            <Typography variant="body1" style={{ color: '#455a64' }}>Pending Voters</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            style={{ 
              padding: '16px', 
              textAlign: 'center', 
              backgroundColor: '#ffebee', 
              borderRadius: '8px',
              borderTop: '4px solid #000080'
            }}
          >
            <GppGood style={{ fontSize: '40px', color: '#000080' }} />
            <Typography variant="h5" style={{ fontWeight: 600, color: '#000080' }}>{pendingOfficials.length}</Typography>
            <Typography variant="body1" style={{ color: '#455a64' }}>Pending Officials</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={3} style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            style={{ borderBottom: '1px solid #e0e0e0' }}
            TabIndicatorProps={{ style: { backgroundColor: '#FF9933' } }}
          >
            <Tab
              icon={<Timeline style={{ fontSize: '20px' }} />}
              label="Activity Logs"
              style={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', color: tabValue === 0 ? '#000080' : 'inherit' }}
            />
            <Tab
              icon={<EventAvailable style={{ fontSize: '20px' }} />}
              label="Elections"
              style={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', color: tabValue === 1 ? '#000080' : 'inherit' }}
            />
            <Tab
              icon={<Person style={{ fontSize: '20px' }} />}
              label="Candidates"
              style={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', color: tabValue === 2 ? '#000080' : 'inherit' }}
            />
            <Tab
              icon={<VerifiedUser style={{ fontSize: '20px' }} />}
              label="Voter Verifications"
              style={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', color: tabValue === 3 ? '#000080' : 'inherit' }}
            />
            <Tab
              icon={<SupervisorAccount style={{ fontSize: '20px' }} />}
              label="Official Approvals"
              style={{ fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', color: tabValue === 4 ? '#000080' : 'inherit' }}
            />
          </Tabs>
          <IconButton onClick={fetchData} style={{ color: '#FF9933' }}>
            <Refresh style={{ fontSize: '24px' }} />
          </IconButton>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#000080', fontWeight: 600 }}>
            <Timeline style={{ marginRight: '8px', color: '#FF9933' }} /> System Activity Logs
          </Typography>
          {auditLogs.length > 0 ? (
            <>
              <TableContainer component={Paper} elevation={1} style={{ borderRadius: '8px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                      {/* <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Log ID</TableCell> */}
                      <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Action</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Details</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedLogs.map((log) => (
                      <TableRow key={log.auditId} hover style={{ cursor: 'pointer' }}>
                        {/* <TableCell>{log.auditId}</TableCell> */}
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.details}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={auditLogs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                style={{ color: '#455a64' }}
              />
            </>
          ) : (
            <Paper elevation={1} style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <Typography style={{ color: '#666' }}>No activity logs available</Typography>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#000080', fontWeight: 600 }}>
            <EventAvailable style={{ marginRight: '8px', color: '#FF9933' }} /> Election Management
          </Typography>
          <Grid container spacing={2}>
            {elections.length > 0 ? (
              elections.map((e) => (
                <Grid item xs={12} sm={6} md={4} key={e.electionID}>
                  <Card elevation={2} style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', borderTop: '4px solid #FF9933' }}>
                    <CardContent style={{ flexGrow: 1 }}>
                      <Typography variant="h6" style={{ fontWeight: 600, color: '#000080', marginBottom: '8px' }}>
                        {e.name}
                      </Typography>
                      <Divider style={{ margin: '8px 0' }} />
                      <Typography variant="body2" style={{ color: '#455a64', margin: '8px 0' }}>
                        <strong>Status:</strong> {getStatusChip(e.status)}
                      </Typography>
                      <Typography variant="body2" style={{ color: '#455a64', margin: '4px 0' }}>
                        <strong>Start Date:</strong> {new Date(e.startDate).toLocaleDateString('en-IN')}
                      </Typography>
                      <Typography variant="body2" style={{ color: '#455a64', margin: '4px 0' }}>
                        <strong>End Date:</strong> {new Date(e.endDate).toLocaleDateString('en-IN')}
                      </Typography>
                      <Typography variant="body2" style={{ marginTop: '8px', color: '#666' }}>{e.description}</Typography>
                    </CardContent>
                    <CardActions style={{ padding: '16px', backgroundColor: '#f9f9f9' }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        style={{ 
                          color: '#ffffff', 
                          backgroundColor: '#FF9933', 
                          textTransform: 'none',
                          padding: '6px 12px',
                          marginRight: '8px'
                        }}
                        onClick={() => navigate(`/election/${e.electionID}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Assessment />}
                        style={{ 
                          color: '#ffffff', 
                          backgroundColor: '#138808', 
                          textTransform: 'none',
                          padding: '6px 12px'
                        }}
                        onClick={() => navigate(`/election/${e.electionID}/results`)}
                      >
                        Results
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper elevation={1} style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <Typography style={{ color: '#666' }}>No elections available</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#000080', fontWeight: 600 }}>
            <Person style={{ marginRight: '8px', color: '#FF9933' }} /> Registered Candidates
          </Typography>
          <Grid container spacing={2}>
            {candidates.length > 0 ? (
              candidates.map((c) => (
                <Grid item xs={12} sm={6} md={4} key={c.candidateID}>
                  <Card elevation={2} style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', borderTop: '4px solid #138808' }}>
                    <CardContent style={{ flexGrow: 1 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <Avatar style={{ backgroundColor: '#FF9933', marginRight: '12px', width: '40px', height: '40px' }}>
                          {c.firstName.charAt(0) + c.lastName.charAt(0)}
                        </Avatar>
                        <Typography variant="h6" style={{ fontWeight: 600, color: '#000080' }}>
                          {c.firstName} {c.lastName}
                        </Typography>
                      </Box>
                      <Divider style={{ margin: '8px 0' }} />
                      <Typography variant="body2" style={{ color: '#455a64', margin: '4px 0' }}>
                        <strong>Party:</strong> {c.party.partyName}
                      </Typography>
                      <Typography variant="body2" style={{ color: '#455a64', margin: '4px 0' }}>
                        <strong>Position:</strong> {c.position}
                      </Typography>
                      <Typography variant="body2" style={{ color: '#455a64', margin: '4px 0' }}>
                        <strong>Election:</strong> {elections.find((e) => e.electionID === c.electionID)?.name || 'Unknown'}
                      </Typography>
                    </CardContent>
                    <CardActions style={{ padding: '16px', backgroundColor: '#f9f9f9' }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        style={{ 
                          color: '#ffffff', 
                          backgroundColor: '#000080', 
                          textTransform: 'none',
                          padding: '6px 12px' 
                        }}
                        onClick={() => navigate(`/candidate/${c.candidateID}`)}
                      >
                        View Profile
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper elevation={1} style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <Typography style={{ color: '#666' }}>No candidates available</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#000080', fontWeight: 600 }}>
            <VerifiedUser style={{ marginRight: '8px', color: '#FF9933' }} /> Voter Verification Queue
          </Typography>
          {pendingVoters.length > 0 ? (
            <TableContainer component={Paper} elevation={1} style={{ borderRadius: '8px' }}>
              <Table>
                <TableHead>
                  <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Voter ID</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Name</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Email</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Aadhaar Number</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Status</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingVoters.map((v) => (
                    <TableRow key={v.voterID} hover style={{ cursor: 'pointer' }}>
                      <TableCell>{v.voterID}</TableCell>
                      <TableCell>{v.firstName} {v.lastName}</TableCell>
                      <TableCell>{v.email}</TableCell>
                      <TableCell>{v.nationalID}</TableCell>
                      <TableCell>{getStatusChip(v.voterStatus)}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleAction(v, 'approveVoter', false)}
                          startIcon={<CheckCircle />}
                          style={{ 
                            marginRight: '8px', 
                            textTransform: 'none',
                            backgroundColor: '#138808'
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleAction(v, 'rejectVoter', false)}
                          startIcon={<Cancel />}
                          style={{ textTransform: 'none' }}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper elevation={1} style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <Typography style={{ color: '#666' }}>No pending voter verifications</Typography>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
  <Typography variant="h6" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#000080', fontWeight: 600 }}>
    <SupervisorAccount style={{ marginRight: '8px', color: '#FF9933' }} /> Official Approval Queue
  </Typography>
  {pendingOfficials.length > 0 ? (
    <TableContainer component={Paper} elevation={1} style={{ borderRadius: '8px' }}>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: '#f5f5f5' }}>
            <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Official ID</TableCell>
            <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Name</TableCell>
            <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Email</TableCell>
            <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Position</TableCell>
            <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Status</TableCell>
            <TableCell style={{ fontWeight: 'bold', color: '#000080' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingOfficials.map((o) => (
            <TableRow key={o.officialID} hover style={{ cursor: 'pointer' }}>
              <TableCell>{o.officialID}</TableCell>
              <TableCell>{o.firstName} {o.lastName}</TableCell>
              <TableCell>{o.email}</TableCell>
              <TableCell>{o.position}</TableCell>
              <TableCell>{getStatusChip(o.officialStatus)}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => handleAction(o, 'approveOfficial', true)}
                  startIcon={<CheckCircle />}
                  style={{ 
                    marginRight: '8px', 
                    textTransform: 'none',
                    backgroundColor: '#138808'
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleAction(o, 'rejectOfficial', true)}
                  startIcon={<Cancel />}
                  style={{ textTransform: 'none' }}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Paper elevation={1} style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <Typography style={{ color: '#666' }}>No pending official approvals</Typography>
    </Paper>
  )}
</TabPanel>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>{dialogAction === 'approveVoter' || dialogAction === 'approveOfficial' ? 'Confirm Approval' : 'Confirm Rejection'}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {dialogAction === 'approveVoter' && `Are you sure you want to approve voter ${dialogUser?.firstName} ${dialogUser?.lastName}?`}
            {dialogAction === 'rejectVoter' && `Are you sure you want to reject voter ${dialogUser?.firstName} ${dialogUser?.lastName}?`}
            {dialogAction === 'approveOfficial' && `Are you sure you want to approve official ${dialogUser?.firstName} ${dialogUser?.lastName}?`}
            {dialogAction === 'rejectOfficial' && `Are you sure you want to reject official ${dialogUser?.firstName} ${dialogUser?.lastName}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={confirmAction} 
            color={dialogAction.includes('approve') ? 'success' : 'error'}
            variant="contained"
          >
            {dialogAction.includes('approve') ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminDashboard;