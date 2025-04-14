import React, { useState, useContext } from 'react';
import { TextField, Button, Container, Typography, MenuItem, Paper, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { register } from '../services/api';

function Register() {
  const [data, setData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'Voter',
    NationalID: ''
  });
  const { handleRegister } = useContext(AuthContext);

  const submit = async () => {
    console.log('Register payload:', data);
    if (!data.username.trim()) {
      toast.error('Username is required', { position: 'top-center', icon: '⚠️' });
      return;
    }
    if (!data.password.trim()) {
      toast.error('Password is required', { position: 'top-center', icon: '⚠️' });
      return;
    }
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      toast.error('Valid email is required', { position: 'top-center', icon: '⚠️' });
      return;
    }
    if (!data.NationalID.trim()) {
      toast.error('National ID is required', { position: 'top-center', icon: '⚠️' });
      return;
    }

    try {
      const response = await register(data); // Use the updated API function
      console.log('Register response:', response);
      if (handleRegister) {
        await handleRegister(data); // Call AuthContext handler if defined
      }
      toast.success('Registered successfully! Please log in.', { position: 'top-center', icon: '✅' });
      setData({ username: '', password: '', email: '', role: 'Voter', NationalID: '' });
    } catch (error) {
      console.error('Register error:', error.response ? error.response.data : error);
      toast.error(error.response?.data?.error || error.message || 'Registration failed', {
        position: 'top-center',
        icon: '❌'
      });
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Paper elevation={3} style={{ padding: '24px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
        <Typography variant="h4" style={{ fontWeight: 600, color: '#1a237e', marginBottom: '16px', textAlign: 'center' }}>
          Register
        </Typography>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField
            label="Username"
            fullWidth
            value={data.username}
            onChange={(e) => setData({ ...data, username: e.target.value })}
            error={!data.username.trim()}
            helperText={!data.username.trim() ? 'Username is required' : ''}
            style={{ marginBottom: '8px' }}
            InputLabelProps={{ style: { color: '#455a64' } }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            error={!data.password.trim()}
            helperText={!data.password.trim() ? 'Password is required' : ''}
            style={{ marginBottom: '8px' }}
            InputLabelProps={{ style: { color: '#455a64' } }}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            error={!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)}
            helperText={
              !data.email.trim()
                ? 'Email is required'
                : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
                ? 'Invalid email format'
                : ''
            }
            style={{ marginBottom: '8px' }}
            InputLabelProps={{ style: { color: '#455a64' } }}
          />
          <TextField
            label="National ID"
            fullWidth
            value={data.NationalID}
            onChange={(e) => setData({ ...data, NationalID: e.target.value })}
            error={!data.NationalID.trim()}
            helperText={!data.NationalID.trim() ? 'National ID is required' : ''}
            style={{ marginBottom: '8px' }}
            InputLabelProps={{ style: { color: '#455a64' } }}
          />
          <TextField
            select
            label="Role"
            fullWidth
            value={data.role}
            onChange={(e) => setData({ ...data, role: e.target.value })}
            style={{ marginBottom: '16px' }}
            InputLabelProps={{ style: { color: '#455a64' } }}
          >
            <MenuItem value="Voter">Voter</MenuItem>
            <MenuItem value="Official">Official</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </TextField>
          <Button
            variant="contained"
            color="primary"
            onClick={submit}
            style={{ textTransform: 'none', padding: '10px 0', fontWeight: 600 }}
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;