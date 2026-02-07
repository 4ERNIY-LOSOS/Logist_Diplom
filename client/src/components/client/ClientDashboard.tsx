import React, { useState } from 'react';
import CreateRequestForm from './CreateRequestForm';
import ClientRequestsTable from './ClientRequestsTable';
import { Box, Button, Collapse, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const ClientDashboard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    // Potentially refresh the table or show a global notification
    setShowForm(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Панель управления клиента</Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Отмена' : 'Новая заявка'}
        </Button>
      </Box>
      
      <Collapse in={showForm}>
        {/* Pass a success handler to the form to close it on success */}
        <CreateRequestForm onSuccess={handleSuccess} />
      </Collapse>

      <ClientRequestsTable />
    </Box>
  );
};

export default ClientDashboard;
