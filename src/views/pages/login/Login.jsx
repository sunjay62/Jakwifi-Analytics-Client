import React, { useState, useEffect, useContext } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
// import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Logo from '../../../../src/assets/images/logotachyon-old.png';
import Logo2 from '../../../../src/assets/images/JakWiFi-logo.png';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import './login.scss';
import useAxiosPrivate from 'hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import UserContext from 'UserContext';
import LoadingScreen from 'views/utilities/loadingscreen/LoadingScreen';
import { toast } from 'react-toastify';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      PT. Remala Abadi 2023 All Right Reserved
      {/* {new Date().getFullYear()} */}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const axiosPrivate = useAxiosPrivate(); // const refresh = useRefreshToken();
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);

      // Use regular axios for login to avoid interceptor interference
      const response = await axiosPrivate.post('admin/login', {
        email,
        password,
        remember
      });

      if (response.data && response.data.access_token) {
        const setTokens = (access_token, refresh_token) => {
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
        };
        setUser(response.data);
        setTokens(response.data.access_token, response.data.refresh_token);
        navigate('/home');
        toast.success('Login Successfully.');
      } else {
        console.log('Invalid response data:', response.data);
        toast.error('Invalid email or password.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Login error:', error);

      if (error.response) {
        const status = error.response.status;
        console.log('Login failed with status:', status);

        if (status === 401 || status === 422) {
          toast.error('Invalid email or password.');
        } else if (status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error('Login failed. Please try again.');
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred.');
      }

      setLoading(false);
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      {loading && <LoadingScreen />}
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1679239108020-aca50acd5f00?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square className="container_Login_Main">
          <Box className="container_Login">
            <div className="logo">
              <img src={Logo2} alt="" className="logo2" />
              <img src={Logo} alt="" className="logo1" />
            </div>
            <Typography component="h1" variant="h5" className="welcomeLogin">
              Hi, Welcome Back
            </Typography>
            <p>Enter your credentials to continue</p>
            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleShowPassword} edge="end">
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <FormControlLabel
                control={<Checkbox value={remember} checked={remember} onChange={(e) => setRemember(e.target.checked)} color="primary" />}
                label="Remember me"
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 1, mb: 2 }}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Grid container>
                {/* <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid> */}
              </Grid>
              <div className="copyRightContainer">
                <Copyright sx={{ mt: 5 }} />
              </div>
            </form>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
