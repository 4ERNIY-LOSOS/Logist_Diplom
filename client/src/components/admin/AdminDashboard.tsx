import React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { UserManagementTable } from './UserManagementTable';
import { CompanyManagementTable } from './CompanyManagementTable';
import { TariffManagementTable } from './TariffManagementTable'; // Import the new TariffManagementTable

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

export const AdminDashboard: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Панель администратора
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="admin dashboard tabs">
          <Tab label="Управление пользователями" {...a11yProps(0)} />
          <Tab label="Управление компаниями" {...a11yProps(1)} />
          <Tab label="Управление тарифами" {...a11yProps(2)} /> {/* New tab */}
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <UserManagementTable />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <CompanyManagementTable />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}> {/* New tab panel */}
        <TariffManagementTable />
      </CustomTabPanel>
    </Box>
  );
};
