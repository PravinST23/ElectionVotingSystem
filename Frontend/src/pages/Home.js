import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Paper,
  Divider,
  useTheme
} from '@mui/material';
import { 
  HowToVote, 
  Security, 
  AccountBalance, 
  TouchApp, 
  PhoneAndroid,
  VerifiedUser,
  AssignmentTurnedIn,
  PeopleAlt,
  Flag
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();

  // Indian flag colors
  const indianColors = {
    saffron: '#FF9933',
    white: '#FFFFFF',
    green: '#138808',
    navyBlue: '#000080' // Color of the Ashoka Chakra
  };

  const handleLoginRedirect = (userType) => {
    navigate('/login');
    toast.success(`Redirecting to ${userType} login`, {
      position: 'top-center',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  return (
    <Box sx={{ 
      overflow: 'hidden',
      background: `linear-gradient(180deg, ${indianColors.white} 0%, #f5f5f5 100%)`
    }}>
      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: 'url("https://images.unsplash.com/photo-1652673113758-088dc7e3f132?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          
          zIndex: 1
        }
      }}>
        {/* Tricolor strip at top */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '10px',
          display: 'flex',
          zIndex: 5
        }}>
          <Box sx={{ flex: 1, bgcolor: indianColors.saffron }}></Box>
          <Box sx={{ flex: 1, bgcolor: indianColors.white }}></Box>
          <Box sx={{ flex: 1, bgcolor: indianColors.green }}></Box>
        </Box>
        
        <Container sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Box sx={{ color: 'white' }}>
                <Typography 
                  variant="h2" 
                  fontWeight="700"
                  sx={{ 
                    mb: 2,
                    textShadow: '1px 1px 3px rgba(0,0,0,0.6)'
                  }}
                >
                  भारतीय निर्वाचन प्रणाली
                </Typography>
                <Typography 
                  variant="h3" 
                  fontWeight="700"
                  sx={{ 
                    mb: 3,
                    textShadow: '1px 1px 3px rgba(0,0,0,0.6)'
                  }}
                >
                  Indian Election System
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 4,
                    maxWidth: '600px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.6)'
                  }}
                >
                  A secure, transparent and efficient digital platform empowering India's democratic process
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<HowToVote />}
                    onClick={() => handleLoginRedirect('Voter')}
                    sx={{ 
                      bgcolor: indianColors.saffron,
                      '&:hover': {
                        bgcolor: '#E58B2D'
                      },
                      fontWeight: 'bold',
                      px: 4
                    }}
                  >
                    Voter Login
                  </Button>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<AccountBalance />}
                    onClick={() => handleLoginRedirect('Official')}
                    sx={{ 
                      bgcolor: indianColors.green,
                      '&:hover': {
                        bgcolor: '#0D7304'
                      },
                      fontWeight: 'bold',
                      px: 4
                    }}
                  >
                    Official Login
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={10} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}>
              <Box 
                component="img"
                src="https://www.voteindia.com/wp-content/uploads/Ladakh-Lok-Sabha-Election.jpg"
                alt="Election Commission of India"
                sx={{ 
                  maxHeight: '300px',
                  width:'500px',
                  filter: 'drop-shadow(0px 0px 10px rgba(255,255,255,0.5))'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            <Box component="span" sx={{ color: indianColors.navyBlue }}>Digital Democracy</Box> in Action
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
            Our platform combines cutting-edge technology with rigorous security to enable seamless election management
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            { 
              icon: <Security fontSize="large" sx={{ color: indianColors.navyBlue }} />, 
              title: 'Bank-Level Security', 
              description: 'End-to-end encryption and blockchain verification for maximum data protection' 
            },
            { 
              icon: <VerifiedUser fontSize="large" sx={{ color: indianColors.navyBlue }} />, 
              title: 'Aadhaar Verification', 
              description: 'Biometric authentication ensures one person, one vote integrity' 
            },
            { 
              icon: <TouchApp fontSize="large" sx={{ color: indianColors.navyBlue }} />, 
              title: 'User-Friendly Interface', 
              description: 'Simple and accessible voting experience for citizens of all backgrounds' 
            },
            { 
              icon: <PhoneAndroid fontSize="large" sx={{ color: indianColors.navyBlue }} />, 
              title: 'Mobile Compatibility', 
              description: 'Vote and track elections from any device, anywhere in India' 
            },
            { 
              icon: <AssignmentTurnedIn fontSize="large" sx={{ color: indianColors.navyBlue }} />, 
              title: 'Real-Time Results', 
              description: 'Instant counting and transparent reporting of election outcomes' 
            },
            { 
              icon: <PeopleAlt fontSize="large" sx={{ color: indianColors.navyBlue }} />, 
              title: 'Multi-Level Elections', 
              description: 'Support for national, state, and local election management' 
            }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                height: '100%', 
                borderTop: `4px solid ${index % 3 === 0 ? indianColors.saffron : index % 3 === 1 ? indianColors.white : indianColors.green}`,
                borderRadius: '8px',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Statistics Card */}
      <Box sx={{ bgcolor: indianColors.navyBlue, color: 'white', py: 6 }}>
        <Container>
          <Grid container spacing={3} justifyContent="center">
            {[
              { number: '900M+', label: 'Eligible Voters' },
              { number: '543', label: 'Parliamentary Constituencies' },
              { number: '4,120', label: 'Assembly Constituencies' },
              { number: '1.1M+', label: 'Polling Stations' }
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index} sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {stat.number}
                </Typography>
                <Typography variant="body1">
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Container sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
            Our state-of-the-art election management system simplifies the voting process
          </Typography>
        </Box>

        <Grid container spacing={5}>
          {[
            { 
              step: '01', 
              title: 'Register', 
              description: 'Create your voter account using Aadhaar verification',
              color: indianColors.saffron
            },
            { 
              step: '02', 
              title: 'Authentication', 
              description: 'Verify your identity using OTP or biometric confirmation',
              color: indianColors.white,
              border: '1px solid #ccc'
            },
            { 
              step: '03', 
              title: 'Cast Vote', 
              description: 'Select your candidate and submit your secure ballot',
              color: indianColors.green
            },
            { 
              step: '04', 
              title: 'Confirmation', 
              description: 'Receive your encrypted digital receipt as proof of voting',
              color: indianColors.navyBlue
            }
          ].map((step, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Box sx={{ 
                p: 3, 
                borderRadius: '8px',
                height: '100%',
                bgcolor: step.color,
                color: step.color === indianColors.white ? 'text.primary' : 'white',
                border: step.border || 'none',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0px 4px 15px rgba(0,0,0,0.1)'
              }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    position: 'absolute', 
                    bottom: '-20px', 
                    right: '-10px', 
                    opacity: 0.2, 
                    fontWeight: 900 
                  }}
                >
                  {step.step}
                </Typography>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {step.title}
                </Typography>
                <Typography variant="body1">
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Register Now Section */}
      <Box sx={{ 
        bgcolor: '#f5f5f5', 
        py: 8,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("/assets/india-map-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <Container>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Ready to Participate in India's Democracy?
              </Typography>
              <Typography variant="body1" paragraph>
                Register now to join millions of Indians in the world's largest democratic exercise.
                Our secure platform ensures your vote counts in shaping the future of our nation.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/voter-register')}
                  sx={{ 
                    bgcolor: indianColors.navyBlue,
                    '&:hover': {
                      bgcolor: '#00005c'
                    },
                    px: 4
                  }}
                >
                  Register as Voter
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/learn-more')}
                  sx={{ 
                    borderColor: indianColors.navyBlue,
                    color: indianColors.navyBlue,
                    px: 4
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            {/* <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box 
                component="img"
                src="https://th.bing.com/th/id/OIP.rJzCD1llcGyB5gUrx-1_oAHaHa?rs=1&pid=ImgDetMain"
                alt="Vote India"
                sx={{ 
                  maxWidth: '100%',
                  maxHeight: '250px'
                }}
              />
            </Grid> */}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#212121', color: 'white', pt: 6, pb: 4 }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Flag sx={{ mr: 1, color: indianColors.saffron }} />
                <Typography variant="h6" fontWeight="bold">
                  Indian Election System
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                An initiative of the Election Commission of India to modernize and streamline the electoral process.
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                '& > a': { 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }
                }
              }}>
                {/* Social Media Icons would go here */}
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Quick Links
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {['Home', 'About Us', 'Elections', 'Results', 'FAQ'].map((item, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      component="a" 
                      href="#" 
                      sx={{ 
                        color: 'inherit', 
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Resources
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {['Voter Guide', 'Electoral Roll', 'Constituencies', 'Political Parties', 'Contact Us'].map((item, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      component="a" 
                      href="#" 
                      sx={{ 
                        color: 'inherit', 
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Contact Information
              </Typography>
              <Typography variant="body2" paragraph>
                Election Commission of India
                <br />
                Nirvachan Sadan, Ashoka Road
                <br />
                New Delhi - 110001
              </Typography>
              <Typography variant="body2">
                Toll Free: 1800-111-950
                <br />
                Email: support@indianelection.gov.in
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © 2025 Indian Election System. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Typography 
                variant="body2" 
                component="a" 
                href="#" 
                sx={{ 
                  color: 'inherit', 
                  opacity: 0.7,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Privacy Policy
              </Typography>
              <Typography 
                variant="body2" 
                component="a" 
                href="#" 
                sx={{ 
                  color: 'inherit', 
                  opacity: 0.7,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Terms of Service
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;