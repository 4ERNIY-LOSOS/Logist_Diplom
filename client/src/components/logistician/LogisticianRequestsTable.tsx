import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import type { LogisticRequest } from '../../types';
import { requestService } from '../../services/request.service';
import { DateTime } from 'luxon';

const LogisticianRequestsTable: React.FC = () => {
  const [requests, setRequests] = useState<LogisticRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await requestService.getAll();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке заявок');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Новая': return 'info';
      case 'В обработке': return 'warning';
      case 'Завершена': return 'success';
      case 'Отклонена': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: 'grey.50' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Компания</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Дата создания</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Маршрут</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">Нет новых заявок для обработки</TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">{request.company.name}</Typography>
                <Typography variant="caption" color="text.secondary">{request.createdByUser.username}</Typography>
              </TableCell>
              <TableCell>
                {DateTime.fromISO(request.createdAt).toLocaleString(DateTime.DATE_MED)}
              </TableCell>
              <TableCell>
                {request.pickupAddress.city} → {request.deliveryAddress.city}
              </TableCell>
              <TableCell>
                <Chip label={request.status.name} color={getStatusColor(request.status.name) as any} size="small" />
              </TableCell>
              <TableCell>
                {request.status.name === 'Новая' && (
                  <Button
                    component={Link}
                    to={`/logistician/process-request/${request.id}`}
                    variant="outlined"
                    size="small"
                  >
                    Обработать
                  </Button>
                )}
              </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LogisticianRequestsTable;
