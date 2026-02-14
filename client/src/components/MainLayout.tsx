import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
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
  Avatar,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { NotificationBell } from './NotificationBell';

const drawerWidth = 260;

const MainLayout: React.FC = () => {
  const { user, logout, isAdmin, isLogistician, isClient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      text: isClient ? 'Личный кабинет' : 'Панель управления',
      icon: isClient ? <PeopleIcon /> : <DashboardIcon />,
      path: isAdmin ? '/admin' : isLogistician ? '/logistician/dashboard' : '/client/profile',
      show: true,
    },
    {
      text: 'Мои заявки',
      icon: <AssignmentIcon />,
      path: '/client/requests',
      show: isClient,
    },
    {
      text: 'Отслеживание',
      icon: <LocalShippingIcon />,
      path: '/client/tracking',
      show: isClient,
    },
    {
      text: 'Финансы',
      icon: <BarChartIcon />,
      path: '/client/financials',
      show: isClient,
    },
    {
      text: 'Аналитика',
      icon: <BarChartIcon />,
      path: '/client/analytics',
      show: isClient,
    },
    {
      text: 'Уведомления',
      icon: <AssignmentIcon />, // Or a notification icon
      path: '/client/notifications',
      show: isClient,
    },
    {
      text: 'Перевозки',
      icon: <LocalShippingIcon />,
      path: '/logistician/shipments',
      show: isLogistician || isAdmin,
    },
    {
      text: 'Сборные грузы (LTL)',
      icon: <AssignmentIcon />,
      path: '/logistician/ltl',
      show: isLogistician || isAdmin,
    },
    {
      text: 'Пользователи',
      icon: <PeopleIcon />,
      path: '/admin/users',
      show: isAdmin,
    },
    {
      text: 'Отчеты',
      icon: <BarChartIcon />,
      path: '/reports',
      show: isAdmin || isLogistician,
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
            AXIS Logistics
          </Typography>

          <NotificationBell />

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
              {user?.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2 }}>
              <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>
                {user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Выйти
            </Button>
          </Box>
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
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List sx={{ px: 2 }}>
            {navItems.filter(item => item.show).map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: location.pathname === item.path ? 'bold' : 'medium' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {isAdmin && (
            <>
              <Divider sx={{ my: 2, mx: 3 }} />
              <Typography variant="caption" sx={{ px: 4, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 'bold' }}>
                АДМИНИСТРИРОВАНИЕ
              </Typography>
              <List sx={{ px: 2 }}>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton component={Link} to="/admin/settings" sx={{ borderRadius: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}><SettingsIcon /></ListItemIcon>
                    <ListItemText primary="Настройки" primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItemButton>
                </ListItem>
              </List>
            </>
          )}
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          backgroundColor: (theme) => theme.palette.grey[50],
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
