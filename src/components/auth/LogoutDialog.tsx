import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { logout } from 'store/authSlice';
import { useLogoutMutation } from 'services/api';

interface LogoutDialogProps {
    open: boolean;
    onClose: () => void;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({ open, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [logoutApi, { isLoading }] = useLogoutMutation();
    const [error, setError] = useState<string>('');
    const [sessionSummary, setSessionSummary] = useState<string>('');

    const handleLogout = async () => {
        try {
            // Call logout API
            const response = await logoutApi().unwrap();

            // Parse session duration
            let sessionMessage = 'Thanks for using SkyPoint Social!';
            if (response.sessionDuration) {
                // Parse TimeSpan format: "HH:mm:ss.fffffff"
                const parts = response.sessionDuration.split(':');
                if (parts.length >= 3) {
                    const hours = parseInt(parts[0]) || 0;
                    const minutes = parseInt(parts[1]) || 0;
                    const seconds = Math.floor(parseFloat(parts[2]));

                    if (hours > 0) {
                        sessionMessage = `Thanks for spending ${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''} with us!`;
                    } else if (minutes > 0) {
                        sessionMessage = `Thanks for spending ${minutes} minute${minutes !== 1 ? 's' : ''} with us!`;
                    } else {
                        sessionMessage = `Thanks for spending ${seconds} second${seconds !== 1 ? 's' : ''} with us!`;
                    }
                }
            }

            // Show session summary
            setSessionSummary(sessionMessage);

            // Wait a bit to show the message
            setTimeout(() => {
                dispatch(logout());
                onClose();
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            console.error('Logout error:', err);
            setError(err.data?.message || 'Failed to logout. Please try again.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                {sessionSummary ? 'Session Summary' : 'Confirm Logout'}
            </DialogTitle>
            <DialogContent>
                {sessionSummary ? (
                    <>
                        <Typography variant="h6" gutterBottom color="primary">
                            {sessionSummary}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Redirecting to login page...
                        </Typography>
                    </>
                ) : (
                    <Typography>
                        Are you sure you want to logout?
                    </Typography>
                )}
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>
            {!sessionSummary && (
                <DialogActions>
                    <Button onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleLogout}
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                Logging out...
                            </>
                        ) : (
                            'Logout'
                        )}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default LogoutDialog;