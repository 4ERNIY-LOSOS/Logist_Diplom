import React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { UserManagementTable } from './UserManagementTable';
import { CompanyManagementTable } from './CompanyManagementTable';
import { TariffManagementTable } from './TariffManagementTable';
import { DriverManagementTable } from './DriverManagementTable';
import { VehicleManagementTable } from './VehicleManagementTable';

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

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Панель администратора
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="admin dashboard tabs">
          <Tab label="Пользователи" {...a11yProps(0)} />
          <Tab label="Компании" {...a11yProps(1)} />
          <Tab label="Тарифы" {...a11yProps(2)} />
          <Tab label="Водители" {...a11yProps(3)} />
          <Tab label="Транспорт" {...a11yProps(4)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <UserManagementTable />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <CompanyManagementTable />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <TariffManagementTable />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <DriverManagementTable />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        <VehicleManagementTable />
      </CustomTabPanel>
    </Box>
  );
};
