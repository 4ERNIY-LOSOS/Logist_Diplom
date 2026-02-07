import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
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
  Button,
  Chip
} from '@mui/material';

// Interfaces remain the same for now
interface Request {
  id: string;
  pickupDate: string;
  deliveryDate: string;
  status: { name: string };
  company: { name: string };
  createdByUser: { username: string };
}

const getStatusChipColor = (statusName: string) => {
    switch (statusName) {
      case 'Новая': return 'primary';
      case 'В обработке': return 'info';
      default: return 'default';
    }
  };

const LogisticianRequestsTable: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/request');
        const filteredRequests = response.data.filter(
          (req: Request) => req.status?.name === 'Новая' || req.status?.name === 'В обработке'
        );
        setRequests(filteredRequests);
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
      <Typography variant="h5" gutterBottom>Заявки для обработки</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="logistician requests table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Клиент</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата забора</TableCell>
              <TableCell>Дата доставки</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} align="center">Новых заявок для обработки не найдено.</TableCell>
                </TableRow>
            ) : (
                requests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell title={request.id}>{request.id.substring(0, 8)}...</TableCell>
                    <TableCell>{request.company?.name || 'N/A'}</TableCell>
                    <TableCell>
                        <Chip label={request.status?.name || 'N/A'} color={getStatusChipColor(request.status?.name)} size="small" />
                    </TableCell>
                    <TableCell>{new Date(request.pickupDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(request.deliveryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/logistician/process-request/${request.id}`)}
                      >
                        Обработать
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LogisticianRequestsTable;
