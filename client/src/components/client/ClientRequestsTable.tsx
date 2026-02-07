import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';

// Interfaces remain the same for now
interface Address { id: string; country: string; city: string; street: string; houseNumber: string; }
interface Cargo { id: string; name: string; weight: number; volume: number; }
interface RequestStatus { id: string; name: string; }
interface Request {
  id: string;
  pickupDate: string;
  deliveryDate: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  cargos: Cargo[];
  status: RequestStatus;
  preliminaryCost?: number;
  createdAt: string;
}

const getStatusChipColor = (statusName: string) => {
  switch (statusName) {
    case 'Новая': return 'primary';
    case 'В обработке': return 'info';
    case 'Завершена': return 'success';
    case 'Отклонена': return 'error';
    default: return 'default';
  }
};


const ClientRequestsTable: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/request');
        setRequests(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Не удалось загрузить заявки.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" gutterBottom>Мои заявки</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="client requests table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Забор</TableCell>
              <TableCell>Доставка</TableCell>
              <TableCell>Груз</TableCell>
              <TableCell>Стоимость</TableCell>
              <TableCell>Создана</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} align="center">Заявки не найдены.</TableCell>
                </TableRow>
            ) : (
                requests.map((request) => (
                  <TableRow key={request.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row" title={request.id}>
                      {request.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Chip label={request.status?.name || 'N/A'} color={getStatusChipColor(request.status?.name)} size="small" />
                    </TableCell>
                    <TableCell>
                        {`${request.pickupAddress?.city}, ${request.pickupAddress?.street}`}<br/>
                        <Typography variant="caption">{new Date(request.pickupDate).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell>
                        {`${request.deliveryAddress?.city}, ${request.deliveryAddress?.street}`}<br/>
                        <Typography variant="caption">{new Date(request.deliveryDate).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell>
                      {request.cargos.map(c => c.name).join(', ')} ({request.cargos.reduce((acc, c) => acc + c.weight, 0)} кг)
                    </TableCell>
                    <TableCell>{request.preliminaryCost ? `${request.preliminaryCost.toFixed(2)} ₽` : 'N/A'}</TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClientRequestsTable;
