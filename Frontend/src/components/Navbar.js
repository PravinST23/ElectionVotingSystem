import React, { useState, useContext } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, 
  Menu, MenuItem, Drawer, List, ListItem, ListItemText, 
  ListItemIcon, Divider, Badge, Avatar, Tooltip, useMediaQuery, 
  useTheme, Container
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Person, 
  HowToVote, 
  SupervisorAccount, 
  Logout, 
  Dashboard, 
  AssignmentInd, 
  AddCircle, 
  Group, 
  Gavel, 
  Assessment, 
  Flag, 
  AccountCircle,
  BarChart,
  Settings,
  NotificationsActive,
  Help,
  HomeOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElOfficial, setAnchorElOfficial] = useState(null);
  const [anchorElVoter, setAnchorElVoter] = useState(null);

  // Indian flag colors
  const indianColors = {
    saffron: '#FF9933',
    white: '#FFFFFF',
    green: '#138808',
    navyBlue: '#000080' // Color of the Ashoka Chakra
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenOfficialMenu = (event) => {
    setAnchorElOfficial(event.currentTarget);
  };

  const handleCloseOfficialMenu = () => {
    setAnchorElOfficial(null);
  };

  const handleOpenVoterMenu = (event) => {
    setAnchorElVoter(event.currentTarget);
  };

  const handleCloseVoterMenu = () => {
    setAnchorElVoter(null);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleCloseUserMenu();
    handleCloseOfficialMenu();
    handleCloseVoterMenu();
    setDrawerOpen(false);
    
    // Show toast notification for navigation
    // toast.success(`Navigating to ${path.split('/').pop() || 'Home'}`, {
    //   position: 'top-center',
    //   style: {
    //     borderRadius: '10px',
    //     background: '#333',
    //     color: '#fff',
    //   },
    //   duration: 2000
    // });
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    setDrawerOpen(false);
    navigate('/');
    
    toast.success('Logged out successfully', {
      position: 'top-center',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  // Different menu items based on user role
  const officialMenuItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/official' },
    { label: 'Add Party', icon: <AddCircle />, path: '/official/add-party' },
    { label: 'Register Candidate', icon: <AssignmentInd />, path: '/official/candidate-registration' },
    { label: 'Manage Elections', icon: <Gavel />, path: '/official/election-management' },
    { label: 'Manage Parties', icon: <Group />, path: '/official/party-management' }
  ];

  const voterMenuItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/voter' },
    { label: 'My Profile', icon: <Person />, path: '/voter/profile' },
    // { label: 'View Elections', icon: <HowToVote />, path: '/voter/elections' }
  ];

  const drawerContent = (
    <Box
      sx={{ width: 280 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      {/* Tricolor strip at top of drawer */}
      <Box sx={{ display: 'flex', height: '5px' }}>
        <Box sx={{ flex: 1, bgcolor: indianColors.saffron }}></Box>
        <Box sx={{ flex: 1, bgcolor: indianColors.white, border: '0.5px solid #eee' }}></Box>
        <Box sx={{ flex: 1, bgcolor: indianColors.green }}></Box>
      </Box>
      
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        bgcolor: indianColors.navyBlue, 
        color: 'white'
      }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            mb: 1,
            bgcolor: user ? indianColors.saffron : 'white',
            color: user ? 'white' : indianColors.navyBlue,
            border: `2px solid ${indianColors.white}`
          }}
        >
          {user ? user.firstName?.charAt(0) || 'U' : <AccountCircle fontSize="large" />}
        </Avatar>
        <Typography variant="h6">
          {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
        </Typography>
        {user && (
          <Typography variant="body2" sx={{ 
            bgcolor: user.role === 'Official' ? indianColors.green : indianColors.saffron,
            px: 2,
            py: 0.5,
            borderRadius: '20px',
            mt: 1,
            fontWeight: 'medium'
          }}>
            {user.role}
          </Typography>
        )}
      </Box>
      <Divider />

      {!user ? (
        <List>
          <ListItem button onClick={() => handleNavigate('/')}>
            <ListItemIcon><HomeOutlined sx={{ color: indianColors.navyBlue }} /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button onClick={() => handleNavigate('/login')}>
            <ListItemIcon><Person sx={{ color: indianColors.navyBlue }} /></ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem button onClick={() => handleNavigate('/voter-register')}>
            <ListItemIcon><HowToVote sx={{ color: indianColors.saffron }} /></ListItemIcon>
            <ListItemText primary="Voter Registration" />
          </ListItem>
          <ListItem button onClick={() => handleNavigate('/official-register')}>
            <ListItemIcon><SupervisorAccount sx={{ color: indianColors.green }} /></ListItemIcon>
            <ListItemText primary="Official Registration" />
          </ListItem>
        </List>
      ) : user.role === 'Official' ? (
        <List>
          {officialMenuItems.map((item) => (
            <ListItem button key={item.label} onClick={() => handleNavigate(item.path)}>
              <ListItemIcon sx={{ color: indianColors.green }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
          <Divider />
          <ListItem button onClick={() => handleNavigate('/analytics')}>
            <ListItemIcon><Assessment sx={{ color: indianColors.navyBlue }} /></ListItemIcon>
            <ListItemText primary="Analytics" />
          </ListItem>
          <ListItem button onClick={() => handleNavigate('/help')}>
            <ListItemIcon><Help sx={{ color: indianColors.navyBlue }} /></ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><Logout sx={{ color: '#d32f2f' }} /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <List>
          {voterMenuItems.map((item) => (
            <ListItem button key={item.label} onClick={() => handleNavigate(item.path)}>
              <ListItemIcon sx={{ color: indianColors.saffron }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
          <Divider />
          <ListItem button onClick={() => handleNavigate('/analytics')}>
            <ListItemIcon><Assessment sx={{ color: indianColors.navyBlue }} /></ListItemIcon>
            <ListItemText primary="Analytics" />
          </ListItem>
          <ListItem button onClick={() => handleNavigate('/help')}>
            <ListItemIcon><Help sx={{ color: indianColors.navyBlue }} /></ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><Logout sx={{ color: '#d32f2f' }} /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <AppBar position="static" elevation={3} sx={{ 
      bgcolor: indianColors.navyBlue,
      position: 'relative'
    }}>
      {/* Tricolor strip at top */}
      <Box sx={{ display: 'flex', height: '4px' }}>
        <Box sx={{ flex: 1, bgcolor: indianColors.saffron }}></Box>
        <Box sx={{ flex: 1, bgcolor: indianColors.white }}></Box>
        <Box sx={{ flex: 1, bgcolor: indianColors.green }}></Box>
      </Box>
      
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                mr: 1,
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                }
              }}
              onClick={() => handleNavigate('/')}
            >
              <Flag />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                mr: 2,
                display: { xs: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
              onClick={() => handleNavigate('/')}
            >
              Indian Election System
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              {!user ? (
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    color="inherit" 
                    onClick={() => handleNavigate('/login')}
                    sx={{
                      borderRadius: '4px',
                      textTransform: 'none',
                      px: 2
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={() => handleNavigate('/voter-register')}
                    startIcon={<HowToVote />}
                    sx={{
                      borderRadius: '4px',
                      bgcolor: indianColors.saffron,
                      '&:hover': {
                        bgcolor: '#E58B2D'
                      },
                      textTransform: 'none',
                      px: 2
                    }}
                  >
                    Voter Registration
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={() => handleNavigate('/official-register')}
                    startIcon={<SupervisorAccount />}
                    sx={{
                      borderRadius: '4px',
                      bgcolor: indianColors.green,
                      '&:hover': {
                        bgcolor: '#0D7304'
                      },
                      textTransform: 'none',
                      px: 2
                    }}
                  >
                    Official Registration
                  </Button>
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    color="inherit"
                    onClick={() => handleNavigate(`/${user.role.toLowerCase()}`)}
                    startIcon={<Dashboard />}
                    sx={{
                      borderRadius: '4px',
                      textTransform: 'none',
                      mr: 1
                    }}
                  >
                    Dashboard
                  </Button>

                  {user.role === 'Official' && (
                    <>
                      <Button 
                        color="inherit" 
                        onClick={handleOpenOfficialMenu}
                        endIcon={<MenuIcon />}
                        sx={{
                          borderRadius: '4px',
                          textTransform: 'none',
                          mr: 1,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.2)'
                          }
                        }}
                      >
                        Management
                      </Button>
                      <Menu
                        anchorEl={anchorElOfficial}
                        open={Boolean(anchorElOfficial)}
                        onClose={handleCloseOfficialMenu}
                        sx={{ mt: '45px' }}
                        PaperProps={{
                          elevation: 3,
                          sx: {
                            border: `1px solid ${indianColors.green}`,
                            borderTop: `3px solid ${indianColors.green}`
                          }
                        }}
                      >
                        {officialMenuItems.slice(1).map((item) => (
                          <MenuItem key={item.label} onClick={() => handleNavigate(item.path)}>
                            <ListItemIcon sx={{ color: indianColors.green }}>{item.icon}</ListItemIcon>
                            <Typography textAlign="center">{item.label}</Typography>
                          </MenuItem>
                        ))}
                        <MenuItem onClick={() => handleNavigate('/analytics')}>
                          <ListItemIcon sx={{ color: indianColors.navyBlue }}><Assessment /></ListItemIcon>
                          <Typography textAlign="center">Analytics</Typography>
                        </MenuItem>
                      </Menu>
                    </>
                  )}
  
                  {user.role === 'Voter' && (
                    <>
                      <Button 
                        color="inherit" 
                        onClick={handleOpenVoterMenu}
                        endIcon={<MenuIcon />}
                        sx={{
                          borderRadius: '4px',
                          textTransform: 'none',
                          mr: 1,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.2)'
                          }
                        }}
                      >
                        Voter Options
                      </Button>
                      <Menu
                        anchorEl={anchorElVoter}
                        open={Boolean(anchorElVoter)}
                        onClose={handleCloseVoterMenu}
                        sx={{ mt: '45px' }}
                        PaperProps={{
                          elevation: 3,
                          sx: {
                            border: `1px solid ${indianColors.saffron}`,
                            borderTop: `3px solid ${indianColors.saffron}`
                          }
                        }}
                      >
                        {voterMenuItems.slice(1).map((item) => (
                          <MenuItem key={item.label} onClick={() => handleNavigate(item.path)}>
                            <ListItemIcon sx={{ color: indianColors.saffron }}>{item.icon}</ListItemIcon>
                            <Typography textAlign="center">{item.label}</Typography>
                          </MenuItem>
                        ))}
                        {/* <MenuItem onClick={() => handleNavigate('/analytics')}>
                          <ListItemIcon sx={{ color: indianColors.navyBlue }}><Assessment /></ListItemIcon>
                          <Typography textAlign="center">Analytics</Typography>
                        </MenuItem> */}
                      </Menu>
                    </>
                  )}
                    
                  <Tooltip title="Notifications">
                    <IconButton 
                      color="inherit"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)'
                        },
                        mr: 1
                      }}
                    >
                      <Badge badgeContent={3} color="error">
                        <NotificationsActive />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                    
                  <Tooltip title="Help">
                    <IconButton 
                      color="inherit" 
                      onClick={() => handleNavigate('/help')}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)'
                        },
                        mr: 1
                      }}
                    >
                      <Help />
                    </IconButton>
                  </Tooltip>
                    
                  <Box sx={{ ml: 1 }}>
                    <Tooltip title="User settings">
                      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <Avatar sx={{ 
                          bgcolor: user.role === 'Official' ? indianColors.green : indianColors.saffron,
                          border: `2px solid ${indianColors.white}`
                        }}>
                          {user.firstName?.charAt(0) || 'U'}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      sx={{ mt: '45px' }}
                      anchorEl={anchorElUser}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorElUser)}
                      onClose={handleCloseUserMenu}
                      PaperProps={{
                        elevation: 3,
                        sx: {
                          overflow: 'visible',
                          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.2))',
                          '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                          },
                        },
                      }}
                    >
                      <Box sx={{ px: 2, py: 1, bgcolor: indianColors.navyBlue, color: 'white' }}>
                        <Typography variant="body2">Signed in as</Typography>
                        <Typography variant="subtitle2" fontWeight="bold">{user.email}</Typography>
                      </Box>
                      <Divider />
                      <MenuItem onClick={() => handleNavigate(`/${user.role.toLowerCase()}/profile`)}
                        sx={{ '&:hover': { color: indianColors.navyBlue } }}
                      >
                        <ListItemIcon><Person sx={{ color: indianColors.navyBlue }} /></ListItemIcon>
                        <Typography textAlign="center">Profile</Typography>
                      </MenuItem>
                      <MenuItem onClick={() => handleNavigate(`/${user.role.toLowerCase()}/settings`)}
                        sx={{ '&:hover': { color: indianColors.navyBlue } }}
                      >
                        <ListItemIcon><Settings sx={{ color: indianColors.navyBlue }} /></ListItemIcon>
                        <Typography textAlign="center">Settings</Typography>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout} sx={{ '&:hover': { color: '#d32f2f' } }}>
                        <ListItemIcon><Logout sx={{ color: '#d32f2f' }} /></ListItemIcon>
                        <Typography textAlign="center">Logout</Typography>
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Toolbar>
      </Container>
        
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
}

export default Navbar;