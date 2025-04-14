import React, { useState } from 'react';
import { 
  TextField, Button, Container, Typography, Paper, Box, Avatar, 
  InputAdornment, CircularProgress, Link, Divider
} from '@mui/material';
import { 
  LockReset, Email, HowToVote, ArrowBack 
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme to match your website colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#000080', // Dark blue from your website header
    },
    secondary: {
      main: '#FF9933', // Orange from Indian flag
    },
    success: {
      main: '#138808', // Green from Indian flag
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#FF9933', // Orange button like in your website
          '&:hover': {
            backgroundColor: '#e58a2e',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000080', // Dark blue avatar background
        },
      },
    },
  },
});

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error('Email is required', {
        position: 'top-center',
        icon: '⚠️'
      });
      return;
    }

    setLoading(true);
    try {
      // Replace with your actual password reset API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating API call
      
      setResetSent(true);
      toast.success('Password reset instructions sent to your email', {
        position: 'top-center',
        icon: '✉️'
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data || 'Password reset request failed';
      toast.error(errorMessage, {
        position: 'top-center',
        icon: '❌'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Paper
              elevation={3}
              sx={{
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: '#000080', width: 56, height: 56 }}>
                <HowToVote fontSize="large" />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
                Election Commission of India
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Digital Voting Platform - Password Reset
              </Typography>

              <Divider sx={{ width: '100%', mb: 3 }} />

              {!resetSent ? (
                <>
                  <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                    Enter your email address and we'll send you instructions to reset your password.
                  </Typography>
                  
                  <TextField
                    label="Email Address"
                    type="email"
                    required
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!email.trim()}
                    helperText={!email.trim() ? 'Email is required' : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    onKeyPress={handleKeyPress}
                  />
                  
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ 
                      mt: 3, 
                      mb: 2, 
                      py: 1.5,
                      bgcolor: '#FF9933',
                      '&:hover': {
                        bgcolor: '#e58a2e',
                      },
                    }}
                    startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <LockReset />}
                  >
                    {loading ? 'Sending...' : 'Reset Password'}
                  </Button>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#138808' }}>
                    Email Sent Successfully!
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Please check your email inbox for instructions to reset your password. The link will expire in 30 minutes.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setResetSent(false)}
                    sx={{ 
                      mb: 2,
                      borderColor: '#FF9933',
                      color: '#FF9933',
                      '&:hover': {
                        borderColor: '#e58a2e',
                        backgroundColor: 'rgba(255, 153, 51, 0.04)',
                      }
                    }}
                  >
                    Try another email
                  </Button>
                </Box>
              )}
              
              <Box sx={{ mt: 1, width: '100%' }}>
                <Link 
                  href="/login" 
                  variant="body2" 
                  underline="hover"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000080'
                  }}
                >
                  <ArrowBack fontSize="small" sx={{ mr: 0.5 }} />
                  Back to Login
                </Link>
              </Box>
            </Paper>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
              &copy; {new Date().getFullYear()} Election Commission of India. All rights reserved.
            </Typography>
          </Box>
        </Container>

        {/* Footer - based on the blue footer in your image */}
        <Box sx={{ 
          width: '100%', 
          bgcolor: '#000080', 
          color: 'white',
          p: 2,
          mt: 'auto', // Push to bottom
          textAlign: 'center'
        }}>
          <Typography variant="body2">
            © Election Commission of India. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default ForgotPassword;