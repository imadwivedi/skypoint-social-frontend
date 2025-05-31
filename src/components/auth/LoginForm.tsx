import React, { useState, useEffect } from 'react'; // Added useEffect
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Divider,
    CircularProgress,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useLoginMutation, useOauthLoginMutation } from 'services/api';
import { useAppDispatch } from 'hooks';
import { setCredentials } from 'store/authSlice';
import { isValidEmail } from 'utils/helpers';
import { User, OAuthLoginRequest } from 'types';
import { useAuth } from 'hooks';

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { token: authToken, user: authUser } = useAuth(); // Get auth token and user

    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [oauthLogin, { isLoading: isOauthLoading }] = useOauthLoginMutation();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [apiError, setApiError] = useState<string>('');

    // Redirect if already logged in
    useEffect(() => {
        if (authToken && authUser) { // Check for both token and user object as a robust check
            navigate('/', { replace: true });
        }
    }, [authToken, authUser, navigate]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (apiError) {
            setApiError('');
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const result = await login(formData).unwrap();
            if (result) {
                dispatch(setCredentials({ user: result.user, token: result.token }));
                if (result.sessionId) localStorage.setItem('sessionId', result.sessionId);
                if (result.token) localStorage.setItem('token', result.token);
                sessionStorage.setItem('sessionStartTime', Date.now().toString());
            }
            navigate('/');
        } catch (error: any) {
            const errorMessage = error.data?.message || error.data?.error || error.data?.errors?.[0]?.description || error.data?.title || error.message || 'Login failed. Please check your credentials and try again.';
            setApiError(errorMessage);
        }
    };

    const handleGoogleSignInResponse = async (credentialResponse: CredentialResponse) => {
        const idToken = credentialResponse.credential;

        if (!idToken) {
            setApiError('Google Sign-In failed to retrieve ID token.');
            return;
        }

        try {
            const oauthPayload: OAuthLoginRequest = {
                accessToken: idToken,
                provider: 'Google',
            };
            const result = await oauthLogin(oauthPayload).unwrap();

            if (result) {
                dispatch(setCredentials({ user: result.user, token: result.token }));
                if (result.sessionId) localStorage.setItem('sessionId', result.sessionId);
                if (result.token) localStorage.setItem('token', result.token);
                sessionStorage.setItem('sessionStartTime', Date.now().toString());
            }
            navigate('/');
        } catch (error: any) {
            console.error('Google OAuth login error with backend:', error);
            const errorMessage = error.data?.message || error.data?.error || error.data?.errors?.[0]?.description || error.data?.title || error.message || 'Google Sign-In failed. Please try again.';
            setApiError(errorMessage);
        }
    };

    const handleGoogleSignInError = () => {
        console.error('Google Sign-In Failed');
        setApiError('Google Sign-In failed. Please try again.');
    };

    if (authToken && authUser) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f5f5f5',
                px: 2,
            }}
        >
            <Card sx={{ maxWidth: 400, width: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                        Sign In
                    </Typography>

                    {apiError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {apiError}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            margin="normal"
                            autoComplete="email"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            margin="normal"
                            autoComplete="current-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                            disabled={isLoginLoading || isOauthLoading}
                        >
                            {isLoginLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>

                        <Divider sx={{ my: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                OR
                            </Typography>
                        </Divider>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'relative' }}>
                            {isOauthLoading && (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px',
                                        marginLeft: '-12px',
                                        zIndex: 1,
                                    }}
                                />
                            )}
                            <GoogleLogin
                                onSuccess={handleGoogleSignInResponse}
                                onError={handleGoogleSignInError}
                                useOneTap
                                theme="outline"
                                size="large"
                                shape="rectangular"
                                width="330px"
                            />
                        </Box>

                        <Typography variant="body2" textAlign="center">
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginForm;