import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Navigation from './Navigation';

const MainLayout = ({ children, mode, toggleMode }) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: (theme) => theme.palette.background.default }}>
      <Header mode={mode} toggleMode={toggleMode} />
      <Navigation />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default MainLayout;

