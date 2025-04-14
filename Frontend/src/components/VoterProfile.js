import React, { useEffect, useState, useContext } from 'react';
import { 
  Container, Typography, TextField, Button, CircularProgress, Paper, Box, 
  Avatar, Grid, Divider, Card, CardContent, Chip, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, InputAdornment
} from '@mui/material';
import { 
  AccountCircle, EditOutlined, Save, ArrowBack, Visibility, VisibilityOff,
  Badge, Email, Phone, LocationOn, CalendarToday, Check, SecurityOutlined,
  Fingerprint
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { getVoterProfile, updateVoter, updateVoterPassword } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function VoterProfile() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [voter, setVoter] = useState(null);
  const [originalVoter, setOriginalVoter] = useState(null); // Store the original profile data
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchVoterProfile = async () => {
      if (!token || !user) {
        console.log('No token or user found:', { token, user });
        toast.error('Please log in to view your profile', { position: 'top-center' });
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const profile = await getVoterProfile();
        console.log('Profile fetched:', JSON.stringify(profile, null, 2));
        if (!profile || Object.keys(profile).length === 0) {
          throw new Error('No profile data returned from API');
        }
        setVoter(profile);
        setOriginalVoter(profile); // Store the original data
      } catch (error) {
        console.error('Error fetching voter profile:', error);
        toast.error(error.response?.data?.message || error.message || 'Failed to load profile', { position: 'top-center' });
        setVoter(null);
        setOriginalVoter(null);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'Voter') {
      fetchVoterProfile();
    } else {
      console.log('User role is not Voter:', user?.role);
      setLoading(false);
    }
  }, [token, user, navigate]);

  const handleChange = (e) => {
    setVoter({ ...voter, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const toggleEditMode = () => {
    if (editMode) {
      setVoter(originalVoter); // Revert to original data if canceling edits
    }
    setEditMode(!editMode);
  };

  const handleOpenPasswordDialog = () => {
    setPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialog(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleUpdate = async () => {
    if (!voter?.voterID) {
      toast.error('No voter ID available for update', { position: 'top-center' });
      return;
    }

    // Ensure DateOfBirth is in 'YYYY-MM-DD' format for backend compatibility
    const formattedDateOfBirth = voter.dateOfBirth 
      ? new Date(voter.dateOfBirth).toISOString().split('T')[0] 
      : originalVoter.dateOfBirth;

    // Merge all fields from originalVoter with edited ones, ensuring no required fields are missing
    const payload = {
      ...originalVoter, // Include all original fields
      voterID: voter.voterID,
      firstName: voter.firstName || originalVoter.firstName,
      lastName: voter.lastName || originalVoter.lastName,
      email: voter.email || originalVoter.email,
      mobileNumber: voter.mobileNumber || originalVoter.mobileNumber || '',
      address: voter.address || originalVoter.address || '',
      street: voter.street || originalVoter.street || '',
      city: voter.city || originalVoter.city || '',
      state: voter.state || originalVoter.state || '',
      pinCode: voter.pinCode || originalVoter.pinCode || '',
      dateOfBirth: formattedDateOfBirth,
      // Include additional fields that might be required by backend but not editable in UI
      gender: originalVoter.gender || 'Unknown', // Fallback if missing
      nationalID: originalVoter.nationalID || '', // Required field
      district: originalVoter.district || '', // Potentially required
      constituency: originalVoter.constituency || '',
      votingDistrict: originalVoter.votingDistrict || '',
      voterStatus: originalVoter.voterStatus || 'Active',
      validFrom: originalVoter.validFrom || new Date().toISOString(),
      validUntil: originalVoter.validUntil || '9999-12-31T23:59:59.999Z',
      age: originalVoter.age || calculateAge(formattedDateOfBirth),
      middleName: originalVoter.middleName || '',
      parentName: originalVoter.parentName || '',
      maritalStatus: originalVoter.maritalStatus || '',
      voterIDNumber: originalVoter.voterIDNumber || '',
      isFirstTimeVoter: originalVoter.isFirstTimeVoter || false
    };

    setUpdateLoading(true);
    try {
      console.log('Payload being sent to update voter:', JSON.stringify(payload, null, 2));
      const updatedVoter = await updateVoter(voter.voterID, payload);
      console.log('Profile updated:', JSON.stringify(updatedVoter, null, 2));
      setVoter(updatedVoter);
      setOriginalVoter(updatedVoter); // Update original data with the new response
      toast.success('Profile updated successfully', { position: 'top-center' });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating voter profile:', error);
      console.log('Full error response:', JSON.stringify(error.response?.data, null, 2));
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.title || 
        'Failed to update profile', 
        { position: 'top-center' }
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error('Current password is required', { position: 'top-center' });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match', { position: 'top-center' });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long', { position: 'top-center' });
      return;
    }

    setUpdateLoading(true);
    try {
      await updateVoterPassword(voter.voterID, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully', { position: 'top-center' });
      handleClosePasswordDialog();
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password', { position: 'top-center' });
    } finally {
      setUpdateLoading(false);
    }
  };

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
          Loading profile...
        </Typography>
      </Container>
    );
  }

  if (!voter) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" color="error">
            Unable to load profile. Please try again later.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/voter/dashboard')} sx={{ mt: 3 }}>
            Return to Dashboard
          </Button>
        </Paper>
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
        <Typography variant="h4" component="h1">
          Voter Profile
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left column - Personal Info */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              position: 'relative',
              mb: 4
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Typography variant="h5" component="h2" sx={{ 
                color: '#3f51b5',
                display: 'flex',
                alignItems: 'center'
              }}>
                <AccountCircle sx={{ mr: 1 }} /> Personal Information
              </Typography>
              <Button 
                startIcon={editMode ? <Save /> : <EditOutlined />}
                variant={editMode ? "contained" : "outlined"}
                color={editMode ? "primary" : "secondary"}
                onClick={editMode ? handleUpdate : toggleEditMode}
                disabled={updateLoading}
                sx={{ borderRadius: 2 }}
              >
                {updateLoading ? 'Saving...' : (editMode ? 'Save Changes' : 'Edit Profile')}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  fullWidth
                  variant="outlined"
                  value={voter.firstName || ''}
                  onChange={handleChange}
                  disabled={!editMode || updateLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  fullWidth
                  variant="outlined"
                  value={voter.lastName || ''}
                  onChange={handleChange}
                  disabled={!editMode || updateLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  name="email"
                  fullWidth
                  variant="outlined"
                  value={voter.email || ''}
                  onChange={handleChange}
                  disabled={!editMode || updateLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile Number"
                  name="mobileNumber"
                  fullWidth
                  variant="outlined"
                  value={voter.mobileNumber || ''}
                  onChange={handleChange}
                  disabled={!editMode || updateLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                  value={voter.address || ''}
                  onChange={handleChange}
                  disabled={!editMode || updateLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  name="city"
                  fullWidth
                  variant="outlined"
                  value={voter.city || ''}
                  onChange={handleChange}
                  disabled={!editMode || updateLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="State"
                  name="state"
                  fullWidth
                  variant="outlined"
                  value={voter.state || ''}
                  onChange={handleChange}
                  disabled={!editMode || updateLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Postal Code"
                  name="pinCode"
                  fullWidth
                  variant="outlined"
                  value={voter.pinCode || ''}
                  onChange={handleChange}
                  disabled={!editMode || updateLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={voter.dateOfBirth ? new Date(voter.dateOfBirth).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  disabled={!editMode || updateLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {!editMode && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleOpenPasswordDialog}
                  startIcon={<SecurityOutlined />}
                  sx={{ borderRadius: 2 }}
                >
                  Change Password
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Right column - Voter ID and Status */}
        <Grid item xs={12} md={4}>
          <Card elevation={4} sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
            <Box sx={{ 
              bgcolor: '#3f51b5', 
              color: 'white',
              p: 3,
              position: 'relative'
            }}>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                Voter Identification
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Your official voter registration details
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3
              }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: '#3f51b5',
                    fontSize: '2rem',
                    mb: 2
                  }}
                >
                  {voter.firstName?.charAt(0) || 'V'}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {voter.firstName} {voter.lastName}
                </Typography>
                <Chip 
                  label="Verified Voter" 
                  color="success" 
                  size="small"
                  icon={<Check />} 
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Voter ID
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Fingerprint sx={{ mr: 1, color: '#3f51b5' }} />
                  {voter.voterID || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Date of Birth
                </Typography>
                <Typography variant="body1">
                  {voter.dateOfBirth ? new Date(voter.dateOfBirth).toLocaleDateString('en-IN') : 'Not available'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Constituency
                </Typography>
                <Typography variant="body1">
                  {voter.constituency || 'Not specified'}
                </Typography>
              </Box>
              
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-icon': { alignItems: 'center' }
                }}
              >
                <Typography variant="body2">
                  Keep your voter details up to date to ensure a smooth voting experience.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog 
        open={passwordDialog} 
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ bgcolor: '#f5f5f5' }}>
          Change Password
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" paragraph>
              Please enter your current password and choose a new password.
            </Typography>
            
            <TextField
              label="Current Password"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              variant="outlined"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="New Password"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              variant="outlined"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              variant="outlined"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Alert severity="warning" sx={{ mt: 2, borderRadius: 1 }}>
              Password must be at least 8 characters long and include a mix of letters, numbers, and special characters.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={handleClosePasswordDialog} disabled={updateLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePassword} 
            color="primary" 
            variant="contained"
            disabled={updateLoading}
            startIcon={updateLoading ? <CircularProgress size={20} /> : <SecurityOutlined />}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default VoterProfile;