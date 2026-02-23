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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import type { LogisticRequest } from '../../types';
import { requestService } from '../../services/request.service';
import { DateTime } from 'luxon';

const ClientRequestsTable: React.FC = () => {
  const [requests, setRequests] = useState<LogisticRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await requestService.getAll();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке заявок');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDeleteClick = (id: string) => {
    setRequestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!requestToDelete) return;
    try {
      await requestService.delete(requestToDelete);
      setRequests(requests.filter(r => r.id !== requestToDelete));
      setDeleteDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении заявки');
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      await requestService.update(id, { statusName: 'Отклонена' });
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Ошибка при отмене заявки');
    }
  };

  const getStatusColor = (status: string): 'info' | 'warning' | 'success' | 'error' | 'default' => {
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
    <>
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: 'grey.50' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Дата создания</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Маршрут</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Груз</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Стоимость (предв.)</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
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
                    color={getStatusColor(request.status.name)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {request.preliminaryCost ? `${request.preliminaryCost} ₽` : 'Ожидает расчета'}
                </TableCell>
                <TableCell>
                  {request.status.name === 'Новая' ? (
                    <Tooltip title="Удалить заявку">
                      <IconButton color="error" size="small" onClick={() => handleDeleteClick(request.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : request.status.name === 'В обработке' ? (
                    <Tooltip title="Отменить заявку">
                      <IconButton color="warning" size="small" onClick={() => handleCancelRequest(request.id)}>
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>

    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
      <DialogTitle>Удаление заявки</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Вы уверены, что хотите полностью удалить эту заявку? Это действие необратимо.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
        <Button onClick={confirmDelete} color="error" variant="contained">Удалить</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default ClientRequestsTable;
