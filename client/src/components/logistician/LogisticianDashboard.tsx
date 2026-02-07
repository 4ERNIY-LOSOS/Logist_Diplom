import React from 'react';
import LogisticianRequestsTable from './LogisticianRequestsTable';
import { Box, Typography } from '@mui/material';

const LogisticianDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель управления логиста
      </Typography>
      <LogisticianRequestsTable />
    </Box>
  );
};

export default LogisticianDashboard;
