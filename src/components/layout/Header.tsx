import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Box,
    Chip,
} from '@mui/material';
import {
    AccountCircle,
    Logout as LogoutIcon,
    Home as HomeIcon,
    AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { generateAvatarUrl, getUserDisplayName } from 'utils/helpers';
import LogoutDialog from '../auth/LogoutDialog';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        setLogoutDialogOpen(true);
    };

    const handleProfile = () => {
        handleClose();
        navigate('/profile');
    };

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
            >
                <Toolbar>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexGrow: 1,
                            cursor: 'pointer',
                            '&:hover': {
                                '& .logo-icon': {
                                    transform: 'rotate(180deg)',
                                }
                            }
                        }}
                        onClick={() => navigate('/')}
                    >
                        <AutoAwesomeIcon
                            className="logo-icon"
                            sx={{
                                mr: 1,
                                fontSize: 28,
                                transition: 'transform 0.5s ease',
                            }}
                        />
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(45deg, #FFF 30%, #FFD700 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            SkyPoint Social
                        </Typography>
                    </Box>

                    {isAuthenticated ? (
                        <>
                            <Chip
                                avatar={
                                    <Avatar
                                        src={user?.avatar || generateAvatarUrl(getUserDisplayName(user!))}
                                        alt={getUserDisplayName(user!)}
                                        sx={{ width: 24, height: 24 }}
                                    />
                                }
                                label={getUserDisplayName(user!)}
                                onClick={handleMenu}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    fontWeight: 600,
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.3)',
                                    }
                                }}
                            />
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                PaperProps={{
                                    sx: {
                                        mt: 1,
                                        borderRadius: 2,
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    }
                                }}
                            >
                                <MenuItem
                                    onClick={() => { handleClose(); navigate('/'); }}
                                    sx={{ fontWeight: 600 }}
                                >
                                    <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    Home
                                </MenuItem>
                                <MenuItem
                                    onClick={handleProfile}
                                    sx={{ fontWeight: 600 }}
                                >
                                    <AccountCircle sx={{ mr: 1, color: 'primary.main' }} />
                                    Profile
                                </MenuItem>
                                <MenuItem
                                    onClick={handleLogout}
                                    sx={{ fontWeight: 600 }}
                                >
                                    <LogoutIcon sx={{ mr: 1, color: 'error.main' }} />
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                onClick={() => navigate('/login')}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    '&:hover': {
                                        borderColor: 'white',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                    }
                                }}
                                variant="outlined"
                            >
                                Login
                            </Button>
                            <Button
                                onClick={() => navigate('/register')}
                                variant="contained"
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                    }
                                }}
                            >
                                Sign Up
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* Add the LogoutDialog component */}
            <LogoutDialog
                open={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
            />
        </>
    );
};

export default Header;