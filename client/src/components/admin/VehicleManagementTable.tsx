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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../../api/api';

const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  BUSY: 'BUSY',
  MAINTENANCE: 'MAINTENANCE',
} as const;

type VehicleStatusType = (typeof VehicleStatus)[keyof typeof VehicleStatus];

interface Vehicle {
  id: string;
  licensePlate: string;
  model: string;
  payloadCapacity: number;
  volumeCapacity: number;
  status: VehicleStatusType;
  isAvailable: boolean;
  type?: { id: string; name: string };
}

export const VehicleManagementTable: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Partial<Vehicle> & { typeId?: string } | null>(null);

  useEffect(() => {
    fetchVehicles();
    fetchVehicleTypes();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicle');
      setVehicles(response.data.data || response.data);
    } catch (err) {
      setError('Failed to fetch vehicles.');
    }
  };

  const fetchVehicleTypes = async () => {
    try {
      // Assuming there is an endpoint or just static types for now
      // Let's check if there is a vehicle type controller/service later if this fails
      // For now, let's assume it's part of the seeding or another endpoint
      const response = await api.get('/vehicle/types');
      setVehicleTypes(response.data);
    } catch (err) {
      console.warn('Could not fetch vehicle types');
    } finally {
        setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentVehicle({ licensePlate: '', model: '', payloadCapacity: 0, volumeCapacity: 0, status: VehicleStatus.AVAILABLE, isAvailable: true });
    setOpenDialog(true);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setCurrentVehicle({ ...vehicle, typeId: vehicle.type?.id });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setCurrentVehicle(null);
  };

  const handleSave = async () => {
    if (!currentVehicle) return;

    // Create a clean data object with only the properties the backend expects
    const vehicleData = {
      licensePlate: currentVehicle.licensePlate,
      model: currentVehicle.model,
      payloadCapacity: currentVehicle.payloadCapacity,
      volumeCapacity: currentVehicle.volumeCapacity,
      typeId: currentVehicle.typeId,
      // Do not include 'id', 'status', 'isAvailable', or the nested 'type' object
    };

    try {
      if (currentVehicle.id) {
        await api.patch(`/vehicle/${currentVehicle.id}`, vehicleData);
      } else {
        await api.post('/vehicle', vehicleData);
      }
      handleDialogClose();
      fetchVehicles();
    } catch (err: any) {
      const errorMessage = Array.isArray(err.response?.data?.message)
        ? err.response.data.message.join(', ')
        : err.response?.data?.message || 'Failed to save vehicle.';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.delete(`/vehicle/${id}`);
        fetchVehicles();
      } catch (err) {
        setError('Failed to delete vehicle.');
      }
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Управление транспортом</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Добавить транспорт
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Госномер</TableCell>
              <TableCell>Модель</TableCell>
              <TableCell>Грузоподъемность (кг)</TableCell>
              <TableCell>Объем (м³)</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.licensePlate}</TableCell>
                <TableCell>{v.model}</TableCell>
                <TableCell>{v.payloadCapacity}</TableCell>
                <TableCell>{v.volumeCapacity}</TableCell>
                <TableCell>
                    <Chip
                        label={v.status}
                        color={v.status === VehicleStatus.AVAILABLE ? 'success' : v.status === VehicleStatus.BUSY ? 'primary' : 'warning'}
                        size="small"
                    />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(v)} color="primary"><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(v.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{currentVehicle?.id ? 'Редактировать транспорт' : 'Добавить транспорт'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: '300px' }}>
            <TextField label="Госномер" value={currentVehicle?.licensePlate} onChange={(e) => setCurrentVehicle({ ...currentVehicle, licensePlate: e.target.value })} fullWidth />
            <TextField label="Модель" value={currentVehicle?.model} onChange={(e) => setCurrentVehicle({ ...currentVehicle, model: e.target.value })} fullWidth />
            <TextField label="Грузоподъемность (кг)" type="number" value={currentVehicle?.payloadCapacity} onChange={(e) => setCurrentVehicle({ ...currentVehicle, payloadCapacity: Number(e.target.value) })} fullWidth />
            <TextField label="Объем (м³)" type="number" value={currentVehicle?.volumeCapacity} onChange={(e) => setCurrentVehicle({ ...currentVehicle, volumeCapacity: Number(e.target.value) })} fullWidth />

            <FormControl fullWidth>
                <InputLabel>Тип (если есть)</InputLabel>
                <Select
                    value={currentVehicle?.typeId || ''}
                    label="Тип"
                    onChange={(e) => setCurrentVehicle({ ...currentVehicle, typeId: e.target.value })}
                >
                    {vehicleTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={currentVehicle?.status}
                label="Статус"
                onChange={(e) => setCurrentVehicle({ ...currentVehicle, status: e.target.value as VehicleStatusType })}
              >
                <MenuItem value={VehicleStatus.AVAILABLE}>Available</MenuItem>
                <MenuItem value={VehicleStatus.BUSY}>Busy</MenuItem>
                <MenuItem value={VehicleStatus.MAINTENANCE}>Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
