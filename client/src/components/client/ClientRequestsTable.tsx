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
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { LogisticRequest } from '../../types';
import { requestService } from '../../services/request.service';
import { DateTime } from 'luxon';

const ClientRequestsTable: React.FC = () => {
  const [requests, setRequests] = useState<LogisticRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    fetchRequests();
  }, []);

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
            <TableCell sx={{ fontWeight: 'bold' }}>Дата создания</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Маршрут</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Груз</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Стоимость (предв.)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">Нет доступных заявок</TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  {DateTime.fromISO(request.createdAt).toLocaleString(DateTime.DATE_MED)}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {request.pickupAddress.city} → {request.deliveryAddress.city}
                  </Typography>
                </TableCell>
                <TableCell>
                  {request.cargos.map(c => `${c.name} (${c.weight}кг)`).join(', ')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.status.name}
                    color={getStatusColor(request.status.name) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {request.preliminaryCost ? `${request.preliminaryCost} ₽` : 'Ожидает расчета'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClientRequestsTable;
