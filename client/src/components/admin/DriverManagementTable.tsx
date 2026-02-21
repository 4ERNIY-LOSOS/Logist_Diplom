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
import { shipmentService } from '../../services/shipment.service';
import type { Driver } from '../../types';

const DriverStatus = {
  AVAILABLE: 'AVAILABLE',
  BUSY: 'BUSY',
  ON_LEAVE: 'ON_LEAVE',
} as const;

type DriverStatusType = (typeof DriverStatus)[keyof typeof DriverStatus];

export const DriverManagementTable: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Partial<Driver> | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await shipmentService.getDrivers();
      setDrivers(data);
    } catch (err) {
      setError('Failed to fetch drivers.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentDriver({ firstName: '', lastName: '', licenseNumber: '', phone: '', status: DriverStatus.AVAILABLE, isAvailable: true });
    setOpenDialog(true);
  };

  const handleEditClick = (driver: Driver) => {
    setCurrentDriver({ ...driver });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setCurrentDriver(null);
  };

  const handleSave = async () => {
    if (!currentDriver) return;
    try {
      if (currentDriver.id) {
        await shipmentService.updateDriver(currentDriver.id, currentDriver);
      } else {
        await shipmentService.createDriver(currentDriver);
      }
      handleDialogClose();
      fetchDrivers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save driver.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await shipmentService.deleteDriver(id);
        fetchDrivers();
      } catch (err) {
        setError('Failed to delete driver.');
      }
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Управление водителями</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Добавить водителя
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Фамилия</TableCell>
              <TableCell>Лицензия</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Доступен</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>{driver.firstName}</TableCell>
                <TableCell>{driver.lastName}</TableCell>
                <TableCell>{driver.licenseNumber}</TableCell>
                <TableCell>{driver.phone || '-'}</TableCell>
                <TableCell>
                    <Chip
                        label={driver.status}
                        color={driver.status === DriverStatus.AVAILABLE ? 'success' : driver.status === DriverStatus.BUSY ? 'primary' : 'warning'}
                        size="small"
                    />
                </TableCell>
                <TableCell>{driver.isAvailable ? 'Да' : 'Нет'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(driver)} color="primary"><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(driver.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{currentDriver?.id ? 'Редактировать водителя' : 'Добавить водителя'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: '300px' }}>
            <TextField label="Имя" value={currentDriver?.firstName} onChange={(e) => setCurrentDriver({ ...currentDriver, firstName: e.target.value })} fullWidth />
            <TextField label="Фамилия" value={currentDriver?.lastName} onChange={(e) => setCurrentDriver({ ...currentDriver, lastName: e.target.value })} fullWidth />
            <TextField label="Номер лицензии" value={currentDriver?.licenseNumber} onChange={(e) => setCurrentDriver({ ...currentDriver, licenseNumber: e.target.value })} fullWidth />
            <TextField label="Телефон" value={currentDriver?.phone} onChange={(e) => setCurrentDriver({ ...currentDriver, phone: e.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={currentDriver?.status}
                label="Статус"
                onChange={(e) => setCurrentDriver({ ...currentDriver, status: e.target.value as DriverStatusType })}
              >
                <MenuItem value={DriverStatus.AVAILABLE}>Available</MenuItem>
                <MenuItem value={DriverStatus.BUSY}>Busy</MenuItem>
                <MenuItem value={DriverStatus.ON_LEAVE}>On Leave</MenuItem>
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
