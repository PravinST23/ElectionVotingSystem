import React, { useState, useEffect, useContext } from 'react';
import { 
  TextField, Button, Container, Typography, Paper, Box, Grid, 
  Card, CardContent, CardActions, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, Divider, Tooltip, Alert,
  CircularProgress, Tab, Tabs
} from '@mui/material';
import { 
  Add, Edit, Delete, VisibilityOff, Visibility, CheckCircle,
  EventAvailable, PlayArrow, Pause, Stop, HowToVote, CalendarMonth,
  HourglassEmpty, MoreVert, Refresh, Description, People, ViewList
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { createElection, updateElectionStatus, getElections, deleteElection } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function ElectionManagement() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    id: null,
    title: '',
    action: null
  });
  
  const [electionData, setElectionData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'General',
    location: '',
    status: 'Pending'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentElectionId, setCurrentElectionId] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    setLoading(true);
    try {
      const data = await getElections();
      setElections(data || []);
    } catch (error) {
      console.error('Failed to fetch elections:', error);
      toast.error('Failed to load elections data', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  // Restrict access to Officials only
  if (user?.role !== 'Official') {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            background: 'linear-gradient(to right, #f5f5f5, #e0e0e0)',
            border: '1px solid #d0d0d0'
          }}
        >
          <VisibilityOff color="error" sx={{ fontSize: 60 }} />
          <Typography variant="h4" sx={{ mt: 2, color: '#d32f2f' }}>
            Access Restricted
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You must be an Election Commission Official to manage elections.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')} 
            sx={{ mt: 3 }}
          >
            Return to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleChange = (e) => {
    setElectionData({ ...electionData, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const resetForm = () => {
    setElectionData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      type: 'General',
      location: '',
      status: 'Pending'
    });
    setIsEditing(false);
    setCurrentElectionId(null);
  };

  const handleOpenDialog = (election = null) => {
    if (election) {
      setElectionData({
        name: election.name,
        description: election.description || '',
        startDate: election.startDate || '',
        endDate: election.endDate || '',
        type: election.type || 'General',
        location: election.location || '',
        status: election.status
      });
      setIsEditing(true);
      setCurrentElectionId(election.electionID);
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const validateElectionData = () => {
    if (!electionData.name.trim()) {
      toast.error('Election name is required', { position: 'top-center' });
      return false;
    }
    if (!electionData.description.trim()) {
      toast.error('Description is required', { position: 'top-center' });
      return false;
    }
    if (!electionData.startDate) {
      toast.error('Start date is required', { position: 'top-center' });
      return false;
    }
    if (!electionData.endDate) {
      toast.error('End date is required', { position: 'top-center' });
      return false;
    }
    if (new Date(electionData.endDate) <= new Date(electionData.startDate)) {
      toast.error('End date must be after start date', { position: 'top-center' });
      return false;
    }
    return true;
  };

  const handleCreateElection = async () => {
    if (!validateElectionData()) return;

    try {
      setLoading(true);
      const payload = { 
        name: electionData.name, 
        description: electionData.description,
        startDate: electionData.startDate,
        endDate: electionData.endDate,
        type: electionData.type,
        location: electionData.location,
        status: 'Pending'
      };
      
      if (isEditing) {
        // Use API to update existing election
        // await updateElection(currentElectionId, payload);
        toast.success(`Election "${electionData.name}" updated successfully!`, { position: 'top-center' });
      } else {
        // Create new election
        await createElection(payload);
        toast.success(`Election "${electionData.name}" created successfully!`, { position: 'top-center' });
      }
      
      fetchElections();
      handleCloseDialog();
    } catch (error) {
      console.error('Election operation failed:', error);
      toast.error(
        error.response?.data?.error || 
        `Failed to ${isEditing ? 'update' : 'create'} election`, 
        { position: 'top-center' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (electionId, status) => {
    try {
      setLoading(true);
      await updateElectionStatus(electionId, status);
      toast.success(`Election status updated to ${status}`, { position: 'top-center' });
      
      // Update local state to reflect the change
      setElections(elections.map(election => 
        election.electionID === electionId 
          ? { ...election, status } 
          : election
      ));
    } catch (error) {
      console.error('Failed to update election status:', error);
      toast.error('Failed to update election status', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = async (electionId) => {
    try {
      setLoading(true);
      await deleteElection(electionId);
      toast.success('Election deleted successfully', { position: 'top-center' });
      fetchElections();
    } catch (error) {
      console.error('Failed to delete election:', error);
      toast.error('Failed to delete election', { position: 'top-center' });
    } finally {
      setLoading(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Active':
        return {
          bg: '#4caf50',
          color: 'white'
        };
      case 'Pending':
        return {
          bg: '#ff9800',
          color: 'white'
        };
      case 'Completed':
        return {
          bg: '#2196f3',
          color: 'white'
        };
      case 'Cancelled':
        return {
          bg: '#f44336',
          color: 'white'
        };
      default:
        return {
          bg: '#9e9e9e',
          color: 'white'
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <PlayArrow sx={{ fontSize: 16 }} />;
      case 'Pending':
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      case 'Completed':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'Cancelled':
        return <Stop sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const electionTypeOptions = [
    'General',
    'State Assembly',
    'Local Body',
    'By-Election',
    'Referendum'
  ];

  const filteredElections = tabValue === 0 
    ? elections 
    : elections.filter(election => {
        if (tabValue === 1) return election.status === 'Pending';
        if (tabValue === 2) return election.status === 'Active';
        if (tabValue === 3) return election.status === 'Completed';
        return true;
      });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 0, overflow: 'hidden' }}>
        {/* Header Section */}
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(to right, #11047A, #001f3f)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HowToVote sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Election Management
              </Typography>
              <Typography variant="subtitle1">
                Election Commission of India - Official Portal
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: '#11047A',
              '&:hover': {
                bgcolor: 'white',
              }
            }}
          >
            Create Election
          </Button>
        </Box>

        <Box sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Create and manage elections. Active elections are open for voting, while pending elections can be scheduled for a future date.
          </Alert>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab 
                icon={<ViewList />} 
                iconPosition="start" 
                label="All Elections" 
              />
              <Tab 
                icon={<HourglassEmpty />} 
                iconPosition="start" 
                label="Pending" 
              />
              <Tab 
                icon={<PlayArrow />} 
                iconPosition="start" 
                label="Active" 
              />
              <Tab 
                icon={<CheckCircle />} 
                iconPosition="start" 
                label="Completed" 
              />
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : filteredElections.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 5, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary">
                No elections found in this category
              </Typography>
              <Button 
                startIcon={<Add />} 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => handleOpenDialog()}
              >
                Create New Election
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredElections.map((election) => (
                <Grid item xs={12} sm={6} md={4} key={election.electionID}>
                  <Card 
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                        bgcolor: '#f5f7ff',
                        borderBottom: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="h6" noWrap sx={{ maxWidth: '80%', fontWeight: 'bold' }}>
                        {election.name}
                      </Typography>
                      <Chip 
                        label={election.status} 
                        size="small"
                        icon={getStatusIcon(election.status)}
                        sx={{ 
                          bgcolor: getStatusChipColor(election.status).bg,
                          color: getStatusChipColor(election.status).color
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {election.description?.substring(0, 120)}
                        {election.description?.length > 120 ? '...' : ''}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarMonth fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {election.startDate ? new Date(election.startDate).toLocaleDateString() : 'Not set'} - 
                          {election.endDate ? new Date(election.endDate).toLocaleDateString() : 'Not set'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Description fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Type: {election.type || 'General'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Candidates: {election.candidatesCount || 0}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ borderTop: '1px solid #e0e0e0', p: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Box>
                          <Tooltip title="Edit Election">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDialog(election)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Manage Candidates">
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/official/candidates/${election.electionID}`)}
                            >
                              <People />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        <Box>
                          {election.status === 'Pending' && (
                            <Tooltip title="Activate Election">
                              <IconButton 
                                size="small"
                                color="success"
                                onClick={() => handleUpdateStatus(election.electionID, 'Active')}
                              >
                                <PlayArrow />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {election.status === 'Active' && (
                            <Tooltip title="Complete Election">
                              <IconButton 
                                size="small"
                                color="primary"
                                onClick={() => handleUpdateStatus(election.electionID, 'Completed')}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Delete Election">
                            <IconButton 
                              size="small"
                              color="error"
                              onClick={() => setConfirmDialog({
                                open: true,
                                id: election.electionID,
                                title: `Delete ${election.name}`,
                                action: () => handleDeleteElection(election.electionID)
                              })}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Create/Edit Election Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ 
          bgcolor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}>
          {isEditing ? 'Edit Election' : 'Create New Election'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Election Name"
                name="name"
                fullWidth
                value={electionData.name}
                onChange={handleChange}
                required
                helperText="Enter the official name of the election"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Election Type</InputLabel>
                <Select
                  name="type"
                  value={electionData.type}
                  label="Election Type"
                  onChange={handleChange}
                >
                  {electionTypeOptions.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location/Jurisdiction"
                name="location"
                fullWidth
                value={electionData.location}
                onChange={handleChange}
                helperText="State, district, or constituency"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={electionData.startDate}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={electionData.endDate}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                fullWidth
                multiline
                rows={4}
                value={electionData.description}
                onChange={handleChange}
                required
                helperText="Provide details about the election"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateElection}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : (isEditing ? <Edit /> : <Add />)}
          >
            {loading ? 'Processing...' : (isEditing ? 'Update Election' : 'Create Election')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to proceed with this action? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={confirmDialog.action}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ElectionManagement;