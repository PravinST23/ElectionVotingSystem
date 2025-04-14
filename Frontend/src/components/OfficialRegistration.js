// import React, { useState } from 'react';
// import { 
//   TextField, Button, Container, Typography, Checkbox, FormControlLabel, MenuItem, 
//   Paper, Box, Grid, Stepper, Step, StepLabel, StepContent, Divider, 
//   InputAdornment, CircularProgress, Alert, Avatar, IconButton
// } from '@mui/material';
// import { 
//   PersonAdd, Fingerprint, Phone, CalendarToday, 
//   Email, Lock, ChevronRight, Check, InfoOutlined, 
//   AdminPanelSettings, CheckCircle, Flag
// } from '@mui/icons-material';
// import { Link } from 'react-router-dom';
// import { registerOfficial } from '../services/api';
// import toast from 'react-hot-toast';

// function OfficialRegistration() {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [verified, setVerified] = useState(false);
//   const [success, setSuccess] = useState(false);
  
//   const [data, setData] = useState({
//     FirstName: '',
//     MiddleName: '',
//     LastName: '',
//     Email: '',
//     EmailConfirmation: '', // Changed to PascalCase for consistency
//     Password: '',
//     passwordConfirmation: '', // Kept for frontend validation
//     NationalID: '',
//     MobileNumber: '',
//     DateOfBirth: '',
//     Gender: 'Male',
//     Consent: false,
//     declarationConsent: false
//   });
  
//   const [errors, setErrors] = useState({});

//   const handleInputChange = (e) => {
//     const { name, value, checked, type } = e.target;
//     setData({ ...data, [name]: type === 'checkbox' ? checked : value });
//     if (errors[name]) {
//       setErrors({ ...errors, [name]: '' });
//     }
//   };

//   const validateStep = (step) => {
//     const newErrors = {};
    
//     if (step === 0) {
//       if (!data.FirstName.trim()) newErrors.FirstName = 'First name is required';
//       if (!data.LastName.trim()) newErrors.LastName = 'Last name is required';
//       if (!data.DateOfBirth) newErrors.DateOfBirth = 'Date of birth is required';
//       else {
//         const birthDate = new Date(data.DateOfBirth);
//         const today = new Date();
//         const age = today.getFullYear() - birthDate.getFullYear();
//         if (age < 21) newErrors.DateOfBirth = 'You must be at least 21 years old to register as an official';
//       }
//       if (!data.Gender) newErrors.Gender = 'Gender is required';
//     }
    
//     else if (step === 1) {
//       if (!data.NationalID.trim()) newErrors.NationalID = 'Aadhaar number is required';
//       else if (!/^\d{12}$/.test(data.NationalID)) newErrors.NationalID = 'Aadhaar number must be 12 digits';
//       if (!data.MobileNumber.trim()) newErrors.MobileNumber = 'Mobile number is required';
//       else if (!/^\d{10}$/.test(data.MobileNumber)) newErrors.MobileNumber = 'Mobile number must be 10 digits';
//     }
    
//     else if (step === 2) {
//       if (!data.Email.trim()) newErrors.Email = 'Email is required';
//       else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.Email)) newErrors.Email = 'Enter a valid email address';
//       if (!data.EmailConfirmation.trim()) newErrors.EmailConfirmation = 'Confirm your email';
//       else if (data.Email !== data.EmailConfirmation) newErrors.EmailConfirmation = 'Emails do not match';
//       if (!data.Password.trim()) newErrors.Password = 'Password is required';
//       else if (data.Password.length < 8) newErrors.Password = 'Password must be at least 8 characters';
//       if (!data.passwordConfirmation.trim()) newErrors.passwordConfirmation = 'Confirm your password';
//       else if (data.Password !== data.passwordConfirmation) newErrors.passwordConfirmation = 'Passwords do not match';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleVerifyAadhaar = () => {
//     if (!data.NationalID.trim() || !/^\d{12}$/.test(data.NationalID)) {
//       setErrors({ ...errors, NationalID: 'Valid Aadhaar number is required' });
//       return;
//     }
//     setVerifying(true);
//     setTimeout(() => {
//       setVerifying(false);
//       setVerified(true);
//       toast.success('Aadhaar verification successful', { position: 'top-center', icon: '✅' });
//     }, 2000);
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setActiveStep((prevActiveStep) => prevActiveStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setActiveStep((prevActiveStep) => prevActiveStep - 1);
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(2)) return;
    
