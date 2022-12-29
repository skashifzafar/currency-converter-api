import React from 'react';
import {useState, useEffect, useCallback, forwardRef} from 'react';
import {
  Avatar,
  Box,
  Button,
  TextField,
  Link,
  Typography,
  Container,
  CssBaseline,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import {useNavigate} from 'react-router-dom';
import TopBar from '../appBar';
import {TokenContext} from '../contexts';
import {useContext} from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import axios from 'axios';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const LoginButton = ({loggedIn, onClick, buttonText}) => {
  return (
    <Button
      variant={loggedIn? 'contained': 'outlined'}
      onClick={onClick}>{buttonText}
    </Button>
  );
};

export const TopBarLogoutButton = ({children}) => {
  const token = useContext(TokenContext);

  const handleLogout = () => {
    token.setToken('');
    localStorage.removeItem('token');
  };

  return (
    <>
      <TopBar
        loginButton={<LoginButton loggedIn={token.token}
          onClick={handleLogout}
          buttonText="Log Out" />}/>
      {children}
    </>
  );
};

const theme = createTheme();

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center" {...props}>
      <Link color="inherit" href="https://github.com/s-raza/currency-converter-api/">
        GitHub
      </Link>
    </Typography>
  );
}

export const LoginPage = ({navigateTo}) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState(
      {
        openSnackbar: false,
        msgSnackbar: '',
        vertical: 'bottom',
        horizontal: 'left',
      },
  );
  const {vertical, horizontal, openSnackbar, msgSnackbar} = snackbar;
  const token = useContext(TokenContext);

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, openSnackbar: false});
  };

  const handleUsername = (event) => {
    event.preventDefault();
    setUsername(event.target.value);
  };

  const handlePassword = (event) => {
    event.preventDefault();
    setPassword(event.target.value);
  };

  const handleLogin = async (event) => {
    if (event) {
      event.preventDefault();
    }

    const data = {
      client_id: '',
      client_secret: '',
      grant_type: '',
      scopes: '',
      username: username,
      password: password,
    };

    const urlEncoded = new URLSearchParams(data);

    const headers = {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const getToken = async () => {
      await axios
          .post('http://localhost:8080/token', urlEncoded, {headers: headers})
          .then((response) => {
            token.setToken(response.data.access_token);
          })
          .catch((error) => {
            console.log(error.toJSON());
            let msg = '';
            if (error.response) {
              const {status} = error.response;

              if (status === 401) {
                msg = 'Incorrect Username or Password';
              } else {
                msg = `${error.code}: ${error.message}`;
              }
            }
            setSnackbar(
                {...snackbar,
                  openSnackbar: true,
                  msgSnackbar: msg,
                },
            );
            token.setToken('');
          });
    };

    await getToken();
  };

  const updateOnLogin = useCallback(
      () => {
        if (token.token !== '') {
          localStorage.setItem('token', token.token);
          return navigate(navigateTo);
        }
      }, [token, navigate, navigateTo]);

  useEffect(updateOnLogin, [token, updateOnLogin]);

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleLogin}
            noValidate={false}
            sx={{mt: 1}}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={username}
              onChange={handleUsername}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={handlePassword}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{mt: 3, mb: 2}}
            >
              Sign In
            </Button>
          </Box>
        </Box>
        <Copyright sx={{mt: 8, mb: 4}} />
        <Snackbar
          autoHideDuration={6000}
          anchorOrigin={{vertical, horizontal}}
          open={openSnackbar}
          onClose={handleSnackbarClose}
          key={vertical + horizontal}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="error"
            sx={{width: '100%'}}>
            {msgSnackbar}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};
