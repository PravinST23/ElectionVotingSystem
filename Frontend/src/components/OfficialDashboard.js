import React, { useEffect, useState, useRef } from 'react';
import { 
  Container, Typography, Grid, Paper, Box, Tabs, Tab, CircularProgress,
  Card, CardContent, CardHeader, Divider, IconButton, Tooltip, Chip,
  Button, Alert, Avatar, List, ListItem, ListItemText, ListItemAvatar,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, FormControl, InputLabel, Select, MenuItem, Badge
} from '@mui/material';
import { 
  Assessment, Refresh, Dashboard, HowToVote, LocationOn, Person, 
  NotificationsActive, Add, Edit, DoneAll, Block, GroupAdd,
  EventAvailable, Flag, BarChart, Visibility, Delete
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getCandidates, getElections, addCandidate, createElection, getParties, updateElectionStatus, deleteElection } from '../services/api';
import signalRService from '../services/signalr';
import toast from 'react-hot-toast';

// Custom colors for political parties
const partyColors = {
  'BJP': '#FF9F40',
  'INC': '#4BC0C0',
  'AAP': '#36A2EB',
  'CPI(M)': '#FF6384',
  'TMC': '#9966FF',
  'SP': '#C9CBCF',
  'BSP': '#00A19D',
  'DMK': '#FF0000',
  'AIADMK': '#008000',
  'TDP': '#FFFF00',
  'Others': '#808080'
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function OfficialDashboard() {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [electionDialog, setElectionDialog] = useState(false);
  const [candidateDialog, setCandidateDialog] = useState(false);
  const [editElectionDialog, setEditElectionDialog] = useState(false);
  const [newElection, setNewElection] = useState({
    name: '',
    description: '',
    region: '',
    date: new Date().toISOString().slice(0, 10),
    registeredVoters: 0,
    status: 'Pending',
    electionType: 'General', // Added to match server model
    constituency: '' // Added to match server model
  });
  const [newCandidate, setNewCandidate] = useState({
    firstName: '',
    lastName: '',
    partyID: '',
    electionID: '',
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)
  });
  const [editElection, setEditElection] = useState(null);
  
  const hasConnectedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required. Please log in as an official.', {
        position: 'top-center',
        icon: '⚠️'
      });
      navigate('/login');
      return;
    }

    fetchData();

    if (!hasConnectedRef.current) {
      connectToSignalR();
      hasConnectedRef.current = true;
    }

    const demoNotifications = [
      { id: 1, message: 'New voter registered in Mumbai North', time: '10 minutes ago', read: false },
      { id: 2, message: 'Election status updated: Delhi Municipal now Active', time: '25 minutes ago', read: false },
      { id: 3, message: 'Candidate verification pending for 3 candidates', time: '1 hour ago', read: true }
    ];
    setNotifications(demoNotifications);
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [electionData, candidateData, partyData] = await Promise.all([
        getElections(),
        getCandidates(),
        getParties()
      ]);
      
      setElections(Array.isArray(electionData) ? electionData : []);
      setCandidates(Array.isArray(candidateData) ? candidateData : []);
      setParties(Array.isArray(partyData) ? partyData : []);
      setLastUpdated(new Date());
      
      toast.success('Data loaded successfully', {
        position: 'top-center',
        icon: '✅'
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please check your connection.', {
        position: 'top-center',
        icon: '❌'
      });
    } finally {
      setLoading(false);
    }
  };

  const connectToSignalR = () => {
    signalRService.onElectionStatusUpdate((electionId, status) => {
      setElections(prev => 
        prev.map(e => e.electionID === electionId ? { ...e, status } : e)
      );
      toast.success(`Election status updated: ID ${electionId} is now ${status}`, { 
        position: 'top-center',
        icon: '🗳️' 
      });
      addNotification(`Election status updated: ID ${electionId} is now ${status}`);
    });

    signalRService.onCandidateUpdate((candidate) => {
      setCandidates(prev => [...prev, candidate]);
      toast.success(`New candidate registered: ${candidate.firstName} ${candidate.lastName}`, { 
        position: 'top-center',
        icon: '👤' 
      });
      addNotification(`New candidate registered: ${candidate.firstName} ${candidate.lastName}`);
    });
  };

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleElectionDialogOpen = () => {
    setElectionDialog(true);
  };

  const handleElectionDialogClose = () => {
    setElectionDialog(false);
  };

  const handleCandidateDialogOpen = () => {
    setCandidateDialog(true);
  };

  const handleCandidateDialogClose = () => {
    setCandidateDialog(false);
  };

  const handleElectionChange = (e) => {
    setNewElection({
      ...newElection,
      [e.target.name]: e.target.value
    });
  };

  const handleCandidateChange = (e) => {
    setNewCandidate({
      ...newCandidate,
      [e.target.name]: e.target.value
    });
  };

  const validateCandidateData = () => {
    const errors = {};
    if (!newCandidate.firstName.trim()) errors.firstName = 'First name is required';
    if (!newCandidate.lastName.trim()) errors.lastName = 'Last name is required';
    if (!newCandidate.partyID) errors.partyID = 'Party selection is required';
    if (isNaN(parseInt(newCandidate.partyID))) errors.partyID = 'Invalid party selection';
    if (!newCandidate.electionID) errors.electionID = 'Election selection is required';
    if (isNaN(parseInt(newCandidate.electionID))) errors.electionID = 'Invalid election selection';
    if (!newCandidate.validFrom) errors.validFrom = 'Valid from date is required';
    if (!newCandidate.validUntil) errors.validUntil = 'Valid until date is required';
    if (new Date(newCandidate.validUntil) <= new Date(newCandidate.validFrom)) {
      errors.validUntil = 'Valid until must be after valid from';
    }
    return errors;
  };

  const handleCreateElection = async () => {
    try {
      // Map newElection state to server-expected payload
      const payload = {
        Name: newElection.name.trim(),
        Description: newElection.description.trim() || null,
        VotingStartTime: new Date(newElection.date).toISOString(), // Convert date to ISO 8601
        VotingEndTime: new Date(new Date(newElection.date).setHours(17, 0, 0)).toISOString(), // End at 5 PM same day
        ElectionType: newElection.electionType,
        Constituency: newElection.region.trim() || newElection.constituency.trim() || 'Pan-India',
        Status: newElection.status
        // Note: registeredVoters is not sent as it's likely server-managed
      };

      console.log('Sending payload to /api/Election:', JSON.stringify(payload, null, 2)); // Debug log

      const createdElection = await createElection(payload);
      setElections([...elections, createdElection]);
      setElectionDialog(false);
      
      toast.success(`Election "${newElection.name}" created successfully`, {
        position: 'top-center',
        icon: '🗳️'
      });
      
      addNotification(`New election created: ${newElection.name}`);
      
      setNewElection({
        name: '',
        description: '',
        region: '',
        date: new Date().toISOString().slice(0, 10),
        registeredVoters: 0,
        status: 'Pending',
        electionType: 'General',
        constituency: ''
      });
    } catch (error) {
      console.error('Error creating election:', error);
      console.log('Full error response:', JSON.stringify(error.response?.data, null, 2)); // Log full error
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.title || 'Failed to create election. Please check the details.';
      toast.error(errorMessage, {
        position: 'top-center',
        icon: '❌'
      });
    }
  };

  const handleAddCandidate = async () => {
    const validationErrors = validateCandidateData();
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the following errors: ' + Object.values(validationErrors).join(', '), {
        position: 'top-center',
        icon: '❌'
      });
      return;
    }

    try {
      const payload = {
        FirstName: newCandidate.firstName.trim(), // PascalCase to match C# model
        LastName: newCandidate.lastName.trim(),   // PascalCase
        PartyID: parseInt(newCandidate.partyID),  // PascalCase
        ElectionID: parseInt(newCandidate.electionID), // PascalCase
        ValidFrom: new Date(newCandidate.validFrom).toISOString(), // Full ISO 8601
        ValidUntil: new Date(newCandidate.validUntil).toISOString() // Full ISO 8601
      };

      console.log('Sending payload to /api/Candidate:', JSON.stringify(payload, null, 2)); // Detailed log

      const createdCandidate = await addCandidate(payload);
      setCandidates([...candidates, createdCandidate]);
      setCandidateDialog(false);
      
      toast.success(`Candidate "${newCandidate.firstName} ${newCandidate.lastName}" added successfully`, {
        position: 'top-center',
        icon: '👤'
      });
      
      addNotification(`New candidate added: ${newCandidate.firstName} ${newCandidate.lastName}`);
      
      setNewCandidate({
        firstName: '',
        lastName: '',
        partyID: '',
        electionID: '',
        validFrom: new Date().toISOString().slice(0, 10),
        validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)
      });
    } catch (error) {
      console.error('Error adding candidate:', error);
      console.log('Full error response:', JSON.stringify(error.response?.data, null, 2)); // Log full error details
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.title || 'Failed to add candidate. Please check the details.';
      toast.error(errorMessage, {
        position: 'top-center',
        icon: '❌'
      });
    }
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getCandidatesByElection = (electionId) => {
    return candidates.filter(c => c.electionID === electionId);
  };

  const getElectionStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Completed':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleEditElectionDialogOpen = (election) => {
    setEditElection({
      electionID: election.electionID,
      name: election.name,
      description: election.description || '',
      region: election.region || '',
      date: election.date ? new Date(election.date).toISOString().slice(0, 10) : '',
      registeredVoters: election.registeredVoters || 0,
      status: election.status || 'Pending'
    });
    setEditElectionDialog(true);
  };

  const handleEditElectionDialogClose = () => {
    setEditElectionDialog(false);
    setEditElection(null);
  };

  const handleEditElectionChange = (e) => {
    setEditElection({
      ...editElection,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateElectionStatus = async () => {
    try {
      await updateElectionStatus(editElection.electionID, editElection.status);
      setElections(prev =>
        prev.map(e =>
          e.electionID === editElection.electionID ? { ...e, status: editElection.status } : e
        )
      );
      setEditElectionDialog(false);
      
      toast.success(`Election "${editElection.name}" status updated to ${editElection.status}`, {
        position: 'top-center',
        icon: '🗳️'
      });
      
      addNotification(`Election status updated: ${editElection.name} to ${editElection.status}`);
      setEditElection(null);
    } catch (error) {
      console.error('Error updating election status:', error);
      toast.error('Failed to update election status. Please try again.', {
        position: 'top-center',
        icon: '❌'
      });
    }
  };

  const handleDeleteElection = async (electionId, electionName) => {
    if (window.confirm(`Are you sure you want to delete the election "${electionName}"?`)) {
      try {
        await deleteElection(electionId);
        setElections(prev => prev.filter(e => e.electionID !== electionId));
        
        toast.success(`Election "${electionName}" deleted successfully`, {
          position: 'top-center',
          icon: '🗑️'
        });
        
        addNotification(`Election deleted: ${electionName}`);
      } catch (error) {
        console.error('Error deleting election:', error);
        toast.error('Failed to delete election. Please try again.', {
          position: 'top-center',
          icon: '❌'
        });
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Official Dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(to right, #11047A, #001f3f)' }} elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Dashboard fontSize="large" sx={{ mr: 2, color: 'white' }} />
            <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
              Election Commission Official Dashboard
            </Typography>
          </Box>
          <Box>
            <Badge badgeContent={getUnreadNotificationsCount()} color="error" sx={{ mr: 2 }}>
              <Tooltip title="Notifications">
                <IconButton onClick={markAllNotificationsAsRead} aria-label="notifications" sx={{ color: 'white' }}>
                  <NotificationsActive />
                </IconButton>
              </Tooltip>
            </Badge>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} aria-label="refresh" sx={{ color: 'white' }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
          </Typography>
          <Chip 
            icon={<Person sx={{ color: 'white' }} />} 
            label={`Officials Portal | Secure Access`}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.3)' 
            }}
          />
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader 
              title="Active Elections" 
              avatar={<EventAvailable sx={{ color: '#FF9F40' }} />}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                {elections.filter(e => e.status === 'Active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Currently ongoing elections
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader 
              title="Pending Candidates" 
              avatar={<Person sx={{ color: '#4BC0C0' }} />}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                {candidates.filter(c => c.status === 'Pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Awaiting verification
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader 
              title="Total Constituencies" 
              avatar={<LocationOn sx={{ color: '#36A2EB' }} />}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                543
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Parliamentary constituencies
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardHeader 
              title="Total Registered Voters" 
              avatar={<HowToVote sx={{ color: '#FF6384' }} />}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                {(900000000).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Eligible voters across India
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleElectionDialogOpen}
            sx={{ background: 'linear-gradient(to right, #FF9F40, #FF8042)', fontWeight: 'bold' }}
          >
            Create Election
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            startIcon={<GroupAdd />}
            onClick={() => navigate('/official/candidate-registration')}
            sx={{ background: 'linear-gradient(to right, #4BC0C0, #36A2EB)', fontWeight: 'bold' }}
          >
            Add Candidate
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            startIcon={<Flag />}
            onClick={() => navigate('/official/add-party')}
            sx={{ background: 'linear-gradient(to right, #9966FF, #8A56FF)', fontWeight: 'bold' }}
          >
            Register Party
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            startIcon={<BarChart />}
            onClick={() => navigate('/analytics')}
            sx={{ background: 'linear-gradient(to right, #FF6384, #FF4374)', fontWeight: 'bold' }}
          >
            View Analytics
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 4, p: 0 }} elevation={3}>
        <CardHeader 
          title="Recent Notifications" 
          avatar={<NotificationsActive color="primary" />}
          action={
            <Button 
              size="small" 
              color="primary" 
              onClick={markAllNotificationsAsRead}
              disabled={getUnreadNotificationsCount() === 0}
            >
              Mark all as read
            </Button>
          }
        />
        <Divider />
        <List sx={{ maxHeight: '200px', overflow: 'auto' }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem alignItems="flex-start" sx={{ backgroundColor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)' }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.read ? 'grey.300' : 'primary.main' }}>
                      {notification.read ? <DoneAll /> : <NotificationsActive />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.message}
                    secondary={notification.time}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No notifications" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Paper sx={{ mb: 4 }} elevation={3}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Manage Elections" icon={<EventAvailable />} />
          <Tab label="Candidate Management" icon={<Person />} />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Manage all elections across different constituencies. You can create, update or view the status of any election.
          </Alert>
          
          <Grid container spacing={3}>
            {elections.length > 0 ? (
              elections.map((election) => (
                <Grid item xs={12} md={6} lg={4} key={election.electionID}>
                  <Card elevation={2} sx={{ height: '100%' }}>
                    <CardHeader
                      title={election.name}
                      subheader={`Region: ${election.region || 'Pan-India'}`}
                      action={
                        <Chip 
                          label={election.status || 'Pending'} 
                          color={getElectionStatusColor(election.status)}
                          size="small"
                        />
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {election.description || 'No description available'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong> {new Date(election.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Registered Voters:</strong> {election.registeredVoters?.toLocaleString() || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Candidates:</strong> {getCandidatesByElection(election.electionID).length}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                          size="small" 
                          startIcon={<Edit />} 
                          variant="outlined"
                          onClick={() => handleEditElectionDialogOpen(election)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<Visibility />} 
                          variant="outlined" 
                          color="primary"
                          onClick={() => navigate(`/election/${election.electionID}`)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<Delete />} 
                          variant="outlined" 
                          color="error"
                          onClick={() => handleDeleteElection(election.electionID, election.name)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="warning">
                  No elections found. Create an election to get started.
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Manage candidate registrations, verify their credentials, and assign them to appropriate elections.
          </Alert>
          
          <Grid container spacing={3}>
            {candidates.length > 0 ? (
              candidates.map((candidate) => (
                <Grid item xs={12} md={6} lg={4} key={candidate.candidateID}>
                  <Card elevation={2} sx={{ height: '100%' }}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: partyColors[candidate.party?.partyName] || '#757575' }}>
                          {candidate.firstName?.charAt(0) || 'C'}
                        </Avatar>
                      }
                      title={`${candidate.firstName} ${candidate.lastName}`}
                      subheader={`Party: ${candidate.party?.partyName || 'Unknown'}`}
                      action={
                        <Chip 
                          label={candidate.status || 'Pending'} 
                          color={candidate.status === 'Verified' ? 'success' : 'warning'}
                          size="small"
                        />
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="body2">
                        <strong>Election:</strong> {elections.find(e => e.electionID === candidate.electionID)?.name || 'Not assigned'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Valid From:</strong> {new Date(candidate.validFrom).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Valid Until:</strong> {new Date(candidate.validUntil).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                          size="small" 
                          startIcon={<DoneAll />} 
                          variant="outlined" 
                          color="success"
                          onClick={() => toast.success(`Candidate "${candidate.firstName} ${candidate.lastName}" verified!`)}
                        >
                          Verify
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<Block />} 
                          variant="outlined" 
                          color="error"
                          onClick={() => toast.error(`Candidate "${candidate.firstName} ${candidate.lastName}" rejected!`)}
                        >
                          Reject
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="warning">
                  No candidates found. Add candidates to get started.
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>

      <Dialog open={electionDialog} onClose={handleElectionDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Election</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please fill in the details to create a new election.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Election Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newElection.name}
            onChange={handleElectionChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newElection.description}
            onChange={handleElectionChange}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="region"
                label="Region"
                type="text"
                fullWidth
                variant="outlined"
                value={newElection.region}
                onChange={handleElectionChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="date"
                label="Election Date"
                type="date"
                fullWidth
                variant="outlined"
                value={newElection.date}
                onChange={handleElectionChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="registeredVoters"
                label="Registered Voters"
                type="number"
                fullWidth
                variant="outlined"
                value={newElection.registeredVoters}
                onChange={handleElectionChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={newElection.status}
                  label="Status"
                  onChange={handleElectionChange}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Election Type</InputLabel>
                <Select
                  name="electionType"
                  value={newElection.electionType}
                  label="Election Type"
                  onChange={handleElectionChange}
                >
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="State">State</MenuItem>
                  <MenuItem value="Municipal">Municipal</MenuItem>
                  <MenuItem value="By-Election">By-Election</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="constituency"
                label="Constituency"
                type="text"
                fullWidth
                variant="outlined"
                value={newElection.constituency}
                onChange={handleElectionChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleElectionDialogClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateElection} 
            color="primary" 
            variant="contained"
            disabled={!newElection.name || !newElection.date || !newElection.electionType || !newElection.constituency}
          >
            Create Election
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={candidateDialog} onClose={handleCandidateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Candidate</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter candidate details for registration. All fields are required.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                margin="dense"
                name="firstName"
                label="First Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newCandidate.firstName}
                onChange={handleCandidateChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="lastName"
                label="Last Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newCandidate.lastName}
                onChange={handleCandidateChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Political Party</InputLabel>
                <Select
                  name="partyID"
                  value={newCandidate.partyID}
                  label="Political Party"
                  onChange={handleCandidateChange}
                >
                  {parties.map(party => (
                    <MenuItem key={party.partyID} value={party.partyID}>
                      {party.partyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Election</InputLabel>
                <Select
                  name="electionID"
                  value={newCandidate.electionID}
                  label="Election"
                  onChange={handleCandidateChange}
                >
                  {elections.map(election => (
                    <MenuItem key={election.electionID} value={election.electionID}>
                      {election.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="validFrom"
                label="Valid From"
                type="date"
                fullWidth
                variant="outlined"
                value={newCandidate.validFrom}
                onChange={handleCandidateChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="validUntil"
                label="Valid Until"
                type="date"
                fullWidth
                variant="outlined"
                value={newCandidate.validUntil}
                onChange={handleCandidateChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCandidateDialogClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddCandidate} 
            color="primary" 
            variant="contained"
            disabled={!newCandidate.firstName || !newCandidate.lastName || !newCandidate.partyID || !newCandidate.electionID || !newCandidate.validFrom || !newCandidate.validUntil}
          >
            Add Candidate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Election Dialog */}
      {editElection && (
        <Dialog open={editElectionDialog} onClose={handleEditElectionDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Election</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Update the status of the selected election.
            </DialogContentText>
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={editElection.status}
                label="Status"
                onChange={handleEditElectionChange}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditElectionDialogClose} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateElectionStatus} 
              color="primary" 
              variant="contained"
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Election Commission | Official Dashboard | All rights reserved
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Secure access only. All actions are logged and monitored.
        </Typography>
      </Box>
    </Container>
  );
}

export default OfficialDashboard;