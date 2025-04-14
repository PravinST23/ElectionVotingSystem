import React, { useState, useContext, useEffect } from 'react';
import { 
  TextField, Button, Container, Typography, Paper, Box, 
  Grid, Divider, FormHelperText, Avatar, Alert, IconButton,
  Card, CardContent, CardMedia, CircularProgress, Tooltip
} from '@mui/material';
import { 
  AddCircle, ArrowBack, Flag, Image, CheckCircle, 
  Info, Warning, CalendarMonth, Description
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { addParty, getParties } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function AddParty() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingParties, setExistingParties] = useState([]);
  const [partyData, setPartyData] = useState({
    partyName: '',
    partyLogo: '',
    description: '',
    validFrom: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().slice(0, 16) // Default 5 years validity
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch existing parties for reference
    const fetchParties = async () => {
      try {
        const parties = await getParties();
        setExistingParties(parties);
      } catch (error) {
        console.error("Failed to fetch parties", error);
      }
    };
    
    fetchParties();
  }, []);

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
          <Warning color="error" sx={{ fontSize: 60 }} />
          <Typography variant="h4" sx={{ mt: 2, color: '#d32f2f' }}>
            Access Restricted
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You must be an Election Commission Official to access this page.
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

  const validate = () => {
    const newErrors = {};
    if (!partyData.partyName.trim())
      newErrors.partyName = 'Party name is required';
    if (!partyData.description.trim())
      newErrors.description = 'Description is required';
    if (!partyData.partyLogo.trim())
      newErrors.partyLogo = 'Party logo URL is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPartyData({ ...partyData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({...errors, [name]: null});
    }
  };

  const submit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const payload = {
        partyName: partyData.partyName,
        partyLogo: partyData.partyLogo,
        description: partyData.description,
        validFrom: new Date(partyData.validFrom).toISOString(),
        validUntil: new Date(partyData.validUntil).toISOString()
      };
      
      const response = await addParty(payload);
      console.log('Party added:', response);
      
      toast.success(`Political party "${partyData.partyName}" registered successfully!`, {
        position: 'top-center',
        icon: '🎉',
        duration: 4000
      });
      
      // Reset form
      setPartyData({
        partyName: '',
        partyLogo: '',
        description: '',
        validFrom: new Date().toISOString().slice(0, 16),
        validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().slice(0, 16)
      });
    } catch (error) {
      console.error('Add party error:', error);
      toast.error(error.response?.data?.error || 'Failed to register political party', {
        position: 'top-center',
        icon: '❌'
      });
    } finally {
      setLoading(false);
    }
  };

  const previewLogoUrl = () => {
    if (!partyData.partyLogo.trim()) return null;
    return partyData.partyLogo;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 0, overflow: 'hidden' }}>
        {/* Header Section */}
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(to right, #11047A, #001f3f)',
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Flag sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Register Political Party
            </Typography>
            <Typography variant="subtitle1">
              Election Commission of India - Official Portal
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Enter details to register a new political party. All parties must comply with the Election Commission's regulations.
          </Alert>

          <Grid container spacing={3}>
            {/* Form Section */}
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AddCircle sx={{ mr: 1 }} color="primary" />
                  Party Information
                </Typography>
                
                <TextField
                  label="Party Name *"
                  name="partyName"
                  fullWidth
                  margin="normal"
                  value={partyData.partyName}
                  onChange={handleChange}
                  error={!!errors.partyName}
                  helperText={errors.partyName}
                  InputProps={{
                    startAdornment: <Flag sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} fontSize="small" />
                  }}
                />
                
                <TextField
                  label="Party Logo URL *"
                  name="partyLogo"
                  fullWidth
                  margin="normal"
                  value={partyData.partyLogo}
                  onChange={handleChange}
                  error={!!errors.partyLogo}
                  helperText={errors.partyLogo || "Enter a direct URL to the party logo image"}
                  InputProps={{
                    startAdornment: <Image sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} fontSize="small" />
                  }}
                />
                
                <TextField
                  label="Description *"
                  name="description"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  value={partyData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description || "Provide a brief description of the party's ideology and background"}
                  InputProps={{
                    startAdornment: <Description sx={{ mr: 1, mt: 1, color: 'rgba(0, 0, 0, 0.54)' }} fontSize="small" />
                  }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <CalendarMonth sx={{ mr: 1 }} color="primary" />
                  Validity Period
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Valid From *"
                      name="validFrom"
                      type="datetime-local"
                      fullWidth
                      margin="normal"
                      value={partyData.validFrom}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Valid Until *"
                      name="validUntil"
                      type="datetime-local"
                      fullWidth
                      margin="normal"
                      value={partyData.validUntil}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                    <FormHelperText>
                      Standard validity is 5 years from registration
                    </FormHelperText>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Preview Section */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                border: '1px solid #e0e0e0'
              }}>
                <CardContent sx={{ flexGrow: 0 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Party Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Preview how your party will appear in the system
                  </Typography>
                </CardContent>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 2,
                  flexGrow: 1
                }}>
                  {previewLogoUrl() ? (
                    <CardMedia
                      component="img"
                      image={previewLogoUrl()}
                      alt="Party Logo Preview"
                      sx={{ 
                        width: '150px',
                        height: '150px',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Box sx={{ 
                      width: '150px',
                      height: '150px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #ccc',
                      borderRadius: '8px'
                    }}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Logo Preview<br/>Will Appear Here
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    {partyData.partyName || "Party Name"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ 
                    maxHeight: '100px',
                    overflow: 'auto'
                  }}>
                    {partyData.description || "Party description will appear here"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>

            <Button 
              variant="contained" 
              color="primary" 
              onClick={submit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
              sx={{ 
                background: 'linear-gradient(to right, #FF9F40, #FF8042)',
                fontWeight: 'bold',
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(to right, #FF8042, #FF6242)'
                }
              }}
            >
              {loading ? 'Submitting...' : 'Register Party'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Display existing parties for reference */}
      {existingParties.length > 0 && (
        <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Existing Registered Parties
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {existingParties.slice(0, 3).map((party) => (
              <Grid item xs={12} sm={4} key={party.partyID}>
                <Card sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                  <Avatar 
                    src={party.partyLogo} 
                    alt={party.partyName}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  />
                  <Typography variant="body2" fontWeight="medium">
                    {party.partyName}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          {existingParties.length > 3 && (
            <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }} onClick={() => navigate('/party-management')}>
              View all {existingParties.length} parties →
            </Typography>
          )}
        </Paper>
      )}
    </Container>
  );
}

export default AddParty;