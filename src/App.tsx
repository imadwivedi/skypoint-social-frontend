import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider
import { store } from './store';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Home from './pages/Home';
import Profile from './pages/Profile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Access the environment variable
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.error(
    'Google Client ID (REACT_APP_GOOGLE_CLIENT_ID) is not defined. ' +
    'Please check your .env file. Google Sign-In will not function.'
  );
  // Optionally, render an error message or prevent the app from fully loading
}

function App() {
  return (
    <Provider store={store}>
      {/* Conditionally render GoogleOAuthProvider only if clientId is available */}
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />

                <Route path="/" element={<Layout />}>
                  <Route
                    index
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/feed"
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/:userId"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                {/* Fallback for any other route, navigate to home or a 404 page */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </ThemeProvider>
        </GoogleOAuthProvider>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          Error: Google Client ID is missing. Application cannot initialize Google Sign-In.
          Please check the console for more details.
        </div>
      )}
    </Provider>
  );
}

export default App;