import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import api from '../api/api'; // Change to default import
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntity?: string;
  relatedEntityId?: string;
}

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Notification[]>('/notification/my');
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.isRead).length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось загрузить уведомления.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [user]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notification/${id}/read`);
      fetchNotifications(); // Refresh
    } catch (err) {
      setError('Не удалось пометить уведомление как прочитанное.');
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notification/mark-all-read');
      fetchNotifications(); // Refresh
    } catch (err) {
      setError('Не удалось пометить все уведомления как прочитанные.');
      console.error(err);
    }
  };

  return (
    <Box>
      <IconButton
        color="inherit"
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'notifications-button',
        }}
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
            width: '300px',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
          <Typography variant="h6">Уведомления</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Прочитать все
            </Button>
          )}
        </Box>
        <Divider />
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} /> Загрузка...
          </MenuItem>
        ) : error ? (
          <MenuItem disabled>
            <Alert severity="error">{error}</Alert>
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem disabled>Нет новых уведомлений</MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              sx={{
                whiteSpace: 'normal',
                backgroundColor: notification.isRead ? 'inherit' : 'action.selected',
              }}
            >
              <Box>
                <Typography variant="body2">{notification.message}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {moment(notification.createdAt).fromNow()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
};
