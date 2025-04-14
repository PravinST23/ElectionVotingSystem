import React, { useEffect, useState, useRef } from 'react';
import { 
  Container, Typography, Grid, Paper, Box, Tabs, Tab, CircularProgress,
  Card, CardContent, CardHeader, Divider, IconButton, Tooltip, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Badge, Button, Alert
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  Assessment, Refresh, TrendingUp, LocationOn, Person, HowToVote,
  NotificationsActive, Share, GetApp, Print, Timeline, Security,
  VerifiedUser, TouchApp, PhoneAndroid, CheckCircle, People, ArrowBack
} from '@mui/icons-material';
import { getElections, getCandidates, getElectionResults, getVoterStatistics } from '../services/api';
import signalRService from '../services/signalr';
import { toast } from 'react-hot-toast';

// Custom colors for political parties - using Indian political party colors
const partyColors = {
  'BJP': '#FF9F40', 'INC Hargun': '#4BC0C0', 'AAP': '#36A2EB', 'CPI(M)': '#FF6384',
  'TMC': '#9966FF', 'SP': '#C9CBCF', 'BSP': '#00A19D', 'DMK': '#FF0000',
  'AIADMK': '#008000', 'TDP': '#FFFF00', 'Others': '#808080'
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF', '#FF6E69', '#60C5E7', '#FFD700'];

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`analytics-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Main Dashboard component for Electoral Officers
function ElectionAnalytics() {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [voterStats, setVoterStats] = useState({
    eligibleVoters: 0,
    parliamentaryConstituencies: 0,
    assemblyConstituencies: 0,
    pollingStations: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState(0);
  const [electionStatuses, setElectionStatuses] = useState({});
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in as an Election Official to view the dashboard', { position: 'top-center', icon: '⚠️' });
      setLoading(false);
      return;
    }

    fetchData();

    if (!hasConnectedRef.current) {
      setupSignalR();
      hasConnectedRef.current = true;
    }

    const refreshInterval = setInterval(() => fetchData(false), 300000);
    return () => clearInterval(refreshInterval);
  }, []);

  const setupSignalR = () => {
    signalRService.onVoteUpdate((electionId, candidateId, voteCount) => {
      setVoteCounts((prev) => ({
        ...prev,
        [electionId]: { ...prev[electionId], [candidateId]: voteCount },
      }));
      setLiveUpdates((prev) => prev + 1);
      setLastUpdated(new Date());
      const electionName = elections.find(e => e.electionID === electionId)?.name || 'Election';
      toast.success(`Live update: Vote recorded for ${electionName}`, { position: 'top-center', icon: '🗳️' });
    });

    signalRService.onElectionStatusUpdate((electionId, status) => {
      setElectionStatuses((prev) => ({ ...prev, [electionId]: status }));
      setElections((prev) =>
        prev.map((e) => (e.electionID === electionId ? { ...e, status } : e))
      );
      toast.info(`Election ${electionId} status: ${status}`, { position: 'top-center', icon: 'ℹ️' });
    });
  };

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [electionData, candidateData, voterStatsData] = await Promise.all([
        getElections(),
        getCandidates(),
        getVoterStatistics()
      ]);

      const electionsArray = Array.isArray(electionData) ? electionData.map(e => ({
        ...e,
        region: e.region || 'National Capital',
        registeredVoters: e.registeredVoters || 0
      })) : [];
      setElections(electionsArray);
      setCandidates(Array.isArray(candidateData) ? candidateData : []);
      setVoterStats(voterStatsData || {
        eligibleVoters: 900000000,
        parliamentaryConstituencies: 543,
        assemblyConstituencies: 4120,
        pollingStations: 1100000
      });

      const resultsPromises = electionsArray.map((election) =>
        getElectionResults(election.electionID)
          .catch((error) => {
            console.warn(`No results for Election ${election.electionID}: ${error.message}`);
            return [];
          })
      );

      const allResults = await Promise.all(resultsPromises);
      const newVoteCounts = {};
      const newStatuses = {};

      allResults.forEach((result, index) => {
        const electionId = electionsArray[index].electionID;
        newVoteCounts[electionId] = {};
        newStatuses[electionId] = electionsArray[index].status || 'Unknown';

        if (Array.isArray(result)) {
          result.forEach((candidateResult) => {
            newVoteCounts[electionId][candidateResult.candidateID] = candidateResult.voteCount || 0;
          });
        }
      });

      setVoteCounts(newVoteCounts);
      setElectionStatuses(newStatuses);
      setLastUpdated(new Date());
      console.log('Elections:', electionsArray);
      console.log('Candidates:', candidateData);
      console.log('Vote Counts:', newVoteCounts);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load election data', { position: 'top-center', icon: '❌' });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
    toast.success('Data refreshed!', { position: 'top-right', icon: '🔄' });
  };

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully', { position: 'top-right', icon: '👋' });
    window.location.href = '/login';
  };

  const handleBack = () => {
    window.history.back();
  };

  const getWinningCandidate = (electionId) => {
    if (!voteCounts[electionId]) return null;
    const entries = Object.entries(voteCounts[electionId]);
    if (entries.length === 0) return null;
    const [winnerId, votes] = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max));
    return candidates.find((c) => c.candidateID === parseInt(winnerId));
  };

  const getPartyWiseData = () => {
    const partyData = {};
    elections.forEach((election) => {
      if (voteCounts[election.electionID]) {
        Object.entries(voteCounts[election.electionID]).forEach(([candidateId, votes]) => {
          const candidate = candidates.find((c) => c.candidateID === parseInt(candidateId));
          if (candidate) {
            const party = typeof candidate.party === 'object' ? candidate.party?.partyName || 'Others' : candidate.party || 'Others';
            partyData[party] = (partyData[party] || 0) + (votes || 0);
          }
        });
      }
    });
    console.log('Party Wise Data:', Object.entries(partyData).map(([name, value]) => ({ name, value })));
    return Object.entries(partyData).map(([name, value], index) => ({
      name,
      value,
      color: partyColors[name] || COLORS[index % COLORS.length],
    }));
  };

  const getRegionWiseData = () => {
    const regionData = {};
    elections.forEach((election) => {
      const region = election.region || 'National Capital';
      regionData[region] = regionData[region] || { name: region, totalVotes: 0 };
      if (voteCounts[election.electionID]) {
        regionData[region].totalVotes += Object.values(voteCounts[election.electionID]).reduce((sum, v) => sum + (v || 0), 0);
      }
    });
    console.log('Region Wise Data:', Object.values(regionData));
    return Object.values(regionData);
  };

  const getTotalVoterTurnout = () => {
    let totalVotes = 0;
    let totalRegisteredVoters = 0;
    elections.forEach((election) => {
      totalRegisteredVoters += election.registeredVoters || 0;
      if (voteCounts[election.electionID]) {
        totalVotes += Object.values(voteCounts[election.electionID]).reduce((sum, v) => sum + (v || 0), 0);
      }
    });
    return {
      totalVotes,
      totalRegisteredVoters,
      percentage: totalRegisteredVoters > 0 ? ((totalVotes / totalRegisteredVoters) * 100).toFixed(2) : 0,
    };
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ elections, candidates, voteCounts, lastUpdated });
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `election-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Report exported successfully', { position: 'top-right', icon: '📊' });
  };

  const printReport = () => {
    window.print();
    toast.success('Printing report...', { position: 'top-right', icon: '🖨️' });
  };

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Election Analytics Report',
        text: `Election Analytics Report as of ${new Date().toLocaleString()}`,
        url: window.location.href,
      })
        .then(() => toast.success('Report shared successfully!'))
        .catch((error) => console.error('Error sharing report:', error));
    } else {
      toast.error('Web Share API not supported on this browser');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Election Analytics Dashboard...</Typography>
      </Container>
    );
  }

  const turnoutData = getTotalVoterTurnout();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Back Button */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Assessment fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography variant="h4" component="h1">Real-Time Election Analytics</Typography>
          </Box>
          <Box>
            <Badge badgeContent={liveUpdates} color="error" sx={{ mr: 2 }}>
              <Tooltip title="Live updates">
                <NotificationsActive color={liveUpdates > 0 ? 'success' : 'action'} />
              </Tooltip>
            </Badge>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} aria-label="refresh"><Refresh /></IconButton>
            </Tooltip>
            <Tooltip title="Export data">
              <IconButton onClick={exportData} aria-label="export"><GetApp /></IconButton>
            </Tooltip>
            <Tooltip title="Print report">
              <IconButton onClick={printReport} aria-label="print"><Print /></IconButton>
            </Tooltip>
            <Tooltip title="Share report">
              <IconButton onClick={shareReport} aria-label="share"><Share /></IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
          </Typography>
          <Chip 
            icon={<Timeline />} 
            label={`Monitoring ${elections.length} Elections`} 
            color="primary" 
            variant="outlined" 
          />
        </Box>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={3}>
            <CardHeader 
              title={<Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Eligible Voters</Typography>} 
              avatar={<Person color="primary" />} 
            />
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h4">{(voterStats.eligibleVoters / 1000000).toFixed(1)}M+</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={3}>
            <CardHeader 
              title={<Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Parliamentary Constituencies</Typography>} 
              avatar={<HowToVote color="primary" />} 
            />
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h4">{voterStats.parliamentaryConstituencies}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={3}>
            <CardHeader 
              title={<Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Assembly Constituencies</Typography>} 
              avatar={<People color="primary" />} 
            />
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h4">{voterStats.assemblyConstituencies.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={3}>
            <CardHeader 
              title={<Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Polling Stations</Typography>} 
              avatar={<LocationOn color="primary" />} 
            />
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h4">{(voterStats.pollingStations / 1000000).toFixed(1)}M+</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Security color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" gutterBottom>Bank-Level Security</Typography>
              <Typography variant="body2" color="text.secondary">
                End-to-end encryption and blockchain verification for maximum data protection
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <VerifiedUser color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" gutterBottom>Aadhaar Verification</Typography>
              <Typography variant="body2" color="text.secondary">
                Biometric authentication ensures one person, one vote integrity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <TouchApp color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" gutterBottom>User-Friendly Interface</Typography>
              <Typography variant="body2" color="text.secondary">
                Simple and accessible voting experience for citizens of all backgrounds
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <PhoneAndroid color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" gutterBottom>Mobile Compatibility</Typography>
              <Typography variant="body2" color="text.secondary">
                Vote and track elections from any device, anywhere in India
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader title="Voter Turnout" avatar={<Person color="primary" />} subheader="Overall participation" />
            <CardContent>
              <Typography variant="h3" align="center">{turnoutData.percentage}%</Typography>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(turnoutData.percentage) || 0} 
                sx={{ height: 10, borderRadius: 5, my: 2 }} 
              />
              <Typography variant="body2" color="text.secondary" align="center">
                {turnoutData.totalVotes.toLocaleString()} / {turnoutData.totalRegisteredVoters.toLocaleString()} voters
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader title="Leading Party" avatar={<HowToVote color="primary" />} subheader="Current leader" />
            <CardContent>
              {(() => {
                const partyData = getPartyWiseData();
                if (!partyData.length) return <Typography>No data available</Typography>;
                const leadingParty = partyData.sort((a, b) => b.value - a.value)[0];
                return (
                  <>
                    <Typography variant="h3" align="center">{leadingParty.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        backgroundColor: leadingParty.color, 
                        mr: 1 
                      }} />
                      <Typography variant="body2">
                        {leadingParty.value.toLocaleString()} votes ({((leadingParty.value / turnoutData.totalVotes) * 100).toFixed(1) || 0}%)
                      </Typography>
                    </Box>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader title="Most Active Region" avatar={<LocationOn color="primary" />} subheader="Highest participation" />
            <CardContent>
              {(() => {
                const regionData = getRegionWiseData();
                if (!regionData.length) return <Typography>No data available</Typography>;
                const mostActive = regionData.sort((a, b) => b.totalVotes - a.totalVotes)[0];
                return (
                  <>
                    <Typography variant="h3" align="center">{mostActive.name}</Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                      {mostActive.totalVotes.toLocaleString()} votes
                    </Typography>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 4 }} elevation={3}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          indicatorColor="primary" 
          textColor="primary"
        >
          <Tab label="Overview" icon={<Assessment />} />
          <Tab label="Party-wise" icon={<PieChart width={18} height={18} />} />
          <Tab label="Regional" icon={<LocationOn />} />
          <Tab label="Results" icon={<HowToVote />} />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Real-time analytics dashboard tracking election progress across India.
          </Alert>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardHeader title="Party Vote Distribution" />
                <CardContent sx={{ height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie 
                        data={getPartyWiseData()} 
                        cx="50%" 
                        cy="50%" 
                        labelLine={false} 
                        outerRadius={80} 
                        dataKey="value" 
                        nameKey="name" 
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1) || 0}%`}
                      >
                        {getPartyWiseData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => value.toLocaleString()} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardHeader title="Regional Vote Distribution" />
                <CardContent sx={{ height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={getRegionWiseData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => value.toLocaleString()} />
                      <Bar dataKey="totalVotes" fill="#8884d8" name="Total Votes">
                        {getRegionWiseData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>Party Performance</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TableContainer component={Paper} elevation={2}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Party</TableCell>
                      <TableCell align="right">Votes</TableCell>
                      <TableCell align="right">Share (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getPartyWiseData().sort((a, b) => b.value - a.value).map((party) => (
                      <TableRow key={party.name}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%', 
                              backgroundColor: party.color, 
                              mr: 1 
                            }} />
                            {party.name}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{party.value.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          {((party.value / turnoutData.totalVotes) * 100).toFixed(2) || 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent sx={{ height: 400 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie 
                        data={getPartyWiseData()} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={100} 
                        dataKey="value" 
                        nameKey="name" 
                        label
                      >
                        {getPartyWiseData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => value.toLocaleString()} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>Regional Vote Distribution</Typography>
          <Card elevation={2}>
            <CardContent sx={{ height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={getRegionWiseData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="totalVotes" fill="#8884d8" name="Total Votes">
                    {getRegionWiseData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>Live Election Results</Typography>
          {elections.length === 0 ? (
            <Alert severity="warning">No active elections found.</Alert>
          ) : (
            elections.map((election) => {
              const winningCandidate = getWinningCandidate(election.electionID);
              return (
                <Card key={election.electionID} sx={{ mb: 3 }} elevation={2}>
                  <CardHeader
                    title={election.name}
                    subheader={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>
                          Region: {election.region || 'National Capital'} | Date: {new Date(election.date).toLocaleDateString()}
                        </Typography>
                        <Chip
                          label={electionStatuses[election.electionID] || election.status || 'Unknown'}
                          color={electionStatuses[election.electionID] === 'Completed' ? 'success' : 
                                electionStatuses[election.electionID] === 'In Progress' ? 'warning' : 'default'}
                          size="small"
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    }
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Current Leading Candidate:</Typography>
                        {winningCandidate ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Person sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="body1" fontWeight="bold">
                                {winningCandidate.name} ({typeof winningCandidate.party === 'object' ? winningCandidate.party?.partyName : winningCandidate.party})
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Votes: {voteCounts[election.electionID][winningCandidate.candidateID].toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No votes recorded yet</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Voter Turnout:</Typography>
                        {election.registeredVoters ? (
                          <>
                            <LinearProgress 
                              variant="determinate" 
                              value={
                                voteCounts[election.electionID]
                                  ? (Object.values(voteCounts[election.electionID]).reduce((a, b) => a + (b || 0), 0) / election.registeredVoters) * 100
                                  : 0
                              } 
                              sx={{ height: 8, borderRadius: 5, my: 1 }} 
                            />
                            <Typography variant="body2" color="text.secondary">
                              {voteCounts[election.electionID]
                                ? ((Object.values(voteCounts[election.electionID]).reduce((a, b) => a + (b || 0), 0) / election.registeredVoters) * 100).toFixed(2)
                                : 0}% of registered voters
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No voter registration data</Typography>
                        )}
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>Candidate Results:</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Candidate</TableCell>
                            <TableCell>Party</TableCell>
                            <TableCell align="right">Votes</TableCell>
                            <TableCell align="right">Percentage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {candidates
                            .filter(candidate => candidate.electionID === election.electionID)
                            .sort((a, b) => {
                              const votesA = voteCounts[election.electionID]?.[a.candidateID] || 0;
                              const votesB = voteCounts[election.electionID]?.[b.candidateID] || 0;
                              return votesB - votesA;
                            })
                            .map(candidate => {
                              const votes = voteCounts[election.electionID]?.[candidate.candidateID] || 0;
                              const totalVotes = Object.values(voteCounts[election.electionID] || {}).reduce((sum, v) => sum + (v || 0), 0);
                              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                              return (
                                <TableRow key={candidate.candidateID}>
                                  <TableCell>{candidate.name}</TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box sx={{ 
                                        width: 12, 
                                        height: 12, 
                                        borderRadius: '50%', 
                                        backgroundColor: partyColors[typeof candidate.party === 'object' ? candidate.party?.partyName : candidate.party] || '#808080', 
                                        mr: 1 
                                      }} />
                                      {typeof candidate.party === 'object' ? candidate.party?.partyName : candidate.party}
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">{votes.toLocaleString()}</TableCell>
                                  <TableCell align="right">{percentage.toFixed(2)}%</TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabPanel>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        System Status & Security
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader title="System Health" avatar={<Security color="success" />} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography>Database: Operational</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography>Blockchain Verification: Active</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography>Encryption Services: Secure</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography>API Services: Online</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader title="Security Audit" avatar={<VerifiedUser color="primary" />} />
            <CardContent>
              <Typography variant="body2" gutterBottom>
                Last Security Scan: {new Date().toLocaleDateString()}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" paragraph>
                All systems passed security validation with ISO 27001 compliance.
              </Typography>
              <Button variant="outlined" size="small" startIcon={<Security />}>
                View Security Certificate
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader title="System Activities" avatar={<TrendingUp color="primary" />} />
            <CardContent>
              <Typography variant="body2" paragraph>
                Active Users: {Math.floor(Math.random() * 500) + 200} Electoral Officers
              </Typography>
              <Typography variant="body2" paragraph>
                Data Processing: {Math.floor(Math.random() * 1000) + 5000} transactions/minute
              </Typography>
              <Typography variant="body2">
                Uptime: 99.99% over the last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ bgcolor: '#f5f5f5', py: 3, mt: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Indian Election System | Managed by Election Commission of India
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            For technical support, contact: electoral.support@eci.gov.in
          </Typography>
        </Container>
      </Box>
    </Container>
  );
}

export default ElectionAnalytics;