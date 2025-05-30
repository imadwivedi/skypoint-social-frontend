import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = () => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Outlet />
            </Container>
        </Box>
    );
};

export default Layout;