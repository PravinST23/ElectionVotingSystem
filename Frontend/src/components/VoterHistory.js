import React, { useEffect, useState, useContext } from 'react';
import {
  Container, Typography, Box, Paper, CircularProgress, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, IconButton, TablePagination, Card, CardContent,
  Grid, Alert, LinearProgress
} from '@mui/material';
import {
  History, ArrowBack, EventNote, CheckCircle, Receipt, Download,
  Share, CalendarToday, PieChart, BarChart, HowToVote, OpenInNew
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { getVoterVotingHistory, getVoterProfile } from '../services/api'; // Correct import
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function VoterHistory() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voterProfile, setVoterProfile] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [stats, setStats] = useState({
    totalVotes: 0,
    participationRate: 0,
    nationalElections: 0,
    stateElections: 0,
    localElections: 0
  });

  useEffect(() => {
    const fetchVotingHistory = async () => {
      if (!token) {
        toast.error('Please log in to view your voting history', { position: 'top-center' });
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        // Get voter profile
        const profile = await getVoterProfile();
        setVoterProfile(profile);
        
        if (!profile?.voterID) {
          throw new Error('Voter profile not found');
        }

        // Get voting history
        const historyData = await getVoterVotingHistory(); // Removed profile.voterID as param
        setHistory(Array.isArray(historyData) ? historyData : []);
        
        // Calculate statistics
        if (Array.isArray(historyData) && historyData.length > 0) {
          const national = historyData.filter(h => h.electionType === 'National').length;
          const state = historyData.filter(h => h.electionType === 'State').length;
          const local = historyData.filter(h => h.electionType === 'Local').length;
          
          setStats({
            totalVotes: historyData.length,
            participationRate: Math.round((historyData.length / 10) * 100), // Assume 10 is total elections
            nationalElections: national,
            stateElections: state,
            localElections: local
          });
        }
      } catch (error) {
        console.error('Error fetching voting history:', error);
        toast.error(error.response?.data?.message || 'Failed to load voting history', { position: 'top-center' });
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'Voter') {
      fetchVotingHistory();
    }
  }, [token, user, navigate]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getElectionTypeChip = (type) => {
    switch (type) {
      case 'National':
        return <Chip label={type} color="primary" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'State':
        return <Chip label={type} color="secondary" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'Local':
        return <Chip label={type} color="success" size="small" sx={{ fontWeight: 'bold' }} />;
      default:
        return <Chip label={type || 'Unknown'} color="default" size="small" />;
    }
  };

  // Sample dummy data for testing if no API
  const dummyHistory = [
    {
      voteID: 'V12345',
      electionID: 'E1001',
      electionName: 'Lok Sabha General Elections 2024',
      electionType: 'National',
      candidateVoted: 'Rajesh Kumar',
      partyVoted: 'Bharatiya Janata Party',
      voteDate: '2024-04-10T08:30:00',
      constituency: 'Mumbai North'
    },
    {
      voteID: 'V12346',
      electionID: 'E1002',
      electionName: 'Maharashtra State Assembly Elections 2023',
      electionType: 'State',
      candidateVoted: 'Priya Sharma',
      partyVoted: 'Indian National Congress',
      voteDate: '2023-11-15T10:45:00',
      constituency: 'Andheri East'
    },
    {
      voteID: 'V12347',
      electionID: 'E1003',
      electionName: 'Mumbai Municipal Corporation Elections 2023',
      electionType: 'Local',
      candidateVoted: 'Sunil Patel',
      partyVoted: 'Aam Aadmi Party',
      voteDate: '2023-06-22T14:20:00',
      constituency: 'Ward 24'
    }
  ];

  // Use dummy data if history is empty (for development/demo purposes)
  const displayHistory = history.length > 0 ? history : dummyHistory;

  if (!user || user.role !== 'Voter') {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(to right, #f5f5f5, #e0e0e0)', border: '1px solid #d0d0d0' }}>
          <Typography variant="h4" sx={{ color: '#d32f2f' }}>
            Access Restricted
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You must be a registered voter to access this page.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 3 }}>
            Return to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
          Loading voting history...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/voter')}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <History sx={{ mr: 1.5, color: '#3f51b5' }} /> My Voting History
        </Typography>
      </Box>
      
      {/* Voting Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HowToVote sx={{ fontSize: 32, mr: 1.5 }} />
                <Typography variant="h6">
                  Total Votes Cast
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                {stats.totalVotes}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Participation Rate
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {stats.participationRate}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.participationRate} 
                sx={{ 
                  mt: 1, 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white'
                  }
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChart sx={{ fontSize: 28, mr: 1.5, color: '#3f51b5' }} />
                <Typography variant="h6" color="textPrimary">
                  Election Breakdown
                </Typography>
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="textSecondary">
                    National Elections
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.nationalElections}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.nationalElections / stats.totalVotes) * 100 || 0} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: 'rgba(63, 81, 181, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#3f51b5'
                    }
                  }} 
                />
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="textSecondary">
                    State Elections
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.stateElections}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.stateElections / stats.totalVotes) * 100 || 0} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: 'rgba(156, 39, 176, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#9c27b0'
                    }
                  }} 
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="textSecondary">
                    Local Elections
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.localElections}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.localElections / stats.totalVotes) * 100 || 0} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#4caf50'
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ fontSize: 28, mr: 1.5, color: '#3f51b5' }} />
                <Typography variant="h6" color="textPrimary">
                  Voter Profile
                </Typography>
              </Box>
              
              {voterProfile ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Voter ID
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {voterProfile.voterID || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Registration Date
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                    {voterProfile.dateOfBirth ? new Date(voterProfile.dateOfBirth).toLocaleDateString('en-IN') : 'Not available'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Constituency
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {voterProfile.constituency || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip 
                      icon={<CheckCircle fontSize="small" />} 
                      label="Active" 
                      size="small" 
                      color="success" 
                      sx={{ fontWeight: 'bold' }} 
                    />
                  </Box>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
                  Profile information not available
                </Typography>
              )}
              
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth 
                startIcon={<OpenInNew />}
                onClick={() => navigate('/voter/profile')}
                sx={{ mt: 2 }}
              >
                View Full Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Voting history table */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ p: 2, bgcolor: '#f5f7ff', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <EventNote sx={{ mr: 1.5, color: '#3f51b5' }} /> 
            Election Participation Details
          </Typography>
        </Box>
        
        {displayHistory.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No voting history found. Once you participate in elections, your voting record will appear here.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f7ff' }}>
                  <TableRow>
                    <TableCell>Election Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Candidate Voted</TableCell>
                    <TableCell>Party</TableCell>
                    <TableCell>Constituency</TableCell>
                    <TableCell align="center">Certificate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayHistory
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((vote) => (
                      <TableRow key={vote.voteID} hover>
                        <TableCell>{vote.electionName}</TableCell>
                        <TableCell>{getElectionTypeChip(vote.electionType)}</TableCell>
                        <TableCell>
                          {new Date(vote.voteDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>{vote.candidateVoted}</TableCell>
                        <TableCell>{vote.partyVoted}</TableCell>
                        <TableCell>{vote.constituency}</TableCell>
                        <TableCell align="center">
                          <IconButton color="primary" title="Download Vote Certificate">
                            <Receipt />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={displayHistory.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<Download />}
          sx={{ borderRadius: 2 }}
        >
          Download History Report
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Share />}
          sx={{ borderRadius: 2 }}
        >
          Share Certificate
        </Button>
      </Box>
    </Container>
  );
}

export default VoterHistory;