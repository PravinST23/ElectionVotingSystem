// import React, { useState, useEffect, useContext } from 'react';
// import { 
//   TextField, Button, Container, Typography, MenuItem, Paper, Box,
//   Grid, Divider, FormHelperText, Alert, Avatar, CircularProgress,
//   Stepper, Step, StepLabel, StepContent, Card, CardContent, 
//   IconButton, Tooltip, FormControl, InputLabel, Select, Chip
// } from '@mui/material';
// import { 
//   PersonAdd, ArrowForward, ArrowBack, AccountCircle, 
//   HowToVote, Flag, CheckCircle, SaveAlt, Cancel,
//   EventAvailable, Assignment, AttachFile, PhotoCamera
// } from '@mui/icons-material';
// import { AuthContext } from '../context/AuthContext';
// import { registerCandidate, getParties, getElections, uploadDocument } from '../services/api';
// import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';

// function CandidateRegistration() {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [parties, setParties] = useState([]);
//   const [elections, setElections] = useState([]);
//   const [uploadProgress, setUploadProgress] = useState(0);
  
//   const [candidateData, setCandidateData] = useState({
//     firstName: '',
//     lastName: '',
//     age: '',
//     gender: '',
//     partyID: '',
//     electionID: '',
//     constituency: '',
//     contactNumber: '',
//     email: '',
//     address: '',
//     experience: '',
//     education: '',
//     photoUrl: '',
//     documents: []
//   });
  
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     // Fetch parties and elections for dropdowns
//     const fetchData = async () => {
//       try {
//         const [partiesData, electionsData] = await Promise.all([
//           getParties(),
//           getElections()
//         ]);
//         setParties(partiesData || []);
//         setElections(electionsData || []);
//       } catch (error) {
//         console.error("Failed to fetch reference data", error);
//         toast.error("Failed to load required data", { position: 'top-center' });
//       }
//     };
    
//     fetchData();
//   }, []);

//   // Restrict access to Officials only
//   if (user?.role !== 'Official') {
//     return (
//       <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
//         <Paper 
//           elevation={3} 
//           sx={{ 
//             p: 4, 
//             background: 'linear-gradient(to right, #f5f5f5, #e0e0e0)',
//             border: '1px solid #d0d0d0'
//           }}
//         >
//           <Cancel color="error" sx={{ fontSize: 60 }} />
//           <Typography variant="h4" sx={{ mt: 2, color: '#d32f2f' }}>
//             Access Restricted
//           </Typography>
//           <Typography variant="body1" sx={{ mt: 2 }}>
//             You must be an Election Commission Official to register candidates.
//           </Typography>
//           <Button 
//             variant="contained" 
//             onClick={() => navigate('/login')} 
//             sx={{ mt: 3 }}
//           >
//             Return to Login
//           </Button>
//         </Paper>
//       </Container>
//     );
//   }

//   const validateStep = (step) => {
//     const newErrors = {};
    
//     if (step === 0) {
//       if (!candidateData.firstName.trim()) newErrors.firstName = 'First name is required';
//       if (!candidateData.lastName.trim()) newErrors.lastName = 'Last name is required';
//       if (!candidateData.age) newErrors.age = 'Age is required';
//       else if (candidateData.age < 25) newErrors.age = 'Candidate must be at least 25 years old';
//       if (!candidateData.gender) newErrors.gender = 'Gender is required';
//     } else if (step === 1) {
//       if (!candidateData.partyID) newErrors.partyID = 'Party selection is required';
//       if (!candidateData.electionID) newErrors.electionID = 'Election selection is required';
//       if (!candidateData.constituency.trim()) newErrors.constituency = 'Constituency is required';
//     } else if (step === 2) {
//       if (!candidateData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
//       if (!candidateData.email.trim()) newErrors.email = 'Email is required';
//       else if (!/\S+@\S+\.\S+/.test(candidateData.email)) newErrors.email = 'Email is invalid';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCandidateData({ ...candidateData, [name]: value });
    
//     // Clear error when field is edited
//     if (errors[name]) {
//       setErrors({...errors, [name]: null});
//     }
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setActiveStep((prevActiveStep) => prevActiveStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setActiveStep((prevActiveStep) => prevActiveStep - 1);
//   };

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
    
//     try {
//       setUploadProgress(0);
      
//       // Simulate file upload with progress
//       const uploadInterval = setInterval(() => {
//         setUploadProgress(prev => {
//           if (prev >= 95) {
//             clearInterval(uploadInterval);
//             return 95;
//           }
//           return prev + 5;
//         });
//       }, 100);
      
//       // Simulate API call for document upload
//       // In a real app, use your uploadDocument API function
//       // const response = await uploadDocument(file, onUploadProgress);
      
//       // Simulate API response
//       setTimeout(() => {
//         clearInterval(uploadInterval);
//         setUploadProgress(100);
        
//         const document = {
//           id: Date.now(),
//           name: file.name,
//           type: file.type,
//           size: file.size,
//           uploadDate: new Date().toISOString()
//         };
        
//         setCandidateData(prev => ({
//           ...prev,
//           documents: [...prev.documents, document]
//         }));
        
//         toast.success(`Document "${file.name}" uploaded successfully`, {
//           position: 'top-center'
//         });
        
//         setTimeout(() => setUploadProgress(0), 1000);
//       }, 2000);
      
//     } catch (error) {
//       console.error("File upload failed", error);
//       toast.error("Failed to upload document", { position: 'top-center' });
//       setUploadProgress(0);
//     }
//   };

//   const handleProfilePhotoUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
    
//     // In a real app, upload the file to your server/storage
//     // Here we're just creating a temporary URL
//     const photoUrl = URL.createObjectURL(file);
//     setCandidateData({ ...candidateData, photoUrl });
//     toast.success("Profile photo uploaded", { position: 'top-center' });
//   };

//   const handleSubmit = async () => {
//     // Validate all steps before submission
//     for (let i = 0; i <= 2; i++) {
//       if (!validateStep(i)) {
//         setActiveStep(i);
//         return;
//       }
//     }
    
//     setLoading(true);
//     try {
//       const payload = {
//         firstName: candidateData.firstName,
//         lastName: candidateData.lastName,
//         age: parseInt(candidateData.age),
//         gender: candidateData.gender,
//         partyID: parseInt(candidateData.partyID),
//         electionID: parseInt(candidateData.electionID),
//         constituency: candidateData.constituency,
//         contactNumber: candidateData.contactNumber,
//         email: candidateData.email,
//         address: candidateData.address,
//         experience: candidateData.experience,
//         education: candidateData.education
//       };
      
//       const response = await registerCandidate(payload);
      
//       toast.success(`Candidate ${candidateData.firstName} ${candidateData.lastName} registered successfully!`, {
//         position: 'top-center',
//         icon: '🎉',
//         duration: 4000
//       });
      
//       // Reset form and go back to step 1
//       setCandidateData({
//         firstName: '',
//         lastName: '',
//         age: '',
//         gender: '',
//         partyID: '',
//         electionID: '',
//         constituency: '',
//         contactNumber: '',
//         email: '',
//         address: '',
//         experience: '',
//         education: '',
//         photoUrl: '',
//         documents: []
//       });
//       setActiveStep(0);
//     } catch (error) {
//       console.error('Candidate registration error:', error);
//       toast.error(error.response?.data?.error || 'Failed to register candidate', {
//         position: 'top-center',
//         icon: '❌'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getPartyName = (partyId) => {
//     const party = parties.find(p => p.partyID === parseInt(partyId));
//     return party ? party.partyName : '';
//   };

//   const getElectionName = (electionId) => {
//     const election = elections.find(e => e.electionID === parseInt(electionId));
//     return election ? election.name : '';
//   };

//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       <Paper elevation={3} sx={{ p: 0, overflow: 'hidden' }}>
//         {/* Header Section */}
//         <Box sx={{ 
//           p: 3, 
//           background: 'linear-gradient(to right, #11047A, #001f3f)',
//           color: 'white',
//           display: 'flex',
//           alignItems: 'center'
//         }}>
//           <PersonAdd sx={{ fontSize: 40, mr: 2 }} />
//           <Box>
//             <Typography variant="h4" fontWeight="bold">
//               Candidate Registration
//             </Typography>
//             <Typography variant="subtitle1">
//               Election Commission of India - Official Portal
//             </Typography>
//           </Box>
//         </Box>

//         <Box sx={{ p: 3 }}>
//           <Alert severity="info" sx={{ mb: 4 }}>
//             Register a new candidate for upcoming elections. Please ensure all information is accurate and verified.
//           </Alert>

//           <Grid container spacing={4}>
//             {/* Stepper Section */}
//             <Grid item xs={12} md={8}>
//               <Stepper activeStep={activeStep} orientation="vertical">
//                 <Step>
//                   <StepLabel>
//                     <Typography variant="subtitle1" fontWeight="bold">Personal Information</Typography>
//                   </StepLabel>
//                   <StepContent>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} sm={6}>
//                         <TextField
//                           label="First Name *"
//                           name="firstName"
//                           fullWidth
//                           value={candidateData.firstName}
//                           onChange={handleChange}
//                           error={!!errors.firstName}
//                           helperText={errors.firstName}
//                           InputProps={{
//                             startAdornment: <AccountCircle sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} fontSize="small" />
//                           }}
//                         />
//                       </Grid>
                      
//                       <Grid item xs={12} sm={6}>
//                         <TextField
//                           label="Last Name *"
//                           name="lastName"
//                           fullWidth
//                           value={candidateData.lastName}
//                           onChange={handleChange}
//                           error={!!errors.lastName}
//                           helperText={errors.lastName}
//                         />
//                       </Grid>
                      
//                       <Grid item xs={12} sm={6}>
//                         <TextField
//                           label="Age *"
//                           name="age"
//                           type="number"
//                           fullWidth
//                           value={candidateData.age}
//                           onChange={handleChange}
//                           inputProps={{ min: 25, max: 90 }}
//                           error={!!errors.age}
//                           helperText={errors.age || "Minimum age requirement is 25 years"}
//                         />
//                       </Grid>
                      
//                       <Grid item xs={12} sm={6}>
//                         <FormControl fullWidth error={!!errors.gender}>
//                           <InputLabel id="gender-label">Gender *</InputLabel>
//                           <Select
//                             labelId="gender-label"
//                             name="gender"
//                             value={candidateData.gender}
//                             label="Gender *"
//                             onChange={handleChange}
//                           >
//                             <MenuItem value="Male">Male</MenuItem>
//                             <MenuItem value="Female">Female</MenuItem>
//                             <MenuItem value="Other">Other</MenuItem>
//                           </Select>
//                           {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
//                         </FormControl>
//                       </Grid>
                      
//                       <Grid item xs={12}>
//                         <TextField
//                           label="Education Qualifications"
//                           name="education"
//                           fullWidth
//                           multiline
//                           rows={2}
//                           value={candidateData.education}
//                           onChange={handleChange}
//                           placeholder="Enter highest qualifications and institutions"
//                         />
//                       </Grid>
//                     </Grid>
                    
//                     <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
//                       <Button
//                         variant="contained"
//                         onClick={handleNext}
//                         endIcon={<ArrowForward />}
//                         sx={{ 
//                           background: 'linear-gradient(to right, #4BC0C0, #36A2EB)',
//                           '&:hover': {
//                             background: 'linear-gradient(to right, #36A2EB, #2693DB)'
//                           }
//                         }}
//                       >
//                         Continue
//                       </Button>
//                     </Box>
//                   </StepContent>
//                 </Step>
                
//                 <Step>
//                   <StepLabel>
//                     <Typography variant="subtitle1" fontWeight="bold">Election & Party Details</Typography>
//                   </StepLabel>
//                   <StepContent>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} sm={6}>
//                         <FormControl fullWidth error={!!errors.partyID}>
//                           <InputLabel id="party-label">Select Party *</InputLabel>
//                           <Select
//                             labelId="party-label"
//                             name="partyID"
//                             value={candidateData.partyID}
//                             label="Select Party *"
//                             onChange={handleChange}
//                             startAdornment={<Flag sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} fontSize="small" />}
//                           >
//                             {parties.map(party => (
//                               <MenuItem key={party.partyID} value={party.partyID}>
//                                 {party.partyName}
//                               </MenuItem>
//                             ))}
//                             <MenuItem value="independent">Independent Candidate</MenuItem>
//                           </Select>
//                           {errors.partyID && <FormHelperText>{errors.partyID}</FormHelperText>}
//                         </FormControl>
//                       </Grid>
                      
//                       <Grid item xs={12} sm={6}>
//                         <FormControl fullWidth error={!!errors.electionID}>
//                           <InputLabel id="election-label">Select Election *</InputLabel>
//                           <Select
//                             labelId="election-label"
//                             name="electionID"
//                             value={candidateData.electionID}
//                             label="Select Election *"
//                             onChange={handleChange}
//                             startAdornment={<HowToVote sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} fontSize="small" />}
//                           >
//                             {elections.map(election => (
//                               <MenuItem key={election.electionID} value={election.electionID}>
//                                 {election.name}
//                               </MenuItem>
//                             ))}
                           
//                           </Select>
//                           {errors.electionID && <FormHelperText>{errors.electionID}</FormHelperText>}
//                         </FormControl>
//                       </Grid>
                      
//                       <Grid item xs={12}>
//                         <TextField
//                           label="Constituency *"
//                           name="constituency"
//                           fullWidth
//                           value={candidateData.constituency}
//                           onChange={handleChange}
//                           error={!!errors.constituency}
//                           helperText={errors.constituency}
//                           placeholder="Enter electoral constituency"
//                         />
//                       </Grid>
                      
//                       <Grid item xs={12}>
//                         <TextField
//                           label="Political Experience"
//                           name="experience"
//                           fullWidth
//                           multiline
//                           rows={2}
//                           value={candidateData.experience}
//                           onChange={handleChange}
//                           placeholder="Describe previous political roles and experience"
//                         />
//                       </Grid>
//                     </Grid>
                    
//                     <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
//                       <Button
//                         variant="outlined"
//                         onClick={handleBack}
//                         startIcon={<ArrowBack />}
//                       >
//                         Back
//                       </Button>
//                       <Button
//                         variant="contained"
//                         onClick={handleNext}
//                         endIcon={<ArrowForward />}
//                         sx={{ 
//                           background: 'linear-gradient(to right, #4BC0C0, #36A2EB)',
//                           '&:hover': {
//                             background: 'linear-gradient(to right, #36A2EB, #2693DB)'
//                           }
//                         }}
//                       >
//                         Continue
//                       </Button>
//                     </Box>
//                   </StepContent>
//                 </Step>
                
//                 <Step>
//                   <StepLabel>
//                     <Typography variant="subtitle1" fontWeight="bold">Contact Information</Typography>
//                   </StepLabel>
//                   <StepContent>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} sm={6}>
//                         <TextField
//                           label="Contact Number *"
//                           name="contactNumber"
//                           fullWidth
//                           value={candidateData.contactNumber}
//                           onChange={handleChange}
//                           error={!!errors.contactNumber}
//                           helperText={errors.contactNumber}
//                         />
//                       </Grid>
                      
//                       <Grid item xs={12} sm={6}>
//                         <TextField
//                           label="Email Address *"
//                           name="email"
//                           type="email"
//                           fullWidth
//                           value={candidateData.email}
//                           onChange={handleChange}
//                           error={!!errors.email}
//                           helperText={errors.email}
//                         />
//                       </Grid>
                      
//                       <Grid item xs={12}>
//                         <TextField
//                           label="Full Residential Address"
//                           name="address"
//                           fullWidth
//                           multiline
//                           rows={2}
//                           value={candidateData.address}
//                           onChange={handleChange}
//                         />
//                       </Grid>
//                     </Grid>
                    
//                     <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
//                       <Button
//                         variant="outlined"
//                         onClick={handleBack}
//                         startIcon={<ArrowBack />}
//                       >
//                         Back
//                       </Button>
//                       <Button
//                         variant="contained"
//                         onClick={handleNext}
//                         endIcon={<CheckCircle />}
//                         sx={{ 
//                           background: 'linear-gradient(to right, #4BC0C0, #36A2EB)',
//                           '&:hover': {
//                             background: 'linear-gradient(to right, #36A2EB, #2693DB)'
//                           }
//                         }}
//                       >
//                         Review & Submit
//                       </Button>
//                     </Box>
//                   </StepContent>
//                 </Step>
                
//                 <Step>
//                   <StepLabel>
//                     <Typography variant="subtitle1" fontWeight="bold">Review & Submit</Typography>
//                   </StepLabel>
//                   <StepContent>
//                     <Card variant="outlined" sx={{ mb: 3 }}>
//                       <CardContent>
//                         <Typography variant="h6" gutterBottom>
//                           Candidate Summary
//                         </Typography>
                        
//                         <Grid container spacing={2}>
//                           <Grid item xs={12} sm={6}>
//                             <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
//                             <Typography variant="body1" gutterBottom>
//                               {candidateData.firstName} {candidateData.lastName}
//                             </Typography>
//                           </Grid>
                          
//                           <Grid item xs={12} sm={3}>
//                             <Typography variant="subtitle2" color="text.secondary">Age</Typography>
//                             <Typography variant="body1" gutterBottom>{candidateData.age}</Typography>
//                           </Grid>
                          
//                           <Grid item xs={12} sm={3}>
//                             <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
//                             <Typography variant="body1" gutterBottom>{candidateData.gender}</Typography>
//                           </Grid>
                          
//                           <Grid item xs={12} sm={6}>
//                             <Typography variant="subtitle2" color="text.secondary">Party</Typography>
//                             <Typography variant="body1" gutterBottom>
//                               {getPartyName(candidateData.partyID) || "Independent"}
//                             </Typography>
//                           </Grid>
                          
//                           <Grid item xs={12} sm={6}>
//                             <Typography variant="subtitle2" color="text.secondary">Election</Typography>
//                             <Typography variant="body1" gutterBottom>
//                               {getElectionName(candidateData.electionID)}
//                             </Typography>
//                           </Grid>
                          
//                           <Grid item xs={12}>
//                             <Typography variant="subtitle2" color="text.secondary">Constituency</Typography>
//                             <Typography variant="body1" gutterBottom>{candidateData.constituency}</Typography>
//                           </Grid>
                          
//                           <Grid item xs={12} sm={6}>
//                             <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
//                             <Typography variant="body1" gutterBottom>{candidateData.contactNumber}</Typography>
//                           </Grid>
                          
//                           <Grid item xs={12} sm={6}>
//                             <Typography variant="subtitle2" color="text.secondary">Email</Typography>
//                             <Typography variant="body1" gutterBottom>{candidateData.email}</Typography>
//                           </Grid>
                          
//                           {candidateData.address && (
//                             <Grid item xs={12}>
//                               <Typography variant="subtitle2" color="text.secondary">Address</Typography>
//                               <Typography variant="body1" gutterBottom>{candidateData.address}</Typography>
//                             </Grid>
//                           )}
                          
//                           {candidateData.education && (
//                             <Grid item xs={12}>
//                               <Typography variant="subtitle2" color="text.secondary">Education</Typography>
//                               <Typography variant="body1" gutterBottom>{candidateData.education}</Typography>
//                             </Grid>
//                           )}
                          
//                           {candidateData.experience && (
//                             <Grid item xs={12}>
//                               <Typography variant="subtitle2" color="text.secondary">Political Experience</Typography>
//                               <Typography variant="body1" gutterBottom>{candidateData.experience}</Typography>
//                             </Grid>
//                           )}
//                         </Grid>
//                       </CardContent>
//                     </Card>
                    
//                     <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
//                       <Button
//                         variant="outlined"
//                         onClick={handleBack}
//                         startIcon={<ArrowBack />}
//                       >
//                         Back
//                       </Button>
//                       <Button
//                         variant="contained"
//                         onClick={handleSubmit}
//                         endIcon={<SaveAlt />}
//                         disabled={loading}
//                         sx={{ 
//                           background: 'linear-gradient(to right, #4BC0C0, #36A2EB)',
//                           '&:hover': {
//                             background: 'linear-gradient(to right, #36A2EB, #2693DB)'
//                           }
//                         }}
//                       >
//                         {loading ? (
//                           <>
//                             <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
//                             Submitting...
//                           </>
//                         ) : "Register Candidate"}
//                       </Button>
//                     </Box>
//                   </StepContent>
//                 </Step>
//               </Stepper>
//             </Grid>
            
//             {/* Right Sidebar */}
//             <Grid item xs={12} md={4}>
//               <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
//                 <Typography variant="h6" gutterBottom>
//                   Candidate Profile
//                 </Typography>
//                 <Divider sx={{ mb: 2 }} />
                
//                 <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
//                   {candidateData.photoUrl ? (
//                     <Avatar 
//                       src={candidateData.photoUrl} 
//                       sx={{ width: 100, height: 100, mb: 2 }}
//                     />
//                   ) : (
//                     <Avatar 
//                       sx={{ 
//                         width: 100, 
//                         height: 100, 
//                         mb: 2,
//                         bgcolor: '#e0e0e0'
//                       }}
//                     >
//                       <PersonAdd sx={{ fontSize: 50, color: '#757575' }} />
//                     </Avatar>
//                   )}
                  
//                   <Button
//                     variant="outlined"
//                     component="label"
//                     startIcon={<PhotoCamera />}
//                     size="small"
//                   >
//                     Upload Photo
//                     <input
//                       type="file"
//                       hidden
//                       accept="image/*"
//                       onChange={handleProfilePhotoUpload}
//                     />
//                   </Button>
//                 </Box>
                
//                 <Typography variant="subtitle1" gutterBottom>
//                   Required Documents
//                 </Typography>
//                 <Divider sx={{ mb: 2 }} />
                
//                 <Box sx={{ mb: 3 }}>
//                   <Button
//                     variant="outlined"
//                     component="label"
//                     startIcon={<AttachFile />}
//                     sx={{ mb: 2 }}
//                     fullWidth
//                   >
//                     Upload Document
//                     <input
//                       type="file"
//                       hidden
//                       onChange={handleFileUpload}
//                     />
//                   </Button>
                  
//                   {uploadProgress > 0 && (
//                     <Box sx={{ width: '100%', mb: 2 }}>
//                       <CircularProgress 
//                         variant="determinate" 
//                         value={uploadProgress} 
//                         size={24} 
//                         sx={{ mr: 1 }}
//                       />
//                       <Typography variant="body2" component="span">
//                         {uploadProgress}% Uploaded
//                       </Typography>
//                     </Box>
//                   )}
                  
//                   {candidateData.documents.length > 0 ? (
//                     <Box>
//                       {candidateData.documents.map(doc => (
//                         <Box 
//                           key={doc.id}
//                           sx={{ 
//                             display: 'flex', 
//                             alignItems: 'center', 
//                             p: 1, 
//                             mb: 1,
//                             bgcolor: '#f5f5f5',
//                             borderRadius: 1
//                           }}
//                         >
//                           <Assignment sx={{ mr: 1, color: '#3f51b5' }} />
//                           <Box sx={{ flexGrow: 1 }}>
//                             <Typography variant="body2" noWrap>
//                               {doc.name}
//                             </Typography>
//                             <Typography variant="caption" color="text.secondary" noWrap>
//                               {(doc.size / 1024).toFixed(2)} KB
//                             </Typography>
//                           </Box>
//                           <Tooltip title="Remove">
//                             <IconButton 
//                               size="small"
//                               onClick={() => {
//                                 setCandidateData(prev => ({
//                                   ...prev,
//                                   documents: prev.documents.filter(d => d.id !== doc.id)
//                                 }));
//                                 toast.success("Document removed", { position: 'top-center' });
//                               }}
//                             >
//                               <Cancel fontSize="small" />
//                             </IconButton>
//                           </Tooltip>
//                         </Box>
//                       ))}
//                     </Box>
//                   ) : (
//                     <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
//                       No documents uploaded yet
//                     </Typography>
//                   )}
//                 </Box>
                
//                 <Typography variant="subtitle1" gutterBottom>
//                   Help & Information
//                 </Typography>
//                 <Divider sx={{ mb: 2 }} />
                
//                 <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
//                   <Typography variant="body2" paragraph>
//                     <strong>Document Requirements:</strong> Please upload clear scans of the following:
//                   </Typography>
//                   <Typography variant="body2" component="div">
//                     <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
//                       <li>ID Proof (Aadhar/PAN/Passport)</li>
//                       <li>Address Proof</li>
//                       <li>Educational Certificates</li>
//                       <li>Affidavit of No Criminal Records</li>
//                       <li>Property Declaration</li>
//                     </ul>
//                   </Typography>
//                 </Box>
//               </Paper>
//             </Grid>
//           </Grid>
//         </Box>
//       </Paper>
//     </Container>
//   );
// }

// export default CandidateRegistration;

import React, { useState, useEffect, useContext } from 'react';
import { 
  TextField, Button, Container, Typography, MenuItem, Paper, Box,
  Grid, Divider, FormHelperText, Alert, Avatar, CircularProgress,
  Stepper, Step, StepLabel, StepContent, Card, CardContent, 
  IconButton, Tooltip, FormControl, InputLabel, Select, Chip
} from '@mui/material';
import { 
  PersonAdd, ArrowForward, ArrowBack, AccountCircle, 
  HowToVote, Flag, CheckCircle, SaveAlt, Cancel,
  EventAvailable, Assignment, PhotoCamera
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { registerCandidate, getParties, getElections } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function CandidateRegistration() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState([]);
  const [elections, setElections] = useState([]);
  
  const [candidateData, setCandidateData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    partyID: '',
    electionID: '',
    constituency: '',
    contactNumber: '',
    email: '',
    address: '',
    experience: '',
    education: '',
    photoUrl: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partiesData, electionsData] = await Promise.all([
          getParties(),
          getElections()
        ]);
        setParties(partiesData || []);
        setElections(electionsData || []);
      } catch (error) {
        console.error("Failed to fetch reference data", error);
        toast.error("Failed to load required data", { position: 'top-center' });
      }
    };
    
    fetchData();
  }, []);

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
          <Cancel color="error" sx={{ fontSize: 60 }} />
          <Typography variant="h4" sx={{ mt: 2, color: '#d32f2f' }}>
            Access Restricted
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You must be an Election Commission Official to register candidates.
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

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!candidateData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!candidateData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!candidateData.age) newErrors.age = 'Age is required';
      else if (candidateData.age < 25) newErrors.age = 'Candidate must be at least 25 years old';
      if (!candidateData.gender) newErrors.gender = 'Gender is required';
    } else if (step === 1) {
      if (!candidateData.partyID) newErrors.partyID = 'Party selection is required';
      if (!candidateData.electionID) newErrors.electionID = 'Election selection is required';
      if (!candidateData.constituency.trim()) newErrors.constituency = 'Constituency is required';
    } else if (step === 2) {
      if (!candidateData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
      if (!candidateData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(candidateData.email)) newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCandidateData({ ...candidateData, [name]: value });
    
    if (errors[name]) {
      setErrors({...errors, [name]: null});
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const photoUrl = URL.createObjectURL(file); // Temporary URL for preview
    setCandidateData({ ...candidateData, photoUrl });
    toast.success("Profile photo uploaded", { position: 'top-center' });
  };

  const handleSubmit = async () => {
    for (let i = 0; i <= 2; i++) {
      if (!validateStep(i)) {
        setActiveStep(i);
        return;
      }
    }
    
    setLoading(true);
    try {
      const payload = {
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        age: parseInt(candidateData.age),
        gender: candidateData.gender,
        partyID: parseInt(candidateData.partyID),
        electionID: parseInt(candidateData.electionID),
        constituency: candidateData.constituency,
        contactNumber: candidateData.contactNumber,
        email: candidateData.email,
        address: candidateData.address,
        experience: candidateData.experience,
        education: candidateData.education,
        photoUrl: candidateData.photoUrl // Include photo URL in payload
      };
      
      const response = await registerCandidate(payload);
      
      toast.success(`Candidate ${candidateData.firstName} ${candidateData.lastName} registered successfully!`, {
        position: 'top-center',
        icon: '🎉',
        duration: 4000
      });
      
      setCandidateData({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        partyID: '',
        electionID: '',
        constituency: '',
        contactNumber: '',
        email: '',
        address: '',
        experience: '',
        education: '',
        photoUrl: ''
      });
      setActiveStep(0);
    } catch (error) {
      console.error('Candidate registration error:', error);
      toast.error(error.response?.data?.error || 'Failed to register candidate', {
        position: 'top-center',
        icon: '❌'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPartyName = (partyId) => {
    const party = parties.find(p => p.partyID === parseInt(partyId));
    return party ? party.partyName : '';
  };

  const getElectionName = (electionId) => {
    const election = elections.find(e => e.electionID === parseInt(electionId));
    return election ? election.name : '';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(to right, #11047A, #001f3f)',
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          <PersonAdd sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Candidate Registration
            </Typography>
            <Typography variant="subtitle1">
              Election Commission of India - Official Portal
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 4 }}>
            Register a new candidate for upcoming elections. Please ensure all information is accurate and verified.
          </Alert>

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                  <StepLabel>
                    <Typography variant="subtitle1" fontWeight="bold">Personal Information</Typography>
                  </StepLabel>
                  <StepContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="First Name *"
                          name="firstName"
                          fullWidth
                          value={candidateData.firstName}
                          onChange={handleChange}
                          error={!!errors.firstName}
                          helperText={errors.firstName}
                          InputProps={{
                            startAdornment: <AccountCircle sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} fontSize="small" />
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Last Name *"
                          name="lastName"
                          fullWidth
                          value={candidateData.lastName}
                          onChange={handleChange}
                          error={!!errors.lastName}
                          helperText={errors.lastName}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Age *"
                          name="age"
                          type="number"
                          fullWidth
                          value={candidateData.age}
                          onChange={handleChange}
                          inputProps={{ min: 25, max: 90 }}
                          error={!!errors.age}
                          helperText={errors.age || "Minimum age requirement is 25 years"}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.gender}>
                          <InputLabel id="gender-label">Gender *</InputLabel>
                          <Select
                            labelId="gender-label"
                            name="gender"
                            value={candidateData.gender}
                            label="Gender *"
                            onChange={handleChange}
                          >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                          {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Education Qualifications"
                          name="education"
                          fullWidth
                          multiline
                          rows={2}
                          value={candidateData.education}
                          onChange={handleChange}
                          placeholder="Enter highest qualifications and institutions"
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<ArrowForward />}
                        sx={{ 
                          background: 'linear-gradient(to right, #4BC0C0, #36A2EB)',
                          '&:hover': {
                            background: 'linear-gradient(to right, #36A2EB, #2693DB)'
                          }
                        }}
                      >
                        Continue
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel>
                    <Typography variant="subtitle1" fontWeight="bold">Election & Party Details</Typography>
                  </StepLabel>
                  <StepContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.partyID}>
                          <InputLabel id="party-label">Select Party *</InputLabel>
                          <Select
                            labelId="party-label"
                            name="partyID"
                            value={candidateData.partyID}
                            label="Select Party *"
                            onChange={handleChange}
                            startAdornment={<Flag sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} fontSize="small" />}
                          >
                            {parties.map(party => (
                              <MenuItem key={party.partyID} value={party.partyID}>
                                {party.partyName}
                              </MenuItem>
                            ))}
                            <MenuItem value="independent">Independent Candidate</MenuItem>
                          </Select>
                          {errors.partyID && <FormHelperText>{errors.partyID}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.electionID}>
                          <InputLabel id="election-label">Select Election *</InputLabel>
                          <Select
                            labelId="election-label"
                            name="electionID"
                            value={candidateData.electionID}
                            label="Select Election *"
                            onChange={handleChange}
                            startAdornment={<HowToVote sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} fontSize="small" />}
                          >
                            {elections.map(election => (
                              <MenuItem key={election.electionID} value={election.electionID}>
                                {election.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.electionID && <FormHelperText>{errors.electionID}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Constituency *"
                          name="constituency"
                          fullWidth
                          value={candidateData.constituency}
                          onChange={handleChange}
                          error={!!errors.constituency}
                          helperText={errors.constituency}
                          placeholder="Enter electoral constituency"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Political Experience"
                          name="experience"
                          fullWidth
                          multiline
                          rows={2}
                          value={candidateData.experience}
                          onChange={handleChange}
                          placeholder="Describe previous political roles and experience"
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<ArrowBack />}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<ArrowForward />}
                        sx={{ 
                          background: 'linear-gradient(to right, #4BC0C0, #36A2EB)',
                          '&:hover': {
                            background: 'linear-gradient(to right, #36A2EB, #2693DB)'
                          }
                        }}
                      >
                        Continue
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel>
                    <Typography variant="subtitle1" fontWeight="bold">Contact Information</Typography>
                  </StepLabel>
                  <StepContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Contact Number *"
                          name="contactNumber"
                          fullWidth
                          value={candidateData.contactNumber}
                          onChange={handleChange}
                          error={!!errors.contactNumber}
                          helperText={errors.contactNumber}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email Address *"
                          name="email"
                          type="email"
                          fullWidth
                          value={candidateData.email}
                          onChange={handleChange}
                          error={!!errors.email}
                          helperText={errors.email}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Full Residential Address"
                          name="address"
                          fullWidth
                          multiline
                          rows={2}
                          value={candidateData.address}
                          onChange={handleChange}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<ArrowBack />}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<CheckCircle />}
                        sx={{ 
                          background: 'linear-gradient(to right, #4BC0C0, #36A2EB)',
                          '&:hover': {
                            background: 'linear-gradient(to right, #36A2EB, #2693DB)'
                          }
                        }}
                      >
                        Review & Submit
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel>
                    <Typography variant="subtitle1" fontWeight="bold">Review & Submit</Typography>
                  </StepLabel>
                  <StepContent>
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Candidate Summary
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                            <Typography variant="body1" gutterBottom>
                              {candidateData.firstName} {candidateData.lastName}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2" color="text.secondary">Age</Typography>
                            <Typography variant="body1" gutterBottom>{candidateData.age}</Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                            <Typography variant="body1" gutterBottom>{candidateData.gender}</Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Party</Typography>
                            <Typography variant="body1" gutterBottom>
                              {getPartyName(candidateData.partyID) || "Independent"}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Election</Typography>
                            <Typography variant="body1" gutterBottom>
                              {getElectionName(candidateData.electionID)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">Constituency</Typography>
                            <Typography variant="body1" gutterBottom>{candidateData.constituency}</Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                            <Typography variant="body1" gutterBottom>{candidateData.contactNumber}</Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                            <Typography variant="body1" gutterBottom>{candidateData.email}</Typography>
                          </Grid>
                          
                          {candidateData.address && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                              <Typography variant="body1" gutterBottom>{candidateData.address}</Typography>
                            </Grid>
                          )}
                          
                          {candidateData.education && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary">Education</Typography>
                              <Typography variant="body1" gutterBottom>{candidateData.education}</Typography>
                            </Grid>
                          )}
                          
                          {candidateData.experience && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary">Political Experience</Typography>
                              <Typography variant="body1" gutterBottom>{candidateData.experience}</Typography>
                            </Grid>
                          )}
                          
                          {candidateData.photoUrl && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary">Profile Photo</Typography>
                              <Avatar 
                                src={candidateData.photoUrl} 
                                sx={{ width: 100, height: 100 }}
                              />
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                    
                    <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<ArrowBack />}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        endIcon={<SaveAlt />}
                        disabled={loading}
                        sx={{ 
                          background: 'linear-gradient(to right, #4BC0C0, #36A2EB)',
                          '&:hover': {
                            background: 'linear-gradient(to right, #36A2EB, #2693DB)'
                          }
                        }}
                      >
                        {loading ? (
                          <>
                            <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                            Submitting...
                          </>
                        ) : "Register Candidate"}
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Candidate Profile
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  {candidateData.photoUrl ? (
                    <Avatar 
                      src={candidateData.photoUrl} 
                      sx={{ width: 100, height: 100, mb: 2 }}
                    />
                  ) : (
                    <Avatar 
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        mb: 2,
                        bgcolor: '#e0e0e0'
                      }}
                    >
                      <PersonAdd sx={{ fontSize: 50, color: '#757575' }} />
                    </Avatar>
                  )}
                  
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    size="small"
                  >
                    Upload Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleProfilePhotoUpload}
                    />
                  </Button>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Help & Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" paragraph>
                    <strong>Document Requirements:</strong> Please upload clear scans of the following:
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                      <li>ID Proof (Aadhar/PAN/Passport)</li>
                      <li>Address Proof</li>
                      <li>Educational Certificates</li>
                      <li>Affidavit of No Criminal Records</li>
                      <li>Property Declaration</li>
                    </ul>
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default CandidateRegistration;