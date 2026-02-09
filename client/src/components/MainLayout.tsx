import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart'; // For Reports
import SettingsIcon from '@mui/icons-material/Settings'; // For Tariffs (Admin)
import { NotificationBell } from './NotificationBell'; // Import NotificationBell

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = {
    ADMIN: [
      { text: 'Панель управления', icon: <DashboardIcon />, path: '/admin' }, // Point to new admin dashboard
      { text: 'Отчеты', icon: <BarChartIcon />, path: '/reports' }, // Placeholder for reports
    ],
    LOGISTICIAN: [
      { text: 'Панель управления', icon: <DashboardIcon />, path: '/logistician/dashboard' },
      { text: 'Перевозки', icon: <LocalShippingIcon />, path: '/logistician/shipments' }, // Assuming shipments list
      { text: 'Отчеты', icon: <BarChartIcon />, path: '/reports' }, // Placeholder for reports
    ],
    CLIENT: [
      { text: 'Панель управления', icon: <DashboardIcon />, path: '/client/dashboard' },
      { text: 'Мои заявки', icon: <AssignmentIcon />, path: '/client/requests' },
    ],
  };

  const userRole = user?.role as keyof typeof navItems | undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Логистика
          </Typography>
          <NotificationBell /> {/* Integrate NotificationBell here */}
          <Typography sx={{ mr: 2 }}>
            Добро пожаловать, {user?.username} ({user?.role})
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {userRole &&
              navItems[userRole]?.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton component={Link} to={item.path}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: (theme) => theme.palette.background.default,
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Outlet /> {/* Render child routes here */}
      </Box>
    </Box>
  );
};

export default MainLayout;
