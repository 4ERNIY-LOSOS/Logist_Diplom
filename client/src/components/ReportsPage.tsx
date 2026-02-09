import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReportsPage: React.FC = () => {
  return (
    <Box component={Paper} sx={{ p: 4, my: 2 }}>
      <Typography variant="h5" gutterBottom>
        Страница отчетов
      </Typography>
      <Typography variant="body1">
        Здесь будет реализована функциональность отчетов и аналитики.
      </Typography>
      {/* TODO: Add actual reporting components */}
    </Box>
  );
};

export default ReportsPage;
