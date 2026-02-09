import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../../api/api';

interface Tariff {
  id: string;
  name: string;
  costPerKm: number;
  costPerKg: number;
  costPerM3: number;
  baseFee: number;
  isActive: boolean;
}

export const TariffManagementTable: React.FC = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTariff, setCurrentTariff] = useState<Tariff | null>(null);
  const [isNewTariff, setIsNewTariff] = useState(false);

  useEffect(() => {
    fetchTariffs();
  }, []);

  const fetchTariffs = async () => {
    setLoading(true);
    try {
      const response = await api.get<Tariff[]>('/tariff');
      setTariffs(response.data);
    } catch (err) {
      setError('Failed to fetch tariffs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentTariff({ id: '', name: '', costPerKm: 0, costPerKg: 0, costPerM3: 0, baseFee: 0, isActive: true });
    setIsNewTariff(true);
    setOpenDialog(true);
  };

  const handleEditClick = (tariff: Tariff) => {
    setCurrentTariff({ ...tariff });
    setIsNewTariff(false);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setCurrentTariff(null);
    setIsNewTariff(false);
  };

  const handleDialogSave = async () => {
    if (!currentTariff) return;
    try {
      if (isNewTariff) {
        await api.post('/tariff', {
            ...currentTariff,
            costPerKm: Number(currentTariff.costPerKm),
            costPerKg: Number(currentTariff.costPerKg),
            costPerM3: Number(currentTariff.costPerM3),
            baseFee: Number(currentTariff.baseFee),
        });
      } else {
        await api.patch(`/tariff/${currentTariff.id}`, {
            ...currentTariff,
            costPerKm: Number(currentTariff.costPerKm),
            costPerKg: Number(currentTariff.costPerKg),
            costPerM3: Number(currentTariff.costPerM3),
            baseFee: Number(currentTariff.baseFee),
        });
      }
      handleDialogClose();
      fetchTariffs();
    } catch (err) {
      setError(`Failed to ${isNewTariff ? 'create' : 'update'} tariff.`);
      console.error(err);
    }
  };

  const handleDeleteTariff = async (tariffId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тариф?')) {
      try {
        await api.delete(`/tariff/${tariffId}`);
        fetchTariffs();
      } catch (err) {
        setError('Failed to delete tariff.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Добавить тариф
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Название</TableCell>
            <TableCell>Стоимость/км</TableCell>
            <TableCell>Стоимость/кг</TableCell>
            <TableCell>Стоимость/м³</TableCell>
            <TableCell>Базовая плата</TableCell>
            <TableCell>Активен</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tariffs.map((tariff) => (
            <TableRow key={tariff.id}>
              <TableCell>{tariff.id.substring(0, 8)}...</TableCell>
              <TableCell>{tariff.name}</TableCell>
              <TableCell>{tariff.costPerKm.toFixed(2)}</TableCell>
              <TableCell>{tariff.costPerKg.toFixed(2)}</TableCell>
              <TableCell>{tariff.costPerM3.toFixed(2)}</TableCell>
              <TableCell>{tariff.baseFee.toFixed(2)}</TableCell>
              <TableCell>
                <Switch
                  checked={tariff.isActive}
                  onChange={async (e) => {
                    const originalIsActive = tariff.isActive;
                    setTariffs(prev => prev.map(t => t.id === tariff.id ? { ...t, isActive: e.target.checked } : t));
                    try {
                      await api.patch(`/tariff/${tariff.id}`, { isActive: e.target.checked });
                    } catch (err) {
                      setError('Failed to update tariff status.');
                      console.error(err);
                      setTariffs(prev => prev.map(t => t.id === tariff.id ? { ...t, isActive: originalIsActive } : t));
                    }
                  }}
                  color="primary"
                />
              </TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleEditClick(tariff)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteTariff(tariff.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{isNewTariff ? 'Добавить тариф' : 'Редактировать тариф'}</DialogTitle>
        <DialogContent>
          {currentTariff && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Название"
                value={currentTariff.name}
                onChange={(e) => setCurrentTariff({ ...currentTariff, name: e.target.value })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Стоимость за км"
                type="number"
                value={currentTariff.costPerKm}
                onChange={(e) => setCurrentTariff({ ...currentTariff, costPerKm: Number(e.target.value) })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Стоимость за кг"
                type="number"
                value={currentTariff.costPerKg}
                onChange={(e) => setCurrentTariff({ ...currentTariff, costPerKg: Number(e.target.value) })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Стоимость за м³"
                type="number"
                value={currentTariff.costPerM3}
                onChange={(e) => setCurrentTariff({ ...currentTariff, costPerM3: Number(e.target.value) })}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Базовая плата"
                type="number"
                value={currentTariff.baseFee}
                onChange={(e) => setCurrentTariff({ ...currentTariff, baseFee: Number(e.target.value) })}
                fullWidth
                margin="dense"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={currentTariff.isActive}
                    onChange={(e) => setCurrentTariff({ ...currentTariff, isActive: e.target.checked })}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Активен"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Отмена</Button>
          <Button onClick={handleDialogSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};
