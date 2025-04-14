import React, { useEffect, useState, useContext } from 'react';
import { 
  Container, Typography, Grid, Button, Paper, Box, TextField,
  Card, CardContent, CardMedia, CardActions, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  Tooltip, Avatar, Chip, InputAdornment, OutlinedInput, FormHelperText,
  Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, Tab, Tabs
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';

import { 
  Add, Edit, Delete, Flag, Search, PhotoCamera, CheckCircle,
  Groups, SvgIcon, FilterList, Refresh, MoreVert, Visibility,
  CloudUpload, AddCircle, Cancel, VisibilityOff
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { getParties, addParty, updateParty, deleteParty } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function PartyManagement() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    id: null,
    title: '',
    action: null
  });
  
  const [partyData, setPartyData] = useState({
    partyName: '',
    shortName: '',
    description: '',
    foundedYear: '',
    ideology: '',
    partyLogo: null,
    logoPreview: '',
    leaderName: '',
    headquartersAddress: '',
    websiteUrl: '',
    status: 'Active'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentPartyId, setCurrentPartyId] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const data = await getParties();
      setParties(data || []);
    } catch (error) {
      console.error('Failed to fetch parties:', error);
      toast.error('Failed to load political parties', { position: 'top-center' });
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
            You must be an Election Commission Official to manage political parties.
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPartyData({ ...partyData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({...errors, [name]: null});
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file', { position: 'top-center' });
      return;
    }
    
    setUploadProgress(0);
    
    // Simulate file upload with progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(uploadInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    // Read file as data URL to display preview
    const reader = new FileReader();
    reader.onload = () => {
      setPartyData({
        ...partyData,
        partyLogo: file,
        logoPreview: reader.result
      });
      
      clearInterval(uploadInterval);
      setUploadProgress(100);
      
      setTimeout(() => setUploadProgress(0), 1000);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setPartyData({
      partyName: '',
      shortName: '',
      description: '',
      foundedYear: '',
      ideology: '',
      partyLogo: null,
      logoPreview: '',
      leaderName: '',
      headquartersAddress: '',
      websiteUrl: '',
      status: 'Active'
    });
    setIsEditing(false);
    setCurrentPartyId(null);
    setErrors({});
  };

  const handleOpenDialog = (party = null) => {
    if (party) {
      setPartyData({
        partyName: party.partyName,
        shortName: party.shortName || '',
        description: party.description || '',
        foundedYear: party.foundedYear || '',
        ideology: party.ideology || '',
        partyLogo: null,
        logoPreview: party.partyLogo || '',
        leaderName: party.leaderName || '',
        headquartersAddress: party.headquartersAddress || '',
        websiteUrl: party.websiteUrl || '',
        status: party.status || 'Active'
      });
      setIsEditing(true);
      setCurrentPartyId(party.partyID);
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const validatePartyData = () => {
    const newErrors = {};
    
    if (!partyData.partyName.trim()) {
      newErrors.partyName = 'Party name is required';
    }
    
    if (!partyData.shortName.trim()) {
      newErrors.shortName = 'Short name or abbreviation is required';
    }
    
    if (!partyData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (partyData.foundedYear && 
        (isNaN(partyData.foundedYear) || 
         parseInt(partyData.foundedYear) < 1800 || 
         parseInt(partyData.foundedYear) > new Date().getFullYear())
    ) {
      newErrors.foundedYear = 'Please enter a valid year';
    }
    
    if (!isEditing && !partyData.partyLogo && !partyData.logoPreview) {
      newErrors.partyLogo = 'Party logo is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveParty = async () => {
    if (!validatePartyData()) return;

    try {
      setLoading(true);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('partyName', partyData.partyName);
      formData.append('shortName', partyData.shortName);
      formData.append('description', partyData.description);
      formData.append('foundedYear', partyData.foundedYear);
      formData.append('ideology', partyData.ideology);
      formData.append('leaderName', partyData.leaderName);
      formData.append('headquartersAddress', partyData.headquartersAddress);
      formData.append('websiteUrl', partyData.websiteUrl);
      formData.append('status', partyData.status);
      
      if (partyData.partyLogo) {
        formData.append('partyLogo', partyData.partyLogo);
      }
      
      let response;
      if (isEditing) {
        response = await updateParty(currentPartyId, formData);
        toast.success('Party updated successfully', { position: 'top-center' });
      } else {
        response = await addParty(formData);  // Changed from createParty to addParty
        toast.success('Party created successfully', { position: 'top-center' });
      }
      
      await fetchParties();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save party:', error);
      toast.error(error.message || 'Failed to save party', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = (id, partyName) => {
    setConfirmDialog({
      open: true,
      id: id,
      title: `Are you sure you want to delete "${partyName}"?`,
      action: handleDeleteParty
    });
  };

  const handleDeleteParty = async () => {
    try {
      setLoading(true);
      await deleteParty(confirmDialog.id);
      toast.success('Party deleted successfully', { position: 'top-center' });
      await fetchParties();
    } catch (error) {
      console.error('Failed to delete party:', error);
      toast.error('Failed to delete party', { position: 'top-center' });
    } finally {
      setLoading(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredParties = parties.filter(party => 
    party.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (party.shortName && party.shortName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Political Party Management
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add New Party
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="All Parties" />
            <Tab label="Active" />
            <Tab label="Inactive" />
            <Tab label="Pending" />
          </Tabs>
        </Box>
        
        <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Search parties..."
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2, maxWidth: '500px' }}
          />
          <Button 
            startIcon={<Refresh />} 
            onClick={fetchParties}
            variant="outlined"
          >
            Refresh
          </Button>
          <Button
            startIcon={<FilterList />}
            variant="outlined"
            sx={{ ml: 2 }}
          >
            Filters
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredParties.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6" color="textSecondary">
              No political parties found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {searchQuery ? 'Try adjusting your search query' : 'Click "Add New Party" to create one'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredParties
              .filter(party => {
                if (tabValue === 0) return true;
                if (tabValue === 1) return party.status === 'Active';
                if (tabValue === 2) return party.status === 'Inactive';
                if (tabValue === 3) return party.status === 'Pending';
                return true;
              })
              .map((party) => (
                <Grid item xs={12} sm={6} md={4} key={party.partyID}>
                  <Card elevation={3}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={party.partyLogo || '/placeholder-party-logo.png'}
                        alt={party.partyName}
                        sx={{ objectFit: 'contain', bgcolor: '#f5f5f5', p: 2 }}
                      />
                      <Chip
                        label={party.status}
                        color={getStatusColor(party.status)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                        }}
                      />
                    </Box>
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        {party.partyName}
                      </Typography>
                      {party.shortName && (
                        <Typography variant="subtitle2" color="text.secondary">
                          {party.shortName}
                        </Typography>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {party.description?.length > 100 
                          ? `${party.description.substring(0, 100)}...` 
                          : party.description}
                      </Typography>
                      {party.leaderName && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Leader:</strong> {party.leaderName}
                        </Typography>
                      )}
                      {party.foundedYear && (
                        <Typography variant="body2">
                          <strong>Founded:</strong> {party.foundedYear}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions disableSpacing sx={{ justifyContent: 'space-between' }}>
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleOpenDialog(party)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleConfirmDelete(party.partyID, party.partyName)} color="error">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box>
                        <Tooltip title="View Details">
                          <IconButton>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </Paper>

      {/* Add/Edit Party Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>
          {isEditing ? 'Edit Political Party' : 'Register New Political Party'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Party Name"
                name="partyName"
                value={partyData.partyName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.partyName}
                helperText={errors.partyName}
                margin="normal"
              />
              <TextField
                label="Short Name/Abbreviation"
                name="shortName"
                value={partyData.shortName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.shortName}
                helperText={errors.shortName}
                margin="normal"
              />
              <TextField
                label="Founded Year"
                name="foundedYear"
                value={partyData.foundedYear}
                onChange={handleChange}
                fullWidth
                type="number"
                error={!!errors.foundedYear}
                helperText={errors.foundedYear}
                margin="normal"
              />
              <TextField
                label="Political Ideology"
                name="ideology"
                value={partyData.ideology}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Leader Name"
                name="leaderName"
                value={partyData.leaderName}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Headquarters Address"
                name="headquartersAddress"
                value={partyData.headquartersAddress}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Website URL"
                name="websiteUrl"
                value={partyData.websiteUrl}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={partyData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Party Description
              </Typography>
              <TextField
                name="description"
                value={partyData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Party Logo
              </Typography>
              <Box 
                sx={{ 
                  border: '1px dashed #ccc', 
                  p: 3, 
                  borderRadius: 2,
                  textAlign: 'center',
                  position: 'relative',
                  backgroundColor: '#fafafa'
                }}
              >
                {partyData.logoPreview ? (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <img 
                      src={partyData.logoPreview} 
                      alt="Party Logo Preview" 
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                    />
                    <IconButton 
                      sx={{ position: 'absolute', top: 0, right: 0 }}
                      onClick={() => setPartyData({...partyData, partyLogo: null, logoPreview: ''})}
                    >
                      <Cancel color="error" />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <CloudUpload sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
                    <Typography variant="body1" gutterBottom>
                      Drag and drop or click to upload
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Recommended size: 400x400px, Max 2MB
                    </Typography>
                  </>
                )}
                
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<PhotoCamera />}
                  sx={{ mt: 2 }}
                >
                  Upload Logo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </Button>
                
                {uploadProgress > 0 && (
                  <Box sx={{ mt: 2, width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {`${Math.round(uploadProgress)}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {errors.partyLogo && (
                  <FormHelperText error>{errors.partyLogo}</FormHelperText>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveParty}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {isEditing ? 'Update Party' : 'Register Party'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({...confirmDialog, open: false})}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>
            This action cannot be undone. All data related to this party will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({...confirmDialog, open: false})}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDialog.action} 
            color="error" 
            variant="contained"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PartyManagement;