//     if (!data.Consent || !data.declarationConsent) {
//       toast.error('You must agree to all terms and declarations', { position: 'top-center', icon: '⚠️' });
//       return;
//     }
    
//     if (data.Email !== data.EmailConfirmation) {
//       toast.error('Email and confirmation email do not match', { position: 'top-center', icon: '❌' });
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         FirstName: data.FirstName || null,
//         MiddleName: data.MiddleName || null,
//         LastName: data.LastName || null,
//         Gender: data.Gender || null,
//         DateOfBirth: data.DateOfBirth || null,
//         Age: calculateAge(data.DateOfBirth),
//         NationalID: data.NationalID || null,
//         Email: data.Email || null,
//         EmailConfirmation: data.EmailConfirmation || null, // Added to match backend DTO
//         MobileNumber: data.MobileNumber || null,
//         OfficialStatus: "Pending",
//         ValidFrom: new Date().toISOString(),
//         ValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(),
//         Password: data.Password, // Required by DTO
//         Consent: data.Consent
//       };
      
//       console.log('Payload:', payload); // Debugging log
//       await registerOfficial(payload);
//       setSuccess(true);
//       toast.success('Registration submitted successfully!', {
//         position: 'top-center',
//         duration: 5000,
//         icon: '🎉'
//       });
//     } catch (error) {
//       console.error('Registration error:', error.response?.data || error.message);
//       toast.error(error.response?.data?.message || 'Registration failed. Please check your details.', {
//         position: 'top-center',
//         icon: '❌'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateAge = (dob) => {
//     const birthDate = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   if (success) {
//     return (
//       <Container maxWidth="md" sx={{ my: 8 }}>
//         <Paper 
//           elevation={3} 
//           sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
//         >
//           <Avatar sx={{ bgcolor: 'success.main', width: 60, height: 60, mb: 2 }}>
//             <CheckCircle fontSize="large" />
//           </Avatar>
//           <Typography variant="h4" component="h1" gutterBottom>
//             Official Registration Submitted!
//           </Typography>
//           <Typography variant="body1" paragraph>
//             Your application to register as an election official has been submitted successfully.
//           </Typography>
//           <Typography variant="body1" paragraph>
//             Your application will be reviewed by the Election Commission of India.
//             You will receive an email notification once your registration is approved.
//           </Typography>
//           <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
//             Application ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
//           </Typography>
//           <Button variant="contained" color="primary" component={Link} to="/login" sx={{ mt: 2 }}>
//             Return to Login
//           </Button>
//         </Paper>
//       </Container>
//     );
//   }

//   const steps = [
//     {
//       label: 'Personal Information',
//       description: 'Enter your basic personal details',
//       fields: (
//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           <Grid item xs={12} sm={4}>
//             <TextField
//               name="FirstName"
//               label="First Name (as per Aadhaar)"
//               fullWidth
//               required
//               value={data.FirstName}
//               onChange={handleInputChange}
//               error={!!errors.FirstName}
//               helperText={errors.FirstName}
//               InputProps={{
//                 startAdornment: (<InputAdornment position="start"><PersonAdd color="action" /></InputAdornment>),
//               }}
//             />
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <TextField
//               name="MiddleName"
//               label="Middle Name (if any)"
//               fullWidth
//               value={data.MiddleName}
//               onChange={handleInputChange}
//               error={!!errors.MiddleName}
//               helperText={errors.MiddleName}
//             />
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <TextField
//               name="LastName"
//               label="Last Name (as per Aadhaar)"
//               fullWidth
//               required
//               value={data.LastName}
//               onChange={handleInputChange}
//               error={!!errors.LastName}
//               helperText={errors.LastName}
//             />
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <TextField
//               name="DateOfBirth"
//               label="Date of Birth"
//               type="date"
//               fullWidth
//               required
//               value={data.DateOfBirth}
//               onChange={handleInputChange}
//               error={!!errors.DateOfBirth}
//               helperText={errors.DateOfBirth}
//               InputProps={{
//                 startAdornment: (<InputAdornment position="start"><CalendarToday color="action" /></InputAdornment>),
//               }}
//               InputLabelProps={{ shrink: true }}
//             />
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <TextField
//               name="Gender"
//               select
//               label="Gender"
//               fullWidth
//               required
//               value={data.Gender}
//               onChange={handleInputChange}
//               error={!!errors.Gender}
//               helperText={errors.Gender}
//             >
//               <MenuItem value="Male">Male</MenuItem>
//               <MenuItem value="Female">Female</MenuItem>
//               <MenuItem value="Other">Other</MenuItem>
//             </TextField>
//           </Grid>
//         </Grid>
//       ),
//     },
//     {
//       label: 'Identity Verification',
//       description: 'Provide your identification details',
//       fields: (
//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           <Grid item xs={12}>
//             <Alert severity="info" sx={{ mb: 2 }}>
//               All information provided will be verified with government databases. Officials must undergo additional background verification.
//             </Alert>
//           </Grid>
//           <Grid item xs={12} sm={8}>
//             <TextField
//               name="NationalID"
//               label="Aadhaar Number"
//               fullWidth
//               required
//               value={data.NationalID}
//               onChange={handleInputChange}
//               error={!!errors.NationalID}
//               helperText={errors.NationalID}
//               InputProps={{
//                 startAdornment: (<InputAdornment position="start"><Fingerprint color="action" /></InputAdornment>),
//               }}
//             />
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <Button 
//               variant="contained" 
//               color="primary" 
//               onClick={handleVerifyAadhaar}
//               disabled={verifying || verified}
//               sx={{ height: '56px' }}
//               fullWidth
//             >
//               {verifying ? (
//                 <CircularProgress size={24} />
//               ) : verified ? (
//                 <><CheckCircle sx={{ mr: 1 }} />Verified</>
//               ) : (
//                 'Verify Aadhaar'
//               )}
//             </Button>
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               name="MobileNumber"
//               label="Mobile Number"
//               fullWidth
//               required
//               value={data.MobileNumber}
//               onChange={handleInputChange}
//               error={!!errors.MobileNumber}
//               helperText={errors.MobileNumber}
//               InputProps={{
//                 startAdornment: (<InputAdornment position="start"><Phone color="action" /></InputAdornment>),
//               }}
//             />
//           </Grid>
//         </Grid>
//       ),
//     },
//     {
//       label: 'Account Setup',
//       description: 'Create your login credentials',
//       fields: (
//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           <Grid item xs={12}>
//             <TextField
//               name="Email"
//               label="Email Address"
//               type="email"
//               fullWidth
//               required
//               value={data.Email}
//               onChange={handleInputChange}
//               error={!!errors.Email}
//               helperText={errors.Email}
//               InputProps={{
//                 startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>),
//               }}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               name="EmailConfirmation"
//               label="Confirm Email Address"
//               type="email"
//               fullWidth
//               required
//               value={data.EmailConfirmation}
//               onChange={handleInputChange}
//               error={!!errors.EmailConfirmation}
//               helperText={errors.EmailConfirmation}
//               InputProps={{
//                 startAdornment: (<InputAdornment position="start"><Check color="action" /></InputAdornment>),
//               }}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               name="Password"
//               label="Password"
//               type="password"
//               fullWidth
//               required
//               value={data.Password}
//               onChange={handleInputChange}
//               error={!!errors.Password}
//               helperText={errors.Password || "Password must be at least 8 characters long"}
//               InputProps={{
//                 startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
//               }}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               name="passwordConfirmation"
//               label="Confirm Password"
//               type="password"
//               fullWidth
//               required
//               value={data.passwordConfirmation}
//               onChange={handleInputChange}
//               error={!!errors.passwordConfirmation}
//               helperText={errors.passwordConfirmation}
//               InputProps={{
//                 startAdornment: (<InputAdornment position="start"><Check color="action" /></InputAdornment>),
//               }}
//             />
//           </Grid>
//         </Grid>
//       ),
//     }
//   ];

//   return (
//     <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
//       <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
//         <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: { sm: 'space-between' } }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
//             <Avatar sx={{ bgcolor: 'secondary.main', width: 50, height: 50, mr: 2 }}>
//               <AdminPanelSettings fontSize="large" />
//             </Avatar>
//             <Box>
//               <Typography variant="h4" component="h1">Official Registration</Typography>
//               <Typography variant="subtitle1" color="text.secondary">Election Commission of India</Typography>
//             </Box>
//           </Box>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <Flag color="error" sx={{ mr: 1 }} />
//             <Typography variant="subtitle2" color="text.secondary">अधिकारी पंजीकरण | Official Registration</Typography>
//           </Box>
//         </Box>

//         <Alert severity="warning" sx={{ mb: 4 }}>
//           <Typography variant="body2">
//             <strong>Important:</strong> Election officials are entrusted with significant responsibilities. 
//             All applicants must undergo thorough background checks and verification.
//           </Typography>
//         </Alert>

//         <Stepper activeStep={activeStep} orientation="vertical">
//           {steps.map((step, index) => (
//             <Step key={step.label}>
//               <StepLabel>{step.label}</StepLabel>
//               <StepContent>
//                 <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>{step.description}</Typography>
//                 {step.fields}
//                 <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
//                   <Button disabled={index === 0} onClick={handleBack}>Back</Button>
//                   <Button variant="contained" onClick={handleNext} endIcon={<ChevronRight />}>
//                     {index === steps.length - 1 ? 'Proceed to Declaration' : 'Continue'}
//                   </Button>
//                 </Box>
//               </StepContent>
//             </Step>
//           ))}
//         </Stepper>

//         {activeStep === steps.length && (
//           <Box sx={{ p: 3 }}>
//             <Typography variant="h6" gutterBottom>Declaration and Consent</Typography>
//             <Alert severity="warning" sx={{ mb: 3 }}>
//               <Typography variant="body2">
//                 Providing false information or misrepresenting yourself as an election official is a punishable offense under the Indian Penal Code and the Representation of the People Act.
//               </Typography>
//             </Alert>
//             <FormControlLabel
//               control={<Checkbox checked={data.declarationConsent} onChange={handleInputChange} name="declarationConsent" color="primary" />}
//               label={<Typography variant="body2">I hereby declare that I am a citizen of India, and all information provided by me is true to the best of my knowledge. I understand that I will be required to undergo training and certification before being assigned duties.</Typography>}
//             />
//             <Box sx={{ mt: 2 }}>
//               <FormControlLabel
//                 control={<Checkbox checked={data.Consent} onChange={handleInputChange} name="Consent" color="primary" />}
//                 label={<Typography variant="body2">I agree to the Terms and Conditions of the Election Commission of India and consent to background verification as required for this position.</Typography>}
//               />
//             </Box>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
//               <Button onClick={handleBack}>Back</Button>
//               <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading} sx={{ minWidth: 150 }}>
//                 {loading ? <CircularProgress size={24} /> : 'Submit Application'}
//               </Button>
//             </Box>
//           </Box>
//         )}
//       </Paper>
//     </Container>
//   );
// }

// export default OfficialRegistration;

import React, { useState } from 'react';
import { 
  TextField, Button, Container, Typography, Checkbox, FormControlLabel, MenuItem, 
  Paper, Box, Grid, Stepper, Step, StepLabel, StepContent, Divider, 
  InputAdornment, CircularProgress, Alert, Avatar, IconButton
} from '@mui/material';
import { 
  PersonAdd, Fingerprint, Phone, CalendarToday, 
  Email, Lock, ChevronRight, Check, InfoOutlined, 
  AdminPanelSettings, CheckCircle, Flag
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { registerOfficial } from '../services/api';
import toast from 'react-hot-toast';

function OfficialRegistration() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [data, setData] = useState({
    FirstName: '',
    MiddleName: '',
    LastName: '',
    Email: '',
    EmailConfirmation: '',
    Password: '',
    passwordConfirmation: '',
    NationalID: '',
    MobileNumber: '',
    DateOfBirth: '',
    Gender: 'Male',
    Consent: false,
    declarationConsent: false
  });
  
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setData({ ...data, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!data.FirstName.trim()) newErrors.FirstName = 'First name is required';
      if (!data.LastName.trim()) newErrors.LastName = 'Last name is required';
      if (!data.DateOfBirth) newErrors.DateOfBirth = 'Date of birth is required';
      else {
        const birthDate = new Date(data.DateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 21) newErrors.DateOfBirth = 'You must be at least 21 years old to register as an official';
      }
      if (!data.Gender) newErrors.Gender = 'Gender is required';
    }
    
    else if (step === 1) {
      if (!data.NationalID.trim()) newErrors.NationalID = 'Aadhaar number is required';
      else if (!/^\d{12}$/.test(data.NationalID)) newErrors.NationalID = 'Aadhaar number must be 12 digits';
      if (!data.MobileNumber.trim()) newErrors.MobileNumber = 'Mobile number is required';
      else if (!/^\d{10}$/.test(data.MobileNumber)) newErrors.MobileNumber = 'Mobile number must be 10 digits';
    }
    
    else if (step === 2) {
      if (!data.Email.trim()) newErrors.Email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.Email)) newErrors.Email = 'Enter a valid email address';
      if (!data.EmailConfirmation.trim()) newErrors.EmailConfirmation = 'Confirm your email';
      else if (data.Email !== data.EmailConfirmation) newErrors.EmailConfirmation = 'Emails do not match';
      if (!data.Password.trim()) newErrors.Password = 'Password is required';
      else if (data.Password.length < 8) newErrors.Password = 'Password must be at least 8 characters';
      if (!data.passwordConfirmation.trim()) newErrors.passwordConfirmation = 'Confirm your password';
      else if (data.Password !== data.passwordConfirmation) newErrors.passwordConfirmation = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyAadhaar = () => {
    if (!data.NationalID.trim() || !/^\d{12}$/.test(data.NationalID)) {
      setErrors({ ...errors, NationalID: 'Valid Aadhaar number is required' });
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      toast.success('Aadhaar verification successful', { position: 'top-center', icon: '✅' });
    }, 2000);
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    
    if (!data.Consent || !data.declarationConsent) {
      toast.error('You must agree to all terms and declarations', { position: 'top-center', icon: '⚠️' });
      return;
    }
    
    if (data.Email !== data.EmailConfirmation) {
      toast.error('Email and confirmation email do not match', { position: 'top-center', icon: '❌' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        FirstName: data.FirstName || null,
        MiddleName: data.MiddleName || null,
        LastName: data.LastName || null,
        Gender: data.Gender || null,
        DateOfBirth: data.DateOfBirth || null,
        Age: calculateAge(data.DateOfBirth),
        NationalID: data.NationalID || null,
        Email: data.Email || null,
        EmailConfirmation: data.EmailConfirmation || null,
        MobileNumber: data.MobileNumber || null,
        OfficialStatus: "Pending",
        ValidFrom: new Date().toISOString(),
        ValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(),
        Password: data.Password,
        Consent: data.Consent
      };
      
      console.log('Payload:', payload);
      await registerOfficial(payload);
      setSuccess(true);
      toast.success('Registration submitted successfully!', {
        position: 'top-center',
        duration: 5000,
        icon: '🎉'
      });
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Registration failed. Please check your details.', {
        position: 'top-center',
        icon: '❌'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ my: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: '#FFFFFF' }}
        >
          <Avatar sx={{ bgcolor: '#008000', width: 60, height: 60, mb: 2 }}>
            <CheckCircle fontSize="large" />
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom color="#003087">
            Official Registration Submitted!
          </Typography>
          <Typography variant="body1" paragraph color="#808080">
            Your application to register as an election official has been submitted successfully.
          </Typography>
          <Typography variant="body1" paragraph color="#808080">
            Your application will be reviewed by the Election Commission of India.
            You will receive an email notification once your registration is approved.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }} color="#003087">
            Application ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </Typography>
          <Button variant="contained" color="primary" component={Link} to="/login" sx={{ mt: 2, backgroundColor: '#F28C38', '&:hover': { backgroundColor: '#D8702A' } }}>
            Return to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  const steps = [
    {
      label: 'Personal Information',
      description: 'Enter your basic personal details',
      fields: (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              name="FirstName"
              label="First Name (as per Aadhaar)"
              fullWidth
              required
              value={data.FirstName}
              onChange={handleInputChange}
              error={!!errors.FirstName}
              helperText={errors.FirstName}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><PersonAdd color="action" /></InputAdornment>),
              }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080' }, '&:hover fieldset': { borderColor: '#003087' } } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="MiddleName"
              label="Middle Name (if any)"
              fullWidth
              value={data.MiddleName}
              onChange={handleInputChange}
              error={!!errors.MiddleName}
              helperText={errors.MiddleName}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080' }, '&:hover fieldset': { borderColor: '#003087' } } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="LastName"
              label="Last Name (as per Aadhaar)"
              fullWidth
              required
              value={data.LastName}
              onChange={handleInputChange}
              error={!!errors.LastName}
              helperText={errors.LastName}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080' }, '&:hover fieldset': { borderColor: '#003087' } } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="DateOfBirth"
              label="Date of Birth"
              type="date"
              fullWidth
              required
              value={data.DateOfBirth}
              onChange={handleInputChange}
              error={!!errors.DateOfBirth}
              helperText={errors.DateOfBirth}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><CalendarToday color="action" /></InputAdornment>),
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080' }, '&:hover fieldset': { borderColor: '#003087' } } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="Gender"
              select
              label="Gender"
              fullWidth
              required
              value={data.Gender}
              onChange={handleInputChange}
              error={!!errors.Gender}
              helperText={errors.Gender}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080' }, '&:hover fieldset': { borderColor: '#003087' } } }}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Identity Verification',
      description: 'Provide your identification details',
      fields: (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2, backgroundColor: '#E3F2FD', color: '#003087' }}>
              All information provided will be verified with government databases. Officials must undergo additional background verification.
            </Alert>
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              name="NationalID"
              label="Aadhaar Number"
              fullWidth
              required
              value={data.NationalID}
              onChange={handleInputChange}
              error={!!errors.NationalID}
              helperText={errors.NationalID}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><Fingerprint color="action" /></InputAdornment>),
              }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080' }, '&:hover fieldset': { borderColor: '#003087' } } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleVerifyAadhaar}
              disabled={verifying || verified}
              sx={{ height: '56px', backgroundColor: '#F28C38', '&:hover': { backgroundColor: '#D8702A' }, '&:disabled': { backgroundColor: '#CCCCCC' } }}
              fullWidth
            >
              {verifying ? (
                <CircularProgress size={24} />
              ) : verified ? (
                <><CheckCircle sx={{ mr: 1 }} />Verified</>
              ) : (
                'Verify Aadhaar'
              )}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="MobileNumber"
              label="Mobile Number"
              fullWidth
              required
              value={data.MobileNumber}
              onChange={handleInputChange}
              error={!!errors.MobileNumber}
              helperText={errors.MobileNumber}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><Phone color="action" /></InputAdornment>),
              }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080' }, '&:hover fieldset': { borderColor: '#003087' } } }}
            />
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Account Setup',
      description: 'Create your login credentials',
      fields: (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="Email"
              label="Email Address"
              type="email"
              fullWidth
              required
              value={data.Email}
              onChange={handleInputChange}
              error={!!errors.Email}
              helperText={errors.Email}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>),
              }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080' }, '&:hover fieldset': { borderColor: '#003087' } } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="EmailConfirmation"
              label="Confirm Email Address"
              type="email"
              fullWidth
              required
              value={data.EmailConfirmation}
              onChange={handleInputChange}
              error={!!errors.EmailConfirmation}
              helperText={errors.EmailConfirmation}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><Check color="action" /></InputAdornment>),
              }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080' }, '&:hover fieldset': { borderColor: '#003087' } } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="Password"
              label="Password"
              type="password"
              fullWidth
              required
              value={data.Password}
              onChange={handleInputChange}
              error={!!errors.Password}
              helperText={errors.Password || "Password must be at least 8 characters long"}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
              }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080' }, '&:hover fieldset': { borderColor: '#003087' } } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="passwordConfirmation"
              label="Confirm Password"
              type="password"
              fullWidth
              required
              value={data.passwordConfirmation}
              onChange={handleInputChange}
              error={!!errors.passwordConfirmation}
              helperText={errors.passwordConfirmation}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><Check color="action" /></InputAdornment>),
              }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#808080' }, '&:hover fieldset': { borderColor: '#003087' } } }}
            />
          </Grid>
        </Grid>
      ),
    }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8, backgroundColor: '#FFFFFF' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#FFFFFF' }}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: { sm: 'space-between' }, backgroundColor: '#003087', color: '#FFFFFF', p: 2, borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
            <Avatar sx={{ bgcolor: '#F28C38', width: 50, height: 50, mr: 2 }}>
              <AdminPanelSettings fontSize="large" sx={{ color: '#FFFFFF' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" color="#FFFFFF">Official Registration</Typography>
              <Typography variant="subtitle1" color="#E0E0E0">Election Commission of India</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Flag color="error" sx={{ mr: 1, color: '#F28C38' }} />
            <Typography variant="subtitle2" color="#E0E0E0">अधिकारी पंजीकरण | Official Registration</Typography>
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mb: 4, backgroundColor: '#FFF3E0', color: '#F28C38' }}>
          <Typography variant="body2">
            <strong>Important:</strong> Election officials are entrusted with significant responsibilities. 
            All applicants must undergo thorough background checks and verification.
          </Typography>
        </Alert>

        <Stepper activeStep={activeStep} orientation="vertical" sx={{ '& .MuiStepLabel-root .Mui-active': { color: '#003087' }, '& .MuiStepLabel-root .Mui-completed': { color: '#008000' } }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography variant="subtitle2" color="#808080" sx={{ mb: 2 }}>{step.description}</Typography>
                {step.fields}
                <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Button disabled={index === 0} onClick={handleBack} sx={{ color: '#003087' }}>Back</Button>
                  <Button variant="contained" onClick={handleNext} endIcon={<ChevronRight />} sx={{ backgroundColor: '#F28C38', '&:hover': { backgroundColor: '#D8702A' } }}>
                    {index === steps.length - 1 ? 'Proceed to Declaration' : 'Continue'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="#003087">Declaration and Consent</Typography>
            <Alert severity="warning" sx={{ mb: 3, backgroundColor: '#FFF3E0', color: '#F28C38' }}>
              <Typography variant="body2">
                Providing false information or misrepresenting yourself as an election official is a punishable offense under the Indian Penal Code and the Representation of the People Act.
              </Typography>
            </Alert>
            <FormControlLabel
              control={<Checkbox checked={data.declarationConsent} onChange={handleInputChange} name="declarationConsent" sx={{ color: '#003087' }} />}
              label={<Typography variant="body2" color="#808080">I hereby declare that I am a citizen of India, and all information provided by me is true to the best of my knowledge. I understand that I will be required to undergo training and certification before being assigned duties.</Typography>}
            />
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={<Checkbox checked={data.Consent} onChange={handleInputChange} name="Consent" sx={{ color: '#003087' }} />}
                label={<Typography variant="body2" color="#808080">I agree to the Terms and Conditions of the Election Commission of India and consent to background verification as required for this position.</Typography>}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack} sx={{ color: '#003087' }}>Back</Button>
              <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading} sx={{ backgroundColor: '#F28C38', '&:hover': { backgroundColor: '#D8702A' }, minWidth: 150 }}>
                {loading ? <CircularProgress size={24} /> : 'Submit Application'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default OfficialRegistration;