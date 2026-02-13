import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import LogisticianRequestsTable from './LogisticianRequestsTable';
import { LtlShipmentManagementTable } from './LtlShipmentManagementTable'; // Import LtlShipmentManagementTable
import ShipmentTracking from './ShipmentTracking';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const LogisticianDashboard: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Панель управления логиста
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="logistician dashboard tabs">
          <Tab label="Заявки на перевозку" {...a11yProps(0)} />
          <Tab label="Сборные перевозки (LTL)" {...a11yProps(1)} />
          <Tab label="Отслеживание" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <LogisticianRequestsTable />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <LtlShipmentManagementTable />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <ShipmentTracking />
      </CustomTabPanel>
    </Box>
  );
};

export default LogisticianDashboard;
