import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ClientRequestsTable from './ClientRequestsTable';
import CreateRequestForm from './CreateRequestForm';
import AddIcon from '@mui/icons-material/Add';

const ClientDashboard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Мои заявки
        </Typography>
        {!showForm && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            sx={{ px: 3, py: 1 }}
          >
            Создать заявку
          </Button>
        )}
      </Box>

      {showForm ? (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <CreateRequestForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </Paper>
      ) : (
        <ClientRequestsTable />
      )}
    </Box>
  );
};

export default ClientDashboard;
