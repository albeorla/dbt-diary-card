import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>{children}</Box>
    </Container>
  );
};

export default Layout;
