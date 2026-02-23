import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import api from '../../api/api';
import { DateTime } from 'luxon';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationHistory: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notification/my');
      setNotifications(response.data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке уведомлений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notification/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notification/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notification/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          История уведомлений
        </Typography>
        {notifications.some(n => !n.isRead) && (
          <Button startIcon={<MarkEmailReadIcon />} onClick={handleMarkAllRead}>
            Прочитать все
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {notifications.length === 0 ? (
        <Alert severity="info">У вас пока нет уведомлений.</Alert>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <List>
            {notifications.map((n, idx) => (
              <React.Fragment key={n.id}>
                <ListItem
                  sx={{
                    bgcolor: n.isRead ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                  secondaryAction={
                    <Box>
                      {!n.isRead && (
                        <Tooltip title="Прочитано">
                          <IconButton onClick={() => handleMarkAsRead(n.id)}>
                            <MarkEmailReadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Удалить">
                        <IconButton onClick={() => handleDelete(n.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={n.message}
                    secondary={DateTime.fromISO(n.createdAt).toLocaleString(DateTime.DATETIME_MED)}
                    primaryTypographyProps={{
                      fontWeight: n.isRead ? 'normal' : 'bold',
                      variant: 'body1'
                    }}
                  />
                </ListItem>
                {idx < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default NotificationHistory;
