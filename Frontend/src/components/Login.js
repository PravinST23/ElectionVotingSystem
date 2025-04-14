import React, { useState, useEffect, useContext } from 'react';
import { 
  TextField, Button, Container, Typography, Paper, Box, Avatar, 
  InputAdornment, IconButton, CircularProgress, Link, Divider
} from '@mui/material';
import { 
  LockOutlined, Visibility, VisibilityOff, Email, HowToVote 
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin, token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      console.log('Current token:', token);
    }
  }, [token]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const submit = async () => {
    if (!email.trim()) {
      toast.error('Email is required', {
        position: 'top-center',
        icon: '⚠️'
      });
      return;
    }
    if (!password.trim()) {
      toast.error('Password is required', {
        position: 'top-center',
        icon: '⚠️'
      });
      return;
    }

    setLoading(true);
    try {
      await handleLogin(email, password);
      toast.success('Logged in successfully!', {
        position: 'top-center',
        icon: '✅'
      });
      console.log('Token after login:', localStorage.getItem('token'));
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data || 'Login failed due to an unknown error';
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
      submit();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f5f5f5',
          // marginTop:
        }}
      >
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              marginTop: 12,
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
                Digital Voting Platform - Admin Login
              </Typography>

              <Divider sx={{ width: '100%', mb: 3 }} />

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
              
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!password.trim()}
                helperText={!password.trim() ? 'Password is required' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onKeyPress={handleKeyPress}
              />
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={submit}
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
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              
              <Box sx={{ mt: 1, width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <Link href="/forgot" variant="body2" underline="hover" sx={{ color: '#000080' }}>
                  Forgot password?
                </Link>
                <Link href="/voter-register" variant="body2" underline="hover" sx={{ color: '#000080' }}>
                  {"Don't have an account? Register"}
                </Link>
              </Box>
            </Paper>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
              &copy; {new Date().getFullYear()} Election Commission of India. All rights reserved.
            </Typography>
          </Box>
        </Container>

        {/* Footer - based on the blue footer in your image */}
        {/* <Box sx={{ 
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
        </Box> */}
      </Box>
    </ThemeProvider>
  );
}

export default Login